const crypto      = require("crypto");
const bcrypt      = require("bcryptjs");
const User        = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const nodemailer  = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: "If that email exists, a reset link was sent" });

    // Invalidate old tokens
    await PasswordReset.deleteMany({ user: user._id });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordReset.create({ user: user._id, token, expiresAt });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    if (process.env.SMTP_USER) {
      await transporter.sendMail({
        from: `"Pixagram" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Reset your Pixagram password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2>Password Reset</h2>
            <p>Hi ${user.username}, click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#a855f7;color:#fff;border-radius:8px;text-decoration:none">Reset Password</a>
            <p style="color:#888;font-size:12px;margin-top:16px">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
    }

    // In dev, return token directly
    const response = { message: "If that email exists, a reset link was sent" };
    if (process.env.NODE_ENV !== "production") response.devToken = token;
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const record = await PasswordReset.findOne({ token, used: false });
    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(record.user, { password: hashed });

    record.used = true;
    await record.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.query;
    const record = await PasswordReset.findOne({ token, used: false });
    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ valid: false, message: "Invalid or expired token" });
    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
