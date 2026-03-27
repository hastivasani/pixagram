const mongoose = require("mongoose");

const gameLobbySchema = new mongoose.Schema({
  game:       { type: String, required: true }, // "tictactoe" | "quiz" | "chess"
  host:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  players:    [{
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["waiting", "ready", "playing"], default: "waiting" },
    score:  { type: Number, default: 0 },
  }],
  maxPlayers: { type: Number, default: 2 },
  status:     { type: String, enum: ["waiting", "in_progress", "finished"], default: "waiting" },
  inviteCode: { type: String, unique: true },
  gameState:  { type: mongoose.Schema.Types.Mixed, default: {} },
  winner:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("GameLobby", gameLobbySchema);
