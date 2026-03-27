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
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  closeFriends:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPrivate:      { type: Boolean, default: false },
  blockedUsers:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Profile customization
  profileTheme:   { type: String, default: "default" },
  profileColor:   { type: String, default: "#a855f7" },
  profileMusic:   { type: String, default: "" }, // URL to music
  profileMusicName: { type: String, default: "" },
  socialLinks:    [{ platform: String, url: String }],
  bioLinks:       [{ title: String, url: String, icon: String }],
  isVerified:     { type: Boolean, default: false },
  isAdmin:        { type: Boolean, default: false },

  // Gaming stats
  gamingStats: {
    gamesPlayed:  { type: Number, default: 0 },
    wins:         { type: Number, default: 0 },
    xp:           { type: Number, default: 0 },
    level:        { type: Number, default: 1 },
    rank:         { type: String, default: "Bronze" },
    achievements: [{ name: String, icon: String, desc: String, unlockedAt: { type: Date, default: Date.now } }],
    dailyChallenge: {
      date:      { type: String, default: "" },
      game:      { type: String, default: "" },
      target:    { type: Number, default: 0 },
      progress:  { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      reward:    { type: Number, default: 0 },
    },
  },

  // Streak & Gamification
  streak: {
    current:  { type: Number, default: 0 },
    longest:  { type: Number, default: 0 },
    lastLogin: { type: Date },
  },
  xpLevel: {
    total:    { type: Number, default: 0 },
    level:    { type: Number, default: 1 },
    nextLevelXp: { type: Number, default: 100 },
  },
  badges: [{ name: String, icon: String, desc: String, earnedAt: { type: Date, default: Date.now } }],
  referralCode:   { type: String, default: "" },
  referredBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referralCount:  { type: Number, default: 0 },

  // Creator economy
  isCreator:         { type: Boolean, default: false },
  subscriptionPrice: { type: Number, default: 0 },
  walletBalance:     { type: Number, default: 0 },
  creatorAnalytics: {
    totalViews:     { type: Number, default: 0 },
    totalLikes:     { type: Number, default: 0 },
    totalComments:  { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    weeklyGrowth:   { type: Number, default: 0 },
    monthlyGrowth:  { type: Number, default: 0 },
  },

  // 2FA
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret:  { type: String, default: "" },

  // Login activity
  loginActivity: [{
    ip:        { type: String },
    device:    { type: String },
    location:  { type: String },
    loginAt:   { type: Date, default: Date.now },
    success:   { type: Boolean, default: true },
  }],

  // Content settings
  contentWarning:   { type: Boolean, default: false },
  sensitiveContent: { type: Boolean, default: false },
  wordFilter:       [{ type: String }],

  notificationSettings: {
    postLikes:      { type: Boolean, default: true },
    comments:       { type: Boolean, default: true },
    followRequests: { type: Boolean, default: true },
    messages:       { type: Boolean, default: true },
    liveAlerts:     { type: Boolean, default: true },
    groupMessages:  { type: Boolean, default: true },
    streakReminder: { type: Boolean, default: true },
    dailyChallenge: { type: Boolean, default: true },
  },
  mediaSettings: {
    autoplayVideos: { type: Boolean, default: true },
    hdUploads:      { type: Boolean, default: true },
  },
  theme: { type: String, enum: ["dark", "light"], default: "dark" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
