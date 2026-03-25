const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createPost,
  getFeed,
  getExplorePosts,
  getUserPosts,
  likePost,
  commentPost,
  deletePost,
} = require("../controllers/postController");

router.post("/", protect, upload.array("media", 10), createPost);
router.get("/feed", protect, getFeed);
router.get("/explore", protect, getExplorePosts);
router.get("/user/:userId", protect, getUserPosts);
router.post("/:id/like", protect, likePost);
router.post("/:id/comment", protect, commentPost);
router.delete("/:id", protect, deletePost);

module.exports = router;
