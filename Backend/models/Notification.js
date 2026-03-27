const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "like", "comment", "follow", "follow_request", "follow_accepted",
      "message", "group_message", "repost", "mention",
      "live_started", "game_invite", "gift",
    ],
    required: true,
  },
  post:    { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  reel:    { type: mongoose.Schema.Types.ObjectId, ref: "Reel" },
  group:   { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  lobby:   { type: mongoose.Schema.Types.ObjectId, ref: "GameLobby" },
  message: { type: String, default: "" },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
