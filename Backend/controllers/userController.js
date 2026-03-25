const User = require("../models/User");
const Notification = require("../models/Notification");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar")
      .populate("followRequests", "username avatar");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, website, gender } = req.body;
    const update = { name, bio, website, gender };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "pixagram/avatars", "image");
      update.avatar = result.secure_url;
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─── Send / cancel follow request ─────────────────────────── */
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString())
      return res.status(400).json({ message: "Cannot follow yourself" });

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const alreadyFollowing  = target.followers.map(String).includes(req.user._id.toString());
    const alreadyRequested  = target.followRequests.map(String).includes(req.user._id.toString());

    // ── Unfollow ──
    if (alreadyFollowing) {
      await User.findByIdAndUpdate(targetId,      { $pull: { followers:      req.user._id } });
      await User.findByIdAndUpdate(req.user._id,  { $pull: { following:      targetId    } });
      return res.json({ status: "unfollowed" });
    }

    // ── Cancel pending request ──
    if (alreadyRequested) {
      await User.findByIdAndUpdate(targetId, { $pull: { followRequests: req.user._id } });
      return res.json({ status: "cancelled" });
    }

    // ── Send follow request (or direct follow if they already follow you AND you follow them back) ──
    // Only skip request if target currently follows me (is in my followers list)
    const me = await User.findById(req.user._id);
    const targetFollowsMe = me.followers.map(String).includes(targetId);

    if (targetFollowsMe) {
      // They follow me → direct follow back, no request needed
      await User.findByIdAndUpdate(targetId,     { $addToSet: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId    } });

      await Notification.create({ recipient: targetId, sender: req.user._id, type: "follow" });

      const io          = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");
      const socketId    = onlineUsers?.get(targetId);
      if (socketId) io.to(socketId).emit("newNotification", { type: "follow", sender: req.user });

      return res.json({ status: "following" });
    }

    // Normal case → send follow request
    await User.findByIdAndUpdate(targetId, { $addToSet: { followRequests: req.user._id } });

    // Notification
    await Notification.create({
      recipient: targetId,
      sender:    req.user._id,
      type:      "follow_request",
    });

    const io          = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const socketId    = onlineUsers?.get(targetId);
    if (socketId) io.to(socketId).emit("newNotification", { type: "follow_request", sender: req.user });

    return res.json({ status: "requested" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─── Accept follow request ─────────────────────────────────── */
exports.acceptFollow = async (req, res) => {
  try {
    const senderId = req.params.id;
    const me       = await User.findById(req.user._id);

    const isPending = me.followRequests.map(String).includes(senderId);
    if (!isPending) return res.status(400).json({ message: "No pending request from this user" });

    // Move from requests → followers/following
    await User.findByIdAndUpdate(req.user._id, {
      $pull:     { followRequests: senderId },
      $addToSet: { followers:      senderId },
    });
    await User.findByIdAndUpdate(senderId, {
      $addToSet: { following: req.user._id },
    });

    // Notify sender that request was accepted
    await Notification.create({
      recipient: senderId,
      sender:    req.user._id,
      type:      "follow",
    });

    const io          = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const socketId    = onlineUsers?.get(senderId);
    if (socketId) io.to(socketId).emit("newNotification", { type: "follow_accepted", sender: req.user });

    return res.json({ message: "Follow request accepted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─── Reject follow request ─────────────────────────────────── */
exports.rejectFollow = async (req, res) => {
  try {
    const senderId = req.params.id;
    await User.findByIdAndUpdate(req.user._id, { $pull: { followRequests: senderId } });
    return res.json({ message: "Follow request rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ─── Get pending follow requests for logged-in user ────────── */
exports.getFollowRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("followRequests", "username name avatar");
    res.json(user.followRequests || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name:     { $regex: q, $options: "i" } },
        { email:    { $regex: q, $options: "i" } },
      ],
    }).select("username name avatar email").limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("username name avatar followers following followRequests")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate("followers",      "username avatar")
      .populate("following",      "username avatar")
      .populate("followRequests", "username avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if requester is blocked by this user
    const me = await User.findById(req.user._id);
    if (user.blockedUsers?.map(String).includes(req.user._id.toString())) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if this user is blocked by requester
    if (me.blockedUsers?.map(String).includes(user._id.toString())) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $nin: [...me.following, me._id] },
    }).select("username name avatar followers followRequests").limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.togglePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isPrivate = !user.isPrivate;
    await user.save();
    res.json({ isPrivate: user.isPrivate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const user = await User.findById(req.user._id);
    const isBlocked = user.blockedUsers.map(String).includes(targetId);
    if (isBlocked) {
      user.blockedUsers.pull(targetId);
    } else {
      user.blockedUsers.addToSet(targetId);
      // Also unfollow each other
      await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id, following: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { followers: targetId, following: targetId } });
    }
    await user.save();
    res.json({ blocked: !isBlocked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("blockedUsers", "username name avatar");
    res.json(user.blockedUsers || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
