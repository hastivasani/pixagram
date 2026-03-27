const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const gc = require("../controllers/gameController");

router.use(protect);

router.post("/lobby",              gc.createLobby);
router.get("/lobby/:id",           gc.getLobby);
router.post("/lobby/join/:code",   gc.joinLobby);
router.get("/leaderboard/:game",   gc.getLeaderboard);
router.post("/score",              gc.updateScore);
router.get("/my-stats",            gc.getMyStats);

module.exports = router;
