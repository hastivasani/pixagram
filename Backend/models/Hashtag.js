const mongoose = require("mongoose");

const hashtagSchema = new mongoose.Schema({
  tag:   { type: String, required: true, unique: true, lowercase: true },
  count: { type: Number, default: 1 },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
}, { timestamps: true });

hashtagSchema.index({ count: -1 });

module.exports = mongoose.model("Hashtag", hashtagSchema);
