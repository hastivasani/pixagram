const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { createStory, getStories, viewStory } = require("../controllers/storyController");

router.post("/", protect, upload.single("media"), createStory);
router.get("/", protect, getStories);
router.post("/:id/view", protect, viewStory);

module.exports = router;
