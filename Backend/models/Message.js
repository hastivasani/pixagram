const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:     { type: String, enum: ["text", "image", "voice", "video", "file"], default: "text" },
  text:     { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  duration: { type: Number, default: 0 }, // voice message seconds
  // Disappearing messages
  isDisappearing: { type: Boolean, default: false },
  expiresAt:      { type: Date },
  // Reactions & reply
  reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, emoji: String }],
  replyTo:   { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  read:      { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// TTL index for disappearing messages
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

module.exports = mongoose.model("Message", messageSchema);
