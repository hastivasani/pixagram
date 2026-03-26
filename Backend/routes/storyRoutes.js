const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { createStory, getStories, viewStory, getStoryViewers, reactToStory, commentOnStory } = require("../controllers/storyController");

router.post("/",              protect, upload.single("media"), createStory);
router.get("/",               protect, getStories);
router.post("/:id/view",      protect, viewStory);
router.get("/:id/viewers",    protect, getStoryViewers);
router.post("/:id/react",     protect, reactToStory);
router.post("/:id/comment",   protect, commentOnStory);

module.exports = router;
