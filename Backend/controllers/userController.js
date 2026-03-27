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

    const pendingIds  = me.followRequests.map(String);
    const followerIds = me.followers.map(String);
    const isPending       = pendingIds.includes(senderId);
    const alreadyFollower = followerIds.includes(senderId);

    console.log(`[acceptFollow] me=${req.user._id} sender=${senderId}`);
    console.log(`[acceptFollow] followRequests=${JSON.stringify(pendingIds)}`);
    console.log(`[acceptFollow] isPending=${isPending} alreadyFollower=${alreadyFollower}`);

    // Idempotent: already a follower → success
    if (!isPending && alreadyFollower) {
      return res.json({ message: "Already following" });
    }

    // Neither pending nor follower — the notification is stale/orphaned
    // Accept gracefully: add them as follower anyway
    if (!isPending && !alreadyFollower) {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { followers: senderId } });
      await User.findByIdAndUpdate(senderId, { $addToSet: { following: req.user._id } });
      return res.json({ message: "Follow accepted" });
    }

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

exports.updateNotificationSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings: req.body },
      { new: true }
    ).select("notificationSettings");
    res.json(user.notificationSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMediaSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { mediaSettings: req.body },
      { new: true }
    ).select("mediaSettings");
    res.json(user.mediaSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Close Friends ─────────────────────────────────────────────
exports.toggleCloseFriend = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const targetId = req.params.id;
    const isClose = user.closeFriends?.map(String).includes(targetId);
    if (isClose) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { closeFriends: targetId } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { closeFriends: targetId } });
    }
    res.json({ isCloseFriend: !isClose });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCloseFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("closeFriends", "username name avatar");
    res.json(user.closeFriends || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Daily Login Streak ────────────────────────────────────────
exports.checkInStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const last = user.streak?.lastLogin ? new Date(user.streak.lastLogin) : null;
    const diffDays = last ? Math.floor((now - last) / (1000 * 60 * 60 * 24)) : 999;

    let current = user.streak?.current || 0;
    let longest = user.streak?.longest || 0;
    let xpGained = 0;

    if (diffDays === 0) return res.json({ alreadyCheckedIn: true, streak: user.streak });
    if (diffDays === 1) { current++; xpGained = 10 + current * 2; }
    else { current = 1; xpGained = 10; }
    if (current > longest) longest = current;

    const newXp = (user.xpLevel?.total || 0) + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1;

    await User.findByIdAndUpdate(req.user._id, {
      "streak.current": current,
      "streak.longest": longest,
      "streak.lastLogin": now,
      "xpLevel.total": newXp,
      "xpLevel.level": newLevel,
      "xpLevel.nextLevelXp": newLevel * 100,
    });

    // Check badge unlocks
    const badges = [];
    if (current === 7)  badges.push({ name: "Week Warrior",  icon: "🔥", desc: "7-day streak!" });
    if (current === 30) badges.push({ name: "Month Master",  icon: "💎", desc: "30-day streak!" });
    if (current === 100) badges.push({ name: "Century Club", icon: "👑", desc: "100-day streak!" });
    if (badges.length) {
      await User.findByIdAndUpdate(req.user._id, { $push: { badges: { $each: badges } } });
    }

    res.json({ streak: { current, longest, lastLogin: now }, xpGained, newLevel, badges });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Referral ──────────────────────────────────────────────────
exports.generateReferral = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.referralCode) {
      const code = user.username.toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
      await User.findByIdAndUpdate(req.user._id, { referralCode: code });
      return res.json({ referralCode: code });
    }
    res.json({ referralCode: user.referralCode });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.useReferral = async (req, res) => {
  try {
    const { code } = req.body;
    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) return res.status(404).json({ message: "Invalid referral code" });
    if (String(referrer._id) === String(req.user._id)) return res.status(400).json({ message: "Cannot use own code" });

    const me = await User.findById(req.user._id);
    if (me.referredBy) return res.status(400).json({ message: "Already used a referral" });

    await User.findByIdAndUpdate(req.user._id, { referredBy: referrer._id, $inc: { "xpLevel.total": 50 } });
    await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1, "xpLevel.total": 100 } });

    res.json({ message: "Referral applied! +50 XP for you, +100 XP for referrer" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Creator Analytics ─────────────────────────────────────────
exports.getCreatorAnalytics = async (req, res) => {
  try {
    const Post = require("../models/Post");
    const userId = req.user._id;
    const posts = await Post.find({ user: userId, isPublished: true });
    const totalLikes    = posts.reduce((a, p) => a + (p.likes?.length || 0), 0);
    const totalComments = posts.reduce((a, p) => a + (p.comments?.length || 0), 0);
    const totalReposts  = posts.reduce((a, p) => a + (p.reposts?.length || 0), 0);
    const totalSaves    = posts.reduce((a, p) => a + (p.saves?.length || 0), 0);
    const user = await User.findById(userId).select("followers creatorAnalytics xpLevel streak badges");

    // Weekly posts
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyPosts = posts.filter(p => new Date(p.createdAt) > weekAgo).length;

    res.json({
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      totalReposts,
      totalSaves,
      totalFollowers: user.followers?.length || 0,
      weeklyPosts,
      xpLevel: user.xpLevel,
      streak: user.streak,
      badges: user.badges,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Login Activity ────────────────────────────────────────────
exports.getLoginActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("loginActivity");
    res.json(user.loginActivity?.slice(-20).reverse() || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Bio Links ─────────────────────────────────────────────────
exports.updateBioLinks = async (req, res) => {
  try {
    const { bioLinks } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { bioLinks }, { new: true }).select("bioLinks");
    res.json(user.bioLinks);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Profile Music ─────────────────────────────────────────────
exports.updateProfileMusic = async (req, res) => {
  try {
    const { profileMusic, profileMusicName } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { profileMusic, profileMusicName }, { new: true }).select("profileMusic profileMusicName");
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Profile Theme/Color ───────────────────────────────────────
exports.updateProfileTheme = async (req, res) => {
  try {
    const { profileTheme, profileColor } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { profileTheme, profileColor }, { new: true }).select("profileTheme profileColor");
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Word Filter ───────────────────────────────────────────────
exports.updateWordFilter = async (req, res) => {
  try {
    const { wordFilter } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { wordFilter }, { new: true }).select("wordFilter");
    res.json(user.wordFilter);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Save Post ─────────────────────────────────────────────────
exports.getSavedPosts = async (req, res) => {
  try {
    const Post = require("../models/Post");
    const posts = await Post.find({ saves: req.user._id }).populate("user", "username avatar").sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
