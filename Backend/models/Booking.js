const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service:  { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date:     { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "10:00-11:00"
  status:   { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
  notes:    { type: String, default: "" },
  price:    { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
  stripePaymentId: { type: String, default: "" },
  cancelReason: { type: String, default: "" },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ provider: 1, date: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
