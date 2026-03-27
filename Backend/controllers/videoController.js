const Reel        = require("../models/Reel");
const Playlist    = require("../models/Playlist");
const WatchHistory = require("../models/WatchHistory");
const User        = require("../models/User");

// ── Playlists ─────────────────────────────────────────────────

exports.createPlaylist = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const playlist = await Playlist.create({
      user: req.user._id,
      title, description,
      isPublic: isPublic !== false,
    });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .populate("videos", "mediaUrl caption thumbnail")
      .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.params.userId, isPublic: true })
      .populate("videos", "mediaUrl caption thumbnail")
      .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("user", "username avatar")
      .populate({
        path: "videos",
        populate: { path: "user", select: "username avatar" },
      });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    if (!playlist.isPublic && playlist.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Private playlist" });

    playlist.viewCount += 1;
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToPlaylist = async (req, res) => {
  try {
    const { videoId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (!playlist.videos.includes(videoId)) {
      playlist.videos.push(videoId);
      await playlist.save();
    }
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.videos = playlist.videos.filter(v => v.toString() !== req.params.videoId);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    await Playlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Watch History ─────────────────────────────────────────────

exports.recordWatch = async (req, res) => {
  try {
    const { reelId, watchTime } = req.body;
    await WatchHistory.findOneAndUpdate(
      { user: req.user._id, reel: reelId },
      { watchedAt: new Date(), watchTime: watchTime || 0 },
      { upsert: true }
    );

    // Update reel view count
    await Reel.findByIdAndUpdate(reelId, { $inc: { views: 1 } });
    res.json({ message: "Recorded" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWatchHistory = async (req, res) => {
  try {
    const history = await WatchHistory.find({ user: req.user._id })
      .populate({ path: "reel", populate: { path: "user", select: "username avatar" } })
      .sort({ watchedAt: -1 })
      .limit(50);
    res.json(history.filter(h => h.reel)); // filter deleted reels
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearWatchHistory = async (req, res) => {
  try {
    await WatchHistory.deleteMany({ user: req.user._id });
    res.json({ message: "History cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── AI Recommendations ────────────────────────────────────────

exports.getRecommendedVideos = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("following");

    // Get user's watch history to find preferred content
    const history = await WatchHistory.find({ user: userId })
      .populate("reel", "hashtags user")
      .sort({ watchedAt: -1 })
      .limit(20);

    // Extract tags and creators from watch history
    const watchedIds = history.map(h => h.reel?._id).filter(Boolean);
    const preferredTags = [];
    const preferredCreators = [];

    history.forEach(h => {
      if (h.reel?.hashtags) preferredTags.push(...h.reel.hashtags);
      if (h.reel?.user) preferredCreators.push(h.reel.user.toString());
    });

    // Score-based recommendation query
    const followingIds = user.following || [];

    // Priority 1: Videos from followed users not yet watched
    const fromFollowing = await Reel.find({
      user: { $in: followingIds },
      _id: { $nin: watchedIds },
    })
      .populate("user", "username avatar isVerified")
      .sort({ createdAt: -1 })
      .limit(10);

    // Priority 2: Videos with matching tags not yet watched
    const byTags = preferredTags.length
      ? await Reel.find({
          hashtags: { $in: [...new Set(preferredTags)].slice(0, 10) },
          _id: { $nin: watchedIds },
          user: { $nin: followingIds },
        })
          .populate("user", "username avatar isVerified")
          .sort({ likes: -1 })
          .limit(10)
      : [];

    // Priority 3: Trending/popular videos as fallback
    const trending = await Reel.find({
      _id: { $nin: watchedIds },
      user: { $nin: followingIds },
    })
      .populate("user", "username avatar isVerified")
      .sort({ likes: -1, createdAt: -1 })
      .limit(10);

    // Merge and deduplicate
    const seen = new Set();
    const recommended = [...fromFollowing, ...byTags, ...trending].filter(r => {
      if (seen.has(r._id.toString())) return false;
      seen.add(r._id.toString());
      return true;
    });

    res.json(recommended.slice(0, 20));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Video Search ──────────────────────────────────────────────

exports.searchVideos = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.json([]);

    const reels = await Reel.find({
      $or: [
        { caption: { $regex: q, $options: "i" } },
        { hashtags: { $regex: q, $options: "i" } },
      ],
    })
      .populate("user", "username avatar isVerified")
      .sort({ likes: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(reels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
