const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:      { type: String, default: "" },        // note text (optional if song set)
  song:      { type: String, default: "" },        // song title
  songArtist:{ type: String, default: "" },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

// TTL — MongoDB auto-deletes after expiresAt
noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Note", noteSchema);
