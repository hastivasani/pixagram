const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const ctrl    = require("../controllers/videoController");

// Playlists — specific routes before :id
router.get("/playlists/user/:userId",             protect, ctrl.getUserPlaylists);
router.get("/playlists",                          protect, ctrl.getMyPlaylists);
router.post("/playlists",                         protect, ctrl.createPlaylist);
router.get("/playlists/:id",                      protect, ctrl.getPlaylist);
router.post("/playlists/:id/add",                 protect, ctrl.addToPlaylist);
router.delete("/playlists/:id/remove/:videoId",   protect, ctrl.removeFromPlaylist);
router.delete("/playlists/:id",                   protect, ctrl.deletePlaylist);

// Watch history
router.post("/watch",                             protect, ctrl.recordWatch);
router.get("/history",                            protect, ctrl.getWatchHistory);
router.delete("/history",                         protect, ctrl.clearWatchHistory);

// Recommendations & search
router.get("/recommended",                        protect, ctrl.getRecommendedVideos);
router.get("/search",                             protect, ctrl.searchVideos);

module.exports = router;
