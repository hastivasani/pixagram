const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const vc = require("../controllers/voiceRoomController");

router.use(protect);

router.post("/",          vc.createRoom);
router.get("/",           vc.getActiveRooms);
router.post("/:id/join",  vc.joinRoom);
router.post("/:id/leave", vc.leaveRoom);
router.post("/:id/close", vc.closeRoom);

module.exports = router;
