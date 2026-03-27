const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createPost, getFeed, getExplorePosts, getUserPosts,
  likePost, commentPost, deletePost,
  repostPost, getPostsByHashtag, getTrendingHashtags,
  getTrendingPosts, getTrendingCreators,
  savePost, votePoll, getScheduledPosts, publishScheduled,
  editPost, quotePost, getComments, replyComment, likeComment,
} = require("../controllers/postController");

router.post("/",                  protect, upload.array("media", 10), createPost);
router.get("/feed",               protect, getFeed);
router.get("/explore",            protect, getExplorePosts);
router.get("/trending-hashtags",  protect, getTrendingHashtags);
router.get("/trending-posts",     protect, getTrendingPosts);
router.get("/trending-creators",  protect, getTrendingCreators);
router.get("/scheduled",          protect, getScheduledPosts);
router.get("/hashtag/:tag",       protect, getPostsByHashtag);
router.get("/user/:userId",       protect, getUserPosts);
router.post("/:id/like",          protect, likePost);
router.post("/:id/comment",       protect, commentPost);
router.post("/:id/repost",        protect, repostPost);
router.post("/:id/save",          protect, savePost);
router.post("/:id/vote",          protect, votePoll);
router.post("/:id/publish",       protect, publishScheduled);
router.put("/:id",                protect, editPost);
router.post("/:id/quote",         protect, quotePost);
router.delete("/:id",             protect, deletePost);
router.get("/:id/comments",       protect, getComments);
router.post("/:id/comment",       protect, commentPost);
router.post("/comments/:commentId/reply", protect, replyComment);
router.post("/comments/:commentId/like",  protect, likeComment);

module.exports = router;
