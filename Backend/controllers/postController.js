const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Hashtag = require("../models/Hashtag");
const User = require("../models/User");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// Extract hashtags from caption
const extractHashtags = (caption = "") =>
  [...new Set((caption.match(/#(\w+)/g) || []).map(t => t.slice(1).toLowerCase()))];

// Update hashtag counts
const updateHashtags = async (tags, postId) => {
  for (const tag of tags) {
    await Hashtag.findOneAndUpdate(
      { tag },
      { $inc: { count: 1 }, $addToSet: { posts: postId } },
      { upsert: true }
    );
  }
};

exports.createPost = async (req, res) => {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    if (!files.length && req.body.type !== "text")
      return res.status(400).json({ message: "Media required" });

    const { caption, visibility, type } = req.body;
    const hashtags = extractHashtags(caption);
    const source = req.body.source || "post";
    // Twitter posts expire after 24 hours
    const twitterExpiresAt = source === "twitter" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    let posts = [];

    if (type === "carousel" && files.length > 1) {
      // Carousel post
      const uploads = await Promise.all(
        files.map(f => {
          const isVideo = f.mimetype.startsWith("video");
          return uploadToCloudinary(f.buffer, "pixagram/posts", isVideo ? "video" : "image")
            .then(r => ({ url: r.secure_url, type: isVideo ? "video" : "image" }));
        })
      );
      const post = await Post.create({
        user: req.user._id, caption, hashtags,
        mediaType: "carousel",
        carouselMedia: uploads,
        visibility: visibility || "public",
        source,
        twitterExpiresAt,
      });
      await updateHashtags(hashtags, post._id);
      posts = [await post.populate("user", "username avatar")];
    } else if (type === "text") {
      const post = await Post.create({
        user: req.user._id, caption, hashtags,
        mediaType: "text", mediaUrl: "",
        visibility: visibility || "public",
        source,
        twitterExpiresAt,
      });
      await updateHashtags(hashtags, post._id);
      posts = [await post.populate("user", "username avatar")];
    } else {
      const uploads = await Promise.all(
        files.map(f => {
          const isVideo = f.mimetype.startsWith("video");
          return uploadToCloudinary(f.buffer, "pixagram/posts", isVideo ? "video" : "image")
            .then(r => ({ result: r, isVideo }));
        })
      );
      posts = await Promise.all(
        uploads.map(({ result, isVideo }) =>
          Post.create({
            user: req.user._id, caption, hashtags,
            mediaUrl: result.secure_url,
            mediaType: isVideo ? "video" : "image",
            visibility: visibility || "public",
            source,
            twitterExpiresAt,
          })
        )
      );
      for (const p of posts) await updateHashtags(hashtags, p._id);
      posts = await Promise.all(posts.map(p => p.populate("user", "username avatar")));
    }

    // Notify followers
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const me = await User.findById(req.user._id);
    if (me) {
      me.followers.forEach(fid => {
        const sid = onlineUsers?.get(fid.toString());
        if (sid) posts.forEach(p => io.to(sid).emit("newPost", p));
      });
    }

    res.status(201).json(posts.length === 1 ? posts[0] : posts);
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const followingIds = me.following.map(String);
    const twitterOnly = req.query.twitter === "1";
    const excludeTwitter = req.query.notwitter === "1";

    const query = followingIds.length > 0
      ? { user: { $in: [...followingIds, me._id.toString()] }, visibility: { $ne: "private" } }
      : { user: me._id };

    if (twitterOnly)    query.source = "twitter";
    // excludeTwitter: show posts where source is NOT twitter
    // Also include posts where source is null/undefined (old posts before source field was added)
    if (excludeTwitter) query.$or = [
      { source: { $exists: false } },
      { source: null },
      { source: { $nin: ["twitter"] } },
    ];

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "username avatar isVerified")
        .populate("originalPost")
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
    const twitterOnly = req.query.twitter === "1";

    const query = {
      user: { $nin: [...me.following, me._id, ...blocked] },
      visibility: "public",
    };
    if (twitterOnly) query.source = "twitter";
    else query.source = { $ne: "twitter" }; // never show twitter posts on explore

    const posts = await Post.find(query)
      .sort({ aiScore: -1, createdAt: -1 })
      .limit(50)
      .populate("user", "username avatar isVerified");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      user: req.params.userId,
      source: { $ne: "twitter" }, // exclude twitter posts from profile
    })
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
      // Update AI score
      post.aiScore = (post.aiScore || 0) + 2;
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({ recipient: post.user, sender: req.user._id, type: "like", post: post._id });
        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const sid = onlineUsers?.get(post.user.toString());
        if (sid) io.to(sid).emit("newNotification", { type: "like", sender: req.user, post: post._id });
      }
    }
    await post.save();
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
    post.aiScore = (post.aiScore || 0) + 1;
    await post.save();

    const populated = await comment.populate("user", "username avatar");

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({ recipient: post.user, sender: req.user._id, type: "comment", post: post._id });
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");
      const sid = onlineUsers?.get(post.user.toString());
      if (sid) io.to(sid).emit("newNotification", { type: "comment", sender: req.user, post: post._id });
    }

    const io = req.app.get("io");
    io.emit("newComment", { postId: post._id, comment: populated });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Repost
