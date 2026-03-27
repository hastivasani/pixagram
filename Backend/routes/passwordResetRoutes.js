const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/passwordResetController");

router.post("/request",  ctrl.requestReset);
router.post("/reset",    ctrl.resetPassword);
router.get("/verify",    ctrl.verifyToken);

module.exports = router;
