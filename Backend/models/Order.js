const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name:     { type: String },
    image:    { type: String },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    seller:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  }],
  shippingAddress: {
    fullName: { type: String },
    address:  { type: String },
    city:     { type: String },
    state:    { type: String },
    zip:      { type: String },
    country:  { type: String, default: "US" },
    phone:    { type: String },
  },
  paymentMethod:  { type: String, enum: ["stripe", "wallet", "cod"], default: "stripe" },
  paymentStatus:  { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  stripePaymentId: { type: String, default: "" },
  orderStatus:    { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
  subtotal:       { type: Number, required: true },
  shippingCost:   { type: Number, default: 0 },
  discount:       { type: Number, default: 0 },
  total:          { type: Number, required: true },
  notes:          { type: String, default: "" },
  trackingNumber: { type: String, default: "" },
  deliveredAt:    { type: Date },
}, { timestamps: true });

orderSchema.index({ buyer: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
