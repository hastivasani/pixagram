const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const gc = require("../controllers/groupController");

router.use(protect);

// IMPORTANT: specific routes BEFORE param routes to avoid conflicts
router.post("/",                          upload.single("avatar"), gc.createGroup);
router.get("/",                           gc.getMyGroups);
router.post("/join/:code",                gc.joinByCode);          // must be before /:id
router.get("/:id",                        gc.getGroup);
router.post("/:id/add-member",            gc.addMember);
router.post("/:id/leave",                 gc.leaveGroup);
router.post("/:id/messages",              upload.single("media"), gc.sendGroupMessage);
router.get("/:id/messages",               gc.getGroupMessages);
router.post("/:id/messages/:msgId/react", gc.reactToGroupMessage);

module.exports = router;