exports.repostPost = async (req, res) => {
  try {
    const original = await Post.findById(req.params.id);
    if (!original) return res.status(404).json({ message: "Post not found" });

    const alreadyReposted = original.reposts.map(String).includes(req.user._id.toString());
    if (alreadyReposted) {
      original.reposts.pull(req.user._id);
      await original.save();
      // Remove repost post
      await Post.deleteOne({ user: req.user._id, originalPost: original._id, isRepost: true });
      return res.json({ status: "unreposted", reposts: original.reposts });
    }

    original.reposts.addToSet(req.user._id);
    await original.save();

    const repost = await Post.create({
      user: req.user._id,
      isRepost: true,
      originalPost: original._id,
      caption: req.body.caption || "",
      mediaUrl: original.mediaUrl,
      mediaType: original.mediaType,
      visibility: "public",
      source: original.source || "post", // inherit source from original
    });

    const populated = await repost.populate(["user", { path: "originalPost", populate: { path: "user", select: "username avatar" } }]);

    if (original.user.toString() !== req.user._id.toString()) {
      await Notification.create({ recipient: original.user, sender: req.user._id, type: "repost", post: original._id });
    }

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const me = await User.findById(req.user._id);
    me.followers.forEach(fid => {
      const sid = onlineUsers?.get(fid.toString());
      if (sid) io.to(sid).emit("newPost", populated);
    });

    res.status(201).json({ status: "reposted", reposts: original.reposts, repost: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get posts by hashtag
exports.getPostsByHashtag = async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase();
    const posts = await Post.find({
      hashtags: tag,
      visibility: "public",
      source: { $ne: "twitter" }, // exclude twitter posts from hashtag pages
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("user", "username avatar");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Trending hashtags
exports.getTrendingHashtags = async (req, res) => {
  try {
    const tags = await Hashtag.find().sort({ count: -1 }).limit(30);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Trending posts (most liked/commented in last 7 days)
exports.getTrendingPosts = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const me = await User.findById(req.user._id);
    const blocked = me?.blockedUsers || [];
    const posts = await Post.find({
      visibility: "public",
      createdAt: { $gte: since },
      user: { $nin: blocked },
      source: { $ne: "twitter" }, // exclude twitter posts from trending
    })
      .sort({ aiScore: -1, createdAt: -1 })
      .limit(50)
      .populate("user", "username avatar isVerified");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Trending creators (most followers)
exports.getTrendingCreators = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const blocked = me?.blockedUsers || [];
    // Use aggregation to sort by followers array length properly
    const users = await User.aggregate([
      {
        $match: {
          _id: { $nin: [...blocked.map(id => id), req.user._id] },
        },
      },
      {
        $addFields: { followerCount: { $size: { $ifNull: ["$followers", []] } } },
      },
      { $sort: { followerCount: -1 } },
      { $limit: 20 },
      {
        $project: {
          username: 1, avatar: 1, name: 1, bio: 1,
          isVerified: 1, followers: 1, following: 1,
        },
      },
    ]);
    res.json(users);
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

// Save / unsave post
exports.savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const saved = post.saves?.map(String).includes(req.user._id.toString());
    if (saved) post.saves.pull(req.user._id);
    else post.saves.addToSet(req.user._id);
    await post.save();
    res.json({ saved: !saved, saves: post.saves });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Vote on poll
exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || post.mediaType !== "poll") return res.status(404).json({ message: "Poll not found" });
    if (post.poll.endsAt && new Date() > post.poll.endsAt) return res.status(400).json({ message: "Poll ended" });

    // Remove existing vote
    post.poll.options.forEach(opt => { opt.votes.pull(req.user._id); });
    // Add new vote
    if (post.poll.options[optionIndex]) {
      post.poll.options[optionIndex].votes.addToSet(req.user._id);
    }
    await post.save();
    res.json(post.poll);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Get scheduled posts
exports.getScheduledPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id, isPublished: false }).sort({ scheduledAt: 1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Publish scheduled post
exports.publishScheduled = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isPublished: true },
      { new: true }
    );
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Edit post (caption + visibility only — media stays)
exports.editPost = async (req, res) => {
  try {
    const { caption, visibility } = req.body;
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (caption !== undefined) {
      post.caption = caption;
      post.hashtags = extractHashtags(caption);
      await updateHashtags(post.hashtags, post._id);
    }
    if (visibility) post.visibility = visibility;
    await post.save();

    const populated = await post.populate("user", "username avatar");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Quote repost (repost with added caption/comment)
exports.quotePost = async (req, res) => {
  try {
    const { caption } = req.body;
    if (!caption) return res.status(400).json({ message: "Caption required for quote post" });

    const original = await Post.findById(req.params.id);
    if (!original) return res.status(404).json({ message: "Post not found" });

    const hashtags = extractHashtags(caption);
    const quote = await Post.create({
      user: req.user._id,
      isRepost: true,
      originalPost: original._id,
      caption,
      hashtags,
      mediaUrl: original.mediaUrl,
      mediaType: original.mediaType,
      visibility: "public",
      source: original.source || "post",
    });

    await updateHashtags(hashtags, quote._id);
    original.reposts.addToSet(req.user._id);
    await original.save();

    const populated = await quote.populate([
      "user",
      { path: "originalPost", populate: { path: "user", select: "username avatar" } },
    ]);

    if (original.user.toString() !== req.user._id.toString()) {
      await Notification.create({ recipient: original.user, sender: req.user._id, type: "repost", post: original._id });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all comments for a post (with nested replies)
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.id,
      parentComment: null, // top-level only
    })
      .populate("user", "username avatar isVerified")
      .populate({
        path: "replies",
        populate: { path: "user", select: "username avatar isVerified" },
      })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reply to a comment
exports.replyComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Reply text required" });

    const parent = await Comment.findById(req.params.commentId);
    if (!parent) return res.status(404).json({ message: "Comment not found" });

    const reply = await Comment.create({
      post: parent.post,
      user: req.user._id,
      text,
      parentComment: parent._id,
    });

    parent.replies.push(reply._id);
    await parent.save();

    const populated = await reply.populate("user", "username avatar isVerified");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const liked = comment.likes.map(String).includes(req.user._id.toString());
    if (liked) comment.likes.pull(req.user._id);
    else comment.likes.addToSet(req.user._id);
    await comment.save();
    res.json({ liked: !liked, likes: comment.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
