const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Product = require("./models/Product");
const User = require("./models/User");

const sampleProducts = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium sound quality with active noise cancellation. 30-hour battery life, foldable design, and comfortable over-ear cushions.",
    price: 49.99,
    comparePrice: 79.99,
    category: "Electronics",
    tags: ["wireless", "audio", "bluetooth", "headphones"],
    stock: 25,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"],
    rating: 4.5,
    reviewCount: 128,
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with tactile switches. Anti-ghosting, programmable keys, and durable aluminum frame.",
    price: 69.99,
    comparePrice: 99.99,
    category: "Electronics",
    tags: ["gaming", "keyboard", "mechanical", "rgb"],
    stock: 15,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop"],
    rating: 4.7,
    reviewCount: 89,
  },
  {
    name: "Minimalist Leather Wallet",
    description: "Slim RFID-blocking genuine leather wallet. Holds up to 8 cards with a cash pocket. Available in black and brown.",
    price: 24.99,
    comparePrice: 0,
    category: "Fashion",
    tags: ["wallet", "leather", "minimalist", "rfid"],
    stock: 50,
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop"],
    rating: 4.3,
    reviewCount: 214,
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-wall vacuum insulated 32oz bottle. Keeps drinks cold 24hrs or hot 12hrs. BPA-free and leak-proof lid.",
    price: 19.99,
    comparePrice: 29.99,
    category: "Sports",
    tags: ["bottle", "water", "insulated", "gym"],
    stock: 80,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop"],
    rating: 4.6,
    reviewCount: 342,
  },
  {
    name: "Portable Phone Stand",
    description: "Adjustable aluminum desk phone stand. Compatible with all smartphones and tablets. Foldable and lightweight.",
    price: 12.99,
    comparePrice: 0,
    category: "Electronics",
    tags: ["stand", "phone", "desk", "aluminum"],
    stock: 100,
    images: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop"],
    rating: 4.2,
    reviewCount: 67,
  },
  {
    name: "Scented Soy Candle Set",
    description: "Set of 3 hand-poured soy wax candles. Lavender, vanilla, and eucalyptus scents. 40-hour burn time each.",
    price: 29.99,
    comparePrice: 44.99,
    category: "Home & Garden",
    tags: ["candle", "soy", "scented", "home", "decor"],
    stock: 35,
    images: ["https://images.unsplash.com/photo-1602874801007-bd458bb1a2b4?w=400&h=400&fit=crop"],
    rating: 4.8,
    reviewCount: 156,
  },
  {
    name: "Yoga Mat Premium",
    description: "6mm thick non-slip yoga mat with alignment lines. Eco-friendly TPE material, includes carrying strap.",
    price: 34.99,
    comparePrice: 54.99,
    category: "Sports",
    tags: ["yoga", "mat", "fitness", "exercise"],
    stock: 40,
    images: ["https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=400&h=400&fit=crop"],
    rating: 4.4,
    reviewCount: 98,
  },
  {
    name: "Wireless Charging Pad",
    description: "10W fast wireless charger compatible with all Qi-enabled devices. LED indicator, anti-slip surface.",
    price: 15.99,
    comparePrice: 24.99,
    category: "Electronics",
    tags: ["wireless", "charger", "qi", "fast charging"],
    stock: 60,
    images: ["https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=400&h=400&fit=crop"],
    rating: 4.1,
    reviewCount: 203,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Handcrafted 12oz ceramic mug with minimalist design. Microwave and dishwasher safe. Perfect gift.",
    price: 14.99,
    comparePrice: 0,
    category: "Home & Garden",
    tags: ["mug", "coffee", "ceramic", "kitchen"],
    stock: 75,
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop"],
    rating: 4.5,
    reviewCount: 87,
  },
  {
    name: "Sunglasses UV400",
    description: "Polarized UV400 protection sunglasses with lightweight frame. Unisex design, includes hard case.",
    price: 22.99,
    comparePrice: 39.99,
    category: "Fashion",
    tags: ["sunglasses", "uv", "polarized", "summer"],
    stock: 45,
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop"],
    rating: 4.3,
    reviewCount: 175,
  },
  {
    name: "Sketch & Drawing Set",
    description: "Professional 24-piece drawing set with graphite pencils, charcoal sticks, blending tools, and sketchbook.",
    price: 27.99,
    comparePrice: 39.99,
    category: "Art",
    tags: ["art", "drawing", "sketch", "pencil"],
    stock: 30,
    images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop"],
    rating: 4.6,
    reviewCount: 62,
  },
  {
    name: "Bluetooth Speaker Mini",
    description: "Compact waterproof Bluetooth 5.0 speaker. 12-hour playtime, 360° surround sound, built-in mic.",
    price: 39.99,
    comparePrice: 59.99,
    category: "Electronics",
    tags: ["speaker", "bluetooth", "waterproof", "portable"],
    stock: 20,
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop"],
    rating: 4.4,
    reviewCount: 311,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get first user to assign as seller
    const user = await User.findOne();
    if (!user) {
      console.error("No users found. Please register at least one user first.");
      process.exit(1);
    }

    console.log(`Using seller: ${user.username}`);

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert with seller
    const products = sampleProducts.map(p => ({ ...p, seller: user._id, isActive: true }));
    await Product.insertMany(products);

    console.log(`✅ Seeded ${products.length} products successfully!`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
