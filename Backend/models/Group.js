const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  avatar:      { type: String, default: "" },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  admins:      [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  moderators:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  members:     [{
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role:   { type: String, enum: ["owner","admin","moderator","member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
    nickname: { type: String, default: "" },
  }],
  isPublic:    { type: Boolean, default: true },
  inviteCode:  { type: String, unique: true, sparse: true },
  maxMembers:  { type: Number, default: 256 },
  pinnedMessage: { type: mongoose.Schema.Types.ObjectId, ref: "GroupMessage" },
  announcement: { type: String, default: "" },
  wordFilter:  [{ type: String }],
  events: [{
    title:       { type: String },
    description: { type: String, default: "" },
    startAt:     { type: Date },
    endAt:       { type: Date },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rsvp: [{
      user:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["going","maybe","not_going"], default: "going" },
    }],
  }],
  polls: [{
    question:  { type: String },
    options:   [{ text: String, votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    endsAt:    { type: Date },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);
