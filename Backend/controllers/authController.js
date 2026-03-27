const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  bio: user.bio,
  website: user.website,
  followers: user.followers,
  following: user.following,
});

exports.register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    console.log("[REGISTER] body:", { username, email, name, hasPassword: !!password });

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    let avatarUrl = "";
    if (req.file) {
      const uploadToCloudinary = require("../utils/uploadToCloudinary");
      const result = await uploadToCloudinary(req.file.buffer, "pixagram/avatars", "image");
      avatarUrl = result.secure_url;
    }

    const user = await User.create({
      username, email, password: hashed, name: name || username, avatar: avatarUrl,
    });

    res.status(201).json({ token: generateToken(user._id), user: formatUser(user) });
  } catch (err) {
    console.error("[REGISTER ERROR]", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Log failed attempt
      await User.findByIdAndUpdate(user._id, {
        $push: { loginActivity: { ip: req.ip, device: req.headers["user-agent"]?.slice(0,100) || "Unknown", success: false } },
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Log successful login
    await User.findByIdAndUpdate(user._id, {
      $push: { loginActivity: { ip: req.ip, device: req.headers["user-agent"]?.slice(0,100) || "Unknown", success: true } },
    });

    res.json({ token: generateToken(user._id), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -loginActivity")
      .populate("followers", "username name avatar")
      .populate("following", "username name avatar");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both fields required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
