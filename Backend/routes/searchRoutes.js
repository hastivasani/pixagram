const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const ctrl    = require("../controllers/searchController");

router.get("/autocomplete", protect, ctrl.autocomplete);
router.get("/messages",     protect, ctrl.searchMessages);
router.get("/",             protect, ctrl.globalSearch);

module.exports = router;
