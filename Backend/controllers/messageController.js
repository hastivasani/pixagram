const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, type, isDisappearing, disappearAfter, replyTo } = req.body;
    let mediaUrl = "";

    if (req.file) {
      const folder = type === "voice" ? "pixagram/voice" : "pixagram/messages";
      const resource = type === "voice" ? "video" : "image"; // cloudinary uses "video" for audio
      const result = await uploadToCloudinary(req.file.buffer, folder, resource);
      mediaUrl = result.secure_url;
    }

    if (!text && !mediaUrl) return res.status(400).json({ message: "Message content required" });

    const msgData = {
      sender: req.user._id,
      receiver: receiverId,
      type: type || "text",
      text: text || "",
      mediaUrl,
      imageUrl: mediaUrl, // backward compat
      replyTo: replyTo || null,
    };

    // Disappearing message
    if (isDisappearing === "true" || isDisappearing === true) {
      msgData.isDisappearing = true;
      const seconds = parseInt(disappearAfter) || 30;
      msgData.expiresAt = new Date(Date.now() + seconds * 1000);
    }

    const message = await Message.create(msgData);
    const populated = await message.populate([
      { path: "sender", select: "username avatar" },
      { path: "replyTo", populate: { path: "sender", select: "username avatar" } },
    ]);

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const socketId = onlineUsers?.get(receiverId);
    if (socketId) io.to(socketId).emit("newMessage", populated);

    await Notification.create({ recipient: receiverId, sender: req.user._id, type: "message" });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar")
      .populate({ path: "replyTo", populate: { path: "sender", select: "username avatar" } });

    await Message.updateMany(
      { sender: userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConversationList = async (req, res) => {
  try {
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username avatar name")
      .populate("receiver", "username avatar name");

    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      const other = msg.sender._id.toString() === myId.toString() ? msg.receiver : msg.sender;
      if (!seen.has(other._id.toString())) {
        seen.add(other._id.toString());
        const unread = await Message.countDocuments({ sender: other._id, receiver: myId, read: false });
        conversations.push({ user: other, lastMessage: msg, unread });
      }
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// React to message
exports.reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    msg.reactions = msg.reactions.filter(r => r.user.toString() !== req.user._id.toString());
    if (emoji) msg.reactions.push({ user: req.user._id, emoji });
    await msg.save();

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const otherId = msg.sender.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
    const sid = onlineUsers?.get(otherId.toString());
    if (sid) io.to(sid).emit("messageReaction", { msgId: msg._id, reactions: msg.reactions });

    res.json({ reactions: msg.reactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    msg.isDeleted = true;
    msg.text = "";
    msg.mediaUrl = "";
    await msg.save();

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const sid = onlineUsers?.get(msg.receiver.toString());
    if (sid) io.to(sid).emit("messageDeleted", { msgId: msg._id });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
