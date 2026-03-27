const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  game:   { type: String, required: true },
  wins:   { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  xp:     { type: Number, default: 0 },
  rank:   { type: String, default: "Bronze" },
}, { timestamps: true });

leaderboardSchema.index({ game: 1, xp: -1 });

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
