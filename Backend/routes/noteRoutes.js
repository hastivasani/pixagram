const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const { upsertNote, deleteNote, getNotes } = require("../controllers/noteController");

router.get("/",    protect, getNotes);
router.post("/",   protect, upsertNote);
router.delete("/", protect, deleteNote);

module.exports = router;
