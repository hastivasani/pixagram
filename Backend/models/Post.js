const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mediaUrl:    { type: String, default: "" },
  mediaType:   { type: String, enum: ["image", "video", "carousel", "text", "poll"], default: "image" },
  carouselMedia:[{ url: String, type: { type: String, enum: ["image","video"] } }],
  caption:     { type: String, default: "" },
  hashtags:    [{ type: String, lowercase: true }],
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  isRepost:    { type: Boolean, default: false },
  originalPost:{ type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  reposts:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  aiScore:     { type: Number, default: 0 },
  visibility:  { type: String, enum: ["public", "followers", "private", "close_friends"], default: "public" },

  // Poll
  poll: {
    question: { type: String, default: "" },
    options:  [{ text: String, votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] }],
    endsAt:   { type: Date },
    multipleChoice: { type: Boolean, default: false },
  },

  // Scheduling
  scheduledAt:  { type: Date },
  isPublished:  { type: Boolean, default: true },

  // Content warning
  hasContentWarning: { type: Boolean, default: false },
  contentWarningText: { type: String, default: "" },

  // Location
  location: { type: String, default: "" },

  // Saves
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Source — where the post was created from
  source: { type: String, enum: ["post", "twitter", "reel", "story"], default: "post" },

  // Twitter posts auto-delete after 24 hours
  twitterExpiresAt: { type: Date, default: null, index: { expireAfterSeconds: 0, sparse: true } },
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
