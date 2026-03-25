const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.createPost = async (req, res) => {
  try {
    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
    if (!files.length) return res.status(400).json({ message: "Media required" });

    const { caption } = req.body;

    // Upload all files to Cloudinary in parallel
    const uploads = await Promise.all(
      files.map((file) => {
        const isVideo = file.mimetype.startsWith("video");
        return uploadToCloudinary(file.buffer, "pixagram/posts", isVideo ? "video" : "image")
          .then((result) => ({ result, isVideo }));
      })
    );

    // Create all posts in parallel
    const posts = await Promise.all(
      uploads.map(({ result, isVideo }) =>
        Post.create({
          user: req.user._id,
          mediaUrl: result.secure_url,
          mediaType: isVideo ? "video" : "image",
          caption,
        })
      )
    );

    // Populate all in parallel
    const populated = await Promise.all(
      posts.map((p) => p.populate("user", "username avatar"))
    );

    // Notify followers
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const me = await User.findById(req.user._id);
    if (me) {
      me.followers.forEach((followerId) => {
        const socketId = onlineUsers?.get(followerId.toString());
        if (socketId) populated.forEach((p) => io.to(socketId).emit("newPost", p));
      });
    }

    res.status(201).json(populated.length === 1 ? populated[0] : populated);
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const page  = parseInt(req.query.page) || 1;
    const limit = 20; // increased from 10

    const followingIds = me.following.map(String);

    // Show posts from everyone I follow + my own, sorted newest first
    const query = followingIds.length > 0
      ? { user: { $in: [...followingIds, me._id.toString()] } }
      : { user: me._id };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "username avatar")
        .populate({ path: "comments", populate: { path: "user", select: "username avatar" } }),
      Post.countDocuments(query),
    ]);

    res.json({ posts, total, page, hasMore: page * limit < total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExplorePosts = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const blocked = me.blockedUsers || [];
    const posts = await Post.find({
      user: { $nin: [...me.following, me._id, ...blocked] },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("user", "username avatar");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.includes(req.user._id);
    if (liked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.addToSet(req.user._id);
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({ recipient: post.user, sender: req.user._id, type: "like", post: post._id });
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const socketId = onlineUsers?.get(post.user.toString());
        if (socketId) io.to(socketId).emit("newNotification", { type: "like", sender: req.user, post: post._id });
      }
    }
    await post.save();
    // Broadcast like update to all connected clients
    const io = req.app.get("io");
    io.emit("postLiked", { postId: post._id, likes: post.likes });
    res.json({ likes: post.likes, liked: !liked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({ post: post._id, user: req.user._id, text });
    post.comments.push(comment._id);
    await post.save();

    const populated = await comment.populate("user", "username avatar");

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({ recipient: post.user, sender: req.user._id, type: "comment", post: post._id });
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");
      const socketId = onlineUsers?.get(post.user.toString());
      if (socketId) io.to(socketId).emit("newNotification", { type: "comment", sender: req.user, post: post._id });
    }

    const io = req.app.get("io");
    io.emit("newComment", { postId: post._id, comment: populated });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
