const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { sendMessage, getConversation, getConversationList } = require("../controllers/messageController");

router.post("/", protect, upload.single("image"), sendMessage);
router.get("/", protect, getConversationList);
router.get("/:userId", protect, getConversation);

module.exports = router;
