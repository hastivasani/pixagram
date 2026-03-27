const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const upload  = require("../middleware/upload");
const ctrl    = require("../controllers/bookingController");

// Services — specific routes before :id
router.get("/services/categories",         protect, ctrl.getServiceCategories);
router.get("/services/mine",               protect, ctrl.getMyServices);
router.get("/services",                    protect, ctrl.getServices);
router.get("/services/:id",                protect, ctrl.getService);
router.get("/services/:id/slots",          protect, ctrl.getAvailableSlots);
router.post("/services",                   protect, upload.array("images", 3), ctrl.createService);
router.put("/services/:id",                protect, ctrl.updateService);
router.delete("/services/:id",             protect, ctrl.deleteService);

// Bookings
router.post("/bookings",                   protect, ctrl.createBooking);
router.get("/bookings/mine",               protect, ctrl.getMyBookings);
router.get("/bookings/provider",           protect, ctrl.getProviderBookings);
router.put("/bookings/:id/status",         protect, ctrl.updateBookingStatus);

module.exports = router;
