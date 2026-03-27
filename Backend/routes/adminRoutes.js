const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const User    = require("../models/User");
const Post    = require("../models/Post");
const Order   = require("../models/Order");
const Booking = require("../models/Booking");
const Message = require("../models/Message");
const Reel    = require("../models/Reel");

router.use(protect, adminOnly);

// ── Dashboard Stats ──────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers, newUsersToday, totalPosts, totalOrders,
      totalBookings, totalReels, activeUsers, verifiedUsers,
      adminUsers, totalRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Post.countDocuments(),
      Order.countDocuments(),
      Booking.countDocuments(),
      Reel.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 7 * 86400000) } }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isAdmin: true }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    ]);

    // Last 7 days user signups
    const sevenDaysAgo = new Date(Date.now() - 6 * 86400000);
    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers, newUsersToday, totalPosts, totalOrders,
      totalBookings, totalReels, activeUsers, verifiedUsers,
      adminUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      dailySignups,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Users ────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", sort = "-createdAt" } = req.query;
    const query = search
      ? { $or: [{ username: new RegExp(search, "i") }, { email: new RegExp(search, "i") }, { name: new RegExp(search, "i") }] }
      : {};
    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort(sort).skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { isVerified, isAdmin, isBanned } = req.body;
    const update = {};
    if (isVerified !== undefined) update.isVerified = isVerified;
    if (isAdmin    !== undefined) update.isAdmin    = isAdmin;
    if (isBanned   !== undefined) update.isBanned   = isBanned;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Posts ────────────────────────────────────────────────────
router.get("/posts", async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const query = search ? { caption: new RegExp(search, "i") } : {};
    const [posts, total] = await Promise.all([
      Post.find(query).populate("user", "username avatar").sort("-createdAt").skip((page - 1) * limit).limit(Number(limit)),
      Post.countDocuments(query),
    ]);
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Orders ───────────────────────────────────────────────────
router.get("/orders", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [orders, total] = await Promise.all([
      Order.find().populate("buyer", "username avatar").sort("-createdAt").skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(),
    ]);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Bookings ─────────────────────────────────────────────────
router.get("/bookings", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [bookings, total] = await Promise.all([
      Booking.find().populate("user", "username avatar").sort("-createdAt").skip((page - 1) * limit).limit(Number(limit)),
      Booking.countDocuments(),
    ]);
    res.json({ bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
