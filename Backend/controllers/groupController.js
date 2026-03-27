const Group = require("../models/Group");
const GroupMessage = require("../models/GroupMessage");
const User = require("../models/User");
const Notification = require("../models/Notification");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const crypto = require("crypto");

const genInviteCode = () => crypto.randomBytes(5).toString("hex");

// Create group - accepts JSON body
exports.createGroup = async (req, res) => {
  try {
    const { name, description, isPublic, memberIds } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Group name required" });

    let avatar = "";
    if (req.file) {
      const r = await uploadToCloudinary(req.file.buffer, "pixagram/groups", "image");
      avatar = r.secure_url;
    }

    const members = Array.isArray(memberIds) ? memberIds : [];
    const group = await Group.create({
      name: name.trim(),
      description: description || "",
      avatar,
      owner: req.user._id,
      admins: [req.user._id],
      members: [req.user._id, ...members],
      isPublic: isPublic !== false && isPublic !== "false",
      inviteCode: genInviteCode(),
    });

    const populated = await group.populate([
      { path: "members", select: "username avatar name" },
      { path: "owner",   select: "username avatar" },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    console.error("createGroup error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get my groups
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "username avatar name")
      .populate("owner", "username avatar")
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single group
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "username avatar name")
      .populate("owner", "username avatar")
      .populate("admins", "username avatar");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join via invite code
exports.joinByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const group = await Group.findOne({ inviteCode: code.toLowerCase() });
    if (!group) return res.status(404).json({ message: "Invalid invite code" });
    if (group.members.map(String).includes(req.user._id.toString()))
      return res.status(400).json({ message: "Already a member" });
    if (group.members.length >= group.maxMembers)
      return res.status(400).json({ message: "Group is full" });

    group.members.push(req.user._id);
    await group.save();
    res.json({ message: "Joined group", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add member (admin only)
exports.addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    const isAdmin = group.admins.map(String).includes(req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ message: "Not an admin" });

    const { userId } = req.body;
    if (group.members.map(String).includes(userId))
      return res.status(400).json({ message: "Already a member" });

    group.members.push(userId);
    await group.save();
    res.json({ message: "Member added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave group
exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    group.members.pull(req.user._id);
    group.admins.pull(req.user._id);
    await group.save();
    res.json({ message: "Left group" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send group message - handles both JSON and multipart
exports.sendGroupMessage = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    const isMember = group.members.map(String).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: "Not a member" });

    const { text, replyTo, type } = req.body;
    if (!text?.trim() && !req.file) return res.status(400).json({ message: "Message content required" });

    let mediaUrl = "";
    if (req.file) {
      const r = await uploadToCloudinary(req.file.buffer, "pixagram/group-messages");
      mediaUrl = r.secure_url;
    }

    const msg = await GroupMessage.create({
      group: group._id,
      sender: req.user._id,
      type: req.file ? "image" : (type || "text"),
      text: text?.trim() || "",
      mediaUrl,
      replyTo: replyTo || null,
    });

    const populated = await msg.populate("sender", "username avatar");

    // Emit to group room
    const io = req.app.get("io");
    io.to("group_" + group._id).emit("groupMessage", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendGroupMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get group messages
exports.getGroupMessages = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    const isMember = group.members.map(String).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: "Not a member" });

    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const messages = await GroupMessage.find({ group: req.params.id, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "username avatar")
      .populate("replyTo");

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// React to group message
exports.reactToGroupMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const msg = await GroupMessage.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    msg.reactions = msg.reactions.filter(r => r.user.toString() !== req.user._id.toString());
    if (emoji) msg.reactions.push({ user: req.user._id, emoji });
    await msg.save();

    const io = req.app.get("io");
    io.to("group_" + msg.group).emit("groupMessageReaction", { msgId: msg._id, reactions: msg.reactions });
    res.json({ reactions: msg.reactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
