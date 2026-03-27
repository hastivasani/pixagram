const Product = require("../models/Product");
const Order   = require("../models/Order");
const Cart    = require("../models/Cart");
const User    = require("../models/User");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// ── Products ──────────────────────────────────────────────────

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, comparePrice, category, tags, stock, shippingInfo } = req.body;
    if (!name || !price) return res.status(400).json({ message: "Name and price required" });

    let images = [];
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, "pixagram/shop", "image").then(r => r.secure_url))
      );
      images = uploads;
    }

    const product = await Product.create({
      seller: req.user._id,
      name, description, price: Number(price),
      comparePrice: Number(comparePrice) || 0,
      category: category || "General",
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
      stock: Number(stock) || 0,
      images,
      shippingInfo: shippingInfo ? JSON.parse(shippingInfo) : {},
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort = "createdAt", page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
      popular: { sold: -1 },
    };

    const products = await Product.find(filter)
      .populate("seller", "username avatar isVerified")
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);
    res.json({ products, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "username avatar name isVerified")
      .populate("reviews.user", "username avatar");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const updates = { ...req.body };
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, "pixagram/shop", "image").then(r => r.secure_url))
      );
      updates.images = [...product.images, ...uploads];
    }

    Object.assign(product, updates);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: "Rating required" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Remove existing review from same user
    product.reviews = product.reviews.filter(r => r.user.toString() !== req.user._id.toString());
    product.reviews.push({ user: req.user._id, rating: Number(rating), comment });

    // Recalculate average rating
    const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = total / product.reviews.length;
    product.reviewCount = product.reviews.length;
    await product.save();

    res.json({ message: "Review added", rating: product.rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Cart ──────────────────────────────────────────────────────

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name price comparePrice images stock seller isActive");
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ message: "Insufficient stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + Number(quantity), product.stock);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate("items.product", "name price comparePrice images stock seller isActive");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Orders ────────────────────────────────────────────────────

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "cod", notes } = req.body;
    if (!shippingAddress) return res.status(400).json({ message: "Shipping address required" });

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");
    if (!cart || !cart.items.length) return res.status(400).json({ message: "Cart is empty" });

    // Validate stock
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive)
        return res.status(400).json({ message: `Product ${item.product?.name || "unknown"} is unavailable` });
      if (item.product.stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
    }

    const items = cart.items.map(i => ({
      product:  i.product._id,
      name:     i.product.name,
      image:    i.product.images[0] || "",
      price:    i.product.price,
      quantity: i.quantity,
      seller:   i.product.seller,
    }));

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingCost = 0; // free shipping for now
    const total = subtotal + shippingCost;

    const order = await Order.create({
      buyer: req.user._id,
      items, shippingAddress, paymentMethod, notes,
      subtotal, shippingCost, total,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "pending",
    });

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    await order.populate("items.product", "name images");
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
      .populate("items.product", "name images price")
      .populate("items.seller", "username avatar");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["pending", "confirmed"].includes(order.orderStatus))
      return res.status(400).json({ message: "Cannot cancel this order" });

    order.orderStatus = "cancelled";
    order.cancelReason = req.body.reason || "";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Seller: get orders for their products
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.seller": req.user._id })
      .populate("buyer", "username avatar name")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findOne({ _id: req.params.id, "items.seller": req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === "delivered") order.deliveredAt = new Date();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
