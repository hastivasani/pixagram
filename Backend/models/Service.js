const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  provider:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  category:    { type: String, default: "General" },
  price:       { type: Number, required: true, min: 0 },
  duration:    { type: Number, default: 60 }, // minutes
  images:      [{ type: String }],
  isActive:    { type: Boolean, default: true },
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // Weekly availability: day -> array of time slots
  availability: {
    monday:    [{ type: String }],
    tuesday:   [{ type: String }],
    wednesday: [{ type: String }],
    thursday:  [{ type: String }],
    friday:    [{ type: String }],
    saturday:  [{ type: String }],
    sunday:    [{ type: String }],
  },
  // Blocked dates (holidays, vacations)
  blockedDates: [{ type: Date }],
  location:    { type: String, default: "" },
  isOnline:    { type: Boolean, default: false },
  maxBookingsPerSlot: { type: Number, default: 1 },
}, { timestamps: true });

serviceSchema.index({ title: "text", description: "text" });
serviceSchema.index({ provider: 1, category: 1 });

module.exports = mongoose.model("Service", serviceSchema);
