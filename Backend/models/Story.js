const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video"], default: "image" },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reactions: [{
    user:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: { type: String },
  }],
  comments: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text:      { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

// TTL index — MongoDB auto-deletes documents when expiresAt is reached
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Story", storySchema);
