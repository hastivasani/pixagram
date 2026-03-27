const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema({
  group:    { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
  type:     { type: String, enum: ["text", "image", "voice", "file"], default: "text" },
  text:     { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  duration: { type: Number, default: 0 }, // voice message seconds
  replyTo:  { type: mongoose.Schema.Types.ObjectId, ref: "GroupMessage" },
  reactions:[{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, emoji: String }],
  readBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDeleted:{ type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
