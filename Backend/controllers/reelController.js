const Reel = require("../models/Reel");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.createReel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Video required" });
    const { caption } = req.body;
    const result = await uploadToCloudinary(req.file.buffer, "pixagram/reels", "video");

    const reel = await Reel.create({ user: req.user._id, videoUrl: result.secure_url, caption });
    const populated = await reel.populate("user", "username avatar");

    // Notify all users in real-time
    const io = req.app.get("io");
    io.emit("newReel", populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "username avatar")
      .populate({ path: "comments", populate: { path: "user", select: "username avatar" } });
    res.json(reels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    const liked = reel.likes.includes(req.user._id);
    if (liked) reel.likes.pull(req.user._id);
    else {
      reel.likes.addToSet(req.user._id);
      if (reel.user.toString() !== req.user._id.toString()) {
        await Notification.create({ recipient: reel.user, sender: req.user._id, type: "like", reel: reel._id });
      }
    }
    await reel.save();
    res.json({ likes: reel.likes, liked: !liked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.commentReel = async (req, res) => {
  try {
    const { text } = req.body;
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    const comment = await Comment.create({ post: reel._id, onModel: "Reel", user: req.user._id, text });
    reel.comments.push(comment._id);
    await reel.save();

    const populated = await comment.populate("user", "username avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
