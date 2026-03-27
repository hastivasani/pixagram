const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  thumbnail:   { type: String, default: "" },
  isPublic:    { type: Boolean, default: true },
  videos:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Reel" }],
  viewCount:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Playlist", playlistSchema);
