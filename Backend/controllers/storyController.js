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
