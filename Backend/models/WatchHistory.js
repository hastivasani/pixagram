const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reel:      { type: mongoose.Schema.Types.ObjectId, ref: "Reel", required: true },
  watchedAt: { type: Date, default: Date.now },
  watchTime: { type: Number, default: 0 }, // seconds watched
}, { timestamps: false });

watchHistorySchema.index({ user: 1, watchedAt: -1 });
watchHistorySchema.index({ user: 1, reel: 1 }, { unique: true });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
