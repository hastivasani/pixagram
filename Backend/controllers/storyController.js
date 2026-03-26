const Story = require("../models/Story");
const User = require("../models/User");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Media required" });
    const isVideo = req.file.mimetype.startsWith("video");
    const result = await uploadToCloudinary(req.file.buffer, "pixagram/stories", isVideo ? "video" : "image");

    const story = await Story.create({
      user: req.user._id,
      mediaUrl: result.secure_url,
      mediaType: isVideo ? "video" : "image",
    });

    const populated = await story.populate("user", "username avatar");

    // Notify followers in real-time
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const me = await User.findById(req.user._id);
    if (me) {
      me.followers.forEach((fid) => {
        const sid = onlineUsers?.get(fid.toString());
        if (sid) io.to(sid).emit("newStory", populated);
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStories = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const stories = await Story.find({
      user: { $in: [...me.following, me._id] },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar");
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.viewStory = async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, { $addToSet: { viewers: req.user._id } });
    res.json({ message: "Viewed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStoryViewers = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate("viewers", "username avatar name")
      .populate("reactions.user", "username avatar")
      .populate("comments.user", "username avatar");
    if (!story) return res.status(404).json({ message: "Story not found" });
    if (story.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your story" });
    res.json({
      viewers:   story.viewers,
      reactions: story.reactions,
      comments:  story.comments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reactToStory = async (req, res) => {
  try {
    const { emoji } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Remove existing reaction from this user, then add new
    story.reactions = story.reactions.filter(r => r.user.toString() !== req.user._id.toString());
    if (emoji) story.reactions.push({ user: req.user._id, emoji });
    await story.save();

    // Notify story owner via socket
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const sid = onlineUsers?.get(story.user.toString());
    if (sid) io.to(sid).emit("storyReaction", { storyId: story._id, user: req.user, emoji });

    res.json({ message: "Reacted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.commentOnStory = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Text required" });
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    story.comments.push({ user: req.user._id, text: text.trim() });
    await story.save();

    const populated = await Story.findById(story._id)
      .populate("comments.user", "username avatar");
    const newComment = populated.comments[populated.comments.length - 1];

    // Notify story owner via socket
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const sid = onlineUsers?.get(story.user.toString());
    if (sid) io.to(sid).emit("storyComment", { storyId: story._id, comment: newComment, sender: req.user });

    res.json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
