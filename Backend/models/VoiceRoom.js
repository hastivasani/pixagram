const mongoose = require("mongoose");

const voiceRoomSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  host:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPublic:    { type: Boolean, default: true },
  isActive:    { type: Boolean, default: true },
  maxUsers:    { type: Number, default: 20 },
}, { timestamps: true });

module.exports = mongoose.model("VoiceRoom", voiceRoomSchema);
