const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  seller:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String, default: "" },
  price:        { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 }, // original price for discount display
  images:       [{ type: String }],
  category:     { type: String, default: "General" },
  tags:         [{ type: String, lowercase: true }],
  stock:        { type: Number, default: 0 },
  sold:         { type: Number, default: 0 },
  rating:       { type: Number, default: 0 },
  reviewCount:  { type: Number, default: 0 },
  reviews: [{
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating:  { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  isActive:     { type: Boolean, default: true },
  isFeatured:   { type: Boolean, default: false },
  shippingInfo: {
    weight:   { type: Number, default: 0 },
    freeShipping: { type: Boolean, default: false },
    estimatedDays: { type: Number, default: 5 },
  },
}, { timestamps: true });

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);
