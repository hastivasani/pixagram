const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "pixagram/messages");
      imageUrl = result.secure_url;
    }

    if (!text && !imageUrl) return res.status(400).json({ message: "Message content required" });

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
      imageUrl,
    });

    const populated = await message.populate("sender", "username avatar");

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const socketId = onlineUsers?.get(receiverId);
    if (socketId) {
      io.to(socketId).emit("newMessage", populated);
    }

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
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar");

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
