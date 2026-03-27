const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  sendMessage, getConversation, getConversationList,
  reactToMessage, deleteMessage,
} = require("../controllers/messageController");

router.post("/",                    protect, upload.single("media"), sendMessage);
router.get("/",                     protect, getConversationList);
router.get("/:userId",              protect, getConversation);
router.post("/:id/react",           protect, reactToMessage);
router.delete("/:id",               protect, deleteMessage);

module.exports = router;
