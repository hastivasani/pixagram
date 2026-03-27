const GameLobby = require("../models/GameLobby");
const Leaderboard = require("../models/Leaderboard");
const User = require("../models/User");
const crypto = require("crypto");

const genCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

// Create lobby
exports.createLobby = async (req, res) => {
  try {
    const { game, maxPlayers } = req.body;
    if (!game) return res.status(400).json({ message: "Game required" });

    const lobby = await GameLobby.create({
      game,
      host: req.user._id,
      players: [{ user: req.user._id, status: "ready" }],
      maxPlayers: maxPlayers || 2,
      inviteCode: genCode(),
    });

    const populated = await lobby.populate("players.user", "username avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join lobby by code
exports.joinLobby = async (req, res) => {
  try {
    const { code } = req.params;
    const lobby = await GameLobby.findOne({ inviteCode: code, status: "waiting" });
    if (!lobby) return res.status(404).json({ message: "Lobby not found or already started" });

    const alreadyIn = lobby.players.some(p => p.user.toString() === req.user._id.toString());
    if (alreadyIn) return res.status(400).json({ message: "Already in lobby" });
    if (lobby.players.length >= lobby.maxPlayers)
      return res.status(400).json({ message: "Lobby is full" });

    lobby.players.push({ user: req.user._id, status: "ready" });
    await lobby.save();

    const populated = await lobby.populate("players.user", "username avatar");

    // Notify via socket
    const io = req.app.get("io");
    io.to("lobby_" + lobby._id).emit("lobbyUpdate", populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get lobby
exports.getLobby = async (req, res) => {
  try {
    const lobby = await GameLobby.findById(req.params.id)
      .populate("players.user", "username avatar")
      .populate("host", "username avatar");
    if (!lobby) return res.status(404).json({ message: "Lobby not found" });
    res.json(lobby);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { game } = req.params;
    const entries = await Leaderboard.find({ game })
      .sort({ xp: -1 })
      .limit(50)
      .populate("user", "username avatar name");
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update score after game ends (called from socket or client)
exports.updateScore = async (req, res) => {
  try {
    const { game, won, xpGained } = req.body;
    let entry = await Leaderboard.findOne({ user: req.user._id, game });
    if (!entry) {
      entry = await Leaderboard.create({ user: req.user._id, game });
    }
    if (won) entry.wins++;
    else entry.losses++;
    entry.xp += xpGained || (won ? 50 : 10);

    // Rank calculation
    if (entry.xp >= 5000) entry.rank = "Diamond";
    else if (entry.xp >= 2000) entry.rank = "Platinum";
    else if (entry.xp >= 1000) entry.rank = "Gold";
    else if (entry.xp >= 400) entry.rank = "Silver";
    else entry.rank = "Bronze";

    await entry.save();

    // Update user gaming stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "gamingStats.gamesPlayed": 1, "gamingStats.wins": won ? 1 : 0, "gamingStats.xp": xpGained || (won ? 50 : 10) },
      $set: { "gamingStats.rank": entry.rank },
    });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my stats
exports.getMyStats = async (req, res) => {
  try {
    const stats = await Leaderboard.find({ user: req.user._id });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
