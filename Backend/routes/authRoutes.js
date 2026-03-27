const express = require("express");
const router = express.Router();
const { register, login, getMe, changePassword, deleteAccount } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/register", (req, res, next) => {
  // Try multer first (for file uploads), fallback to json body
  upload.single("avatar")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);

module.exports = router;
