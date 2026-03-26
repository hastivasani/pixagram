const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username:       { type: String, required: true, unique: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true },
  name:           { type: String, default: "" },
  bio:            { type: String, default: "" },
  avatar:         { type: String, default: "" },
  website:        { type: String, default: "" },
  gender:         { type: String, default: "" },
  followers:      [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following:      [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // pending follow requests received by this user
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPrivate:      { type: Boolean, default: false },
  blockedUsers:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notificationSettings: {
    postLikes:      { type: Boolean, default: true },
    comments:       { type: Boolean, default: true },
    followRequests: { type: Boolean, default: true },
    messages:       { type: Boolean, default: true },
  },
  mediaSettings: {
    autoplayVideos: { type: Boolean, default: true },
    hdUploads:      { type: Boolean, default: true },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
