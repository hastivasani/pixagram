const User    = require("../models/User");
const Post    = require("../models/Post");
const Reel    = require("../models/Reel");
const Hashtag = require("../models/Hashtag");
const Product = require("../models/Product");
const Service = require("../models/Service");

// Global search across all content types
exports.globalSearch = async (req, res) => {
  try {
    const { q, type = "all", page = 1, limit = 10 } = req.query;
    if (!q || q.trim().length < 1) return res.json({ users: [], posts: [], reels: [], hashtags: [], products: [], services: [] });

    const skip = (page - 1) * limit;
    const regex = { $regex: q, $options: "i" };
    const results = {};

    if (type === "all" || type === "users") {
      results.users = await User.find({
        $or: [{ username: regex }, { name: regex }],
        blockedUsers: { $ne: req.user._id },
      })
        .select("username name avatar isVerified followers")
        .limit(Number(limit))
        .skip(skip);
    }

    if (type === "all" || type === "posts") {
      results.posts = await Post.find({
        $or: [
          { caption: regex },
          { hashtags: { $in: [q.replace(/^#/, "").toLowerCase()] } },
        ],
        visibility: "public",
      })
        .populate("user", "username avatar isVerified")
        .sort({ likes: -1, createdAt: -1 })
        .limit(Number(limit))
        .skip(skip);
    }

    if (type === "all" || type === "reels") {
      results.reels = await Reel.find({
        $or: [{ caption: regex }, { hashtags: regex }],
      })
        .populate("user", "username avatar isVerified")
        .sort({ likes: -1 })
        .limit(Number(limit))
        .skip(skip);
    }

    if (type === "all" || type === "hashtags") {
      results.hashtags = await Hashtag.find({ tag: regex })
        .sort({ count: -1 })
        .limit(Number(limit));
    }

    if (type === "all" || type === "products") {
      results.products = await Product.find({
        $or: [{ name: regex }, { description: regex }, { tags: regex }],
        isActive: true,
      })
        .populate("seller", "username avatar")
        .sort({ sold: -1 })
        .limit(Number(limit))
        .skip(skip);
    }

    if (type === "all" || type === "services") {
      results.services = await Service.find({
        $or: [{ title: regex }, { description: regex }],
        isActive: true,
      })
        .populate("provider", "username avatar")
        .sort({ rating: -1 })
        .limit(Number(limit))
        .skip(skip);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search within messages (for a specific conversation)
exports.searchMessages = async (req, res) => {
  try {
    const Message = require("../models/Message");
    const { q, userId } = req.query;
    if (!q || !userId) return res.json([]);

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
      text: { $regex: q, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Autocomplete suggestions
exports.autocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json({ users: [], hashtags: [] });

    const regex = { $regex: `^${q}`, $options: "i" };

    const [users, hashtags] = await Promise.all([
      User.find({ $or: [{ username: regex }, { name: regex }] })
        .select("username name avatar isVerified")
        .limit(5),
      Hashtag.find({ tag: regex }).sort({ count: -1 }).limit(5),
    ]);

    res.json({ users, hashtags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
