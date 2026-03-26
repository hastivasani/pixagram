const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const upload      = require("../middleware/upload");
const {
  getProfile,
  updateProfile,
  followUser,
  acceptFollow,
  rejectFollow,
  getFollowRequests,
  searchUsers,
  getSuggestedUsers,
  getAllUsers,
  getProfileByUsername,
  togglePrivacy,
  blockUser,
  getBlockedUsers,
  updateNotificationSettings,
  updateMediaSettings,
} = require("../controllers/userController");

router.get("/",                    protect, getAllUsers);
router.get("/search",              protect, searchUsers);
router.get("/suggested",           protect, getSuggestedUsers);
router.get("/follow-requests",     protect, getFollowRequests);
router.get("/blocked",             protect, getBlockedUsers);
router.get("/username/:username",  protect, getProfileByUsername);
router.get("/:id",                 protect, getProfile);
router.put("/profile",             protect, upload.single("avatar"), updateProfile);
router.put("/privacy",             protect, togglePrivacy);
router.put("/notification-settings", protect, updateNotificationSettings);
router.put("/media-settings",        protect, updateMediaSettings);
router.post("/:id/follow",         protect, followUser);
router.post("/:id/block",          protect, blockUser);
router.post("/:id/accept-follow",  protect, acceptFollow);
router.post("/:id/reject-follow",  protect, rejectFollow);

module.exports = router;
