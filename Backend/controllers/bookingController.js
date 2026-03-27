const Booking = require("../models/Booking");
const Service = require("../models/Service");
const User    = require("../models/User");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// ── Services ──────────────────────────────────────────────────

exports.createService = async (req, res) => {
  try {
    const { title, description, price, duration, category, availability, location, isOnline, maxBookingsPerSlot } = req.body;
    if (!title || !price) return res.status(400).json({ message: "Title and price required" });

    let images = [];
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, "pixagram/services", "image").then(r => r.secure_url))
      );
      images = uploads;
    }

    const service = await Service.create({
      provider: req.user._id,
      title, description,
      price: Number(price),
      duration: Number(duration) || 60,
      category: category || "General",
      images,
      availability: availability ? JSON.parse(availability) : {},
      location: location || "",
      isOnline: isOnline === "true" || isOnline === true,
      maxBookingsPerSlot: Number(maxBookingsPerSlot) || 1,
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const services = await Service.find(filter)
      .populate("provider", "username avatar name isVerified")
      .sort({ rating: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Service.countDocuments(filter);
    res.json({ services, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("provider", "username avatar name isVerified bio");
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, provider: req.user._id });
    if (!service) return res.status(404).json({ message: "Service not found" });
    Object.assign(service, req.body);
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.findOneAndDelete({ _id: req.params.id, provider: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get available slots for a service on a given date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date required" });

    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const allSlots = service.availability[dayName] || [];

    // Check blocked dates
    const isBlocked = service.blockedDates.some(
      d => new Date(d).toDateString() === new Date(date).toDateString()
    );
    if (isBlocked) return res.json({ slots: [] });

    // Get already booked slots for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await Booking.find({
      service: req.params.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    });

    const bookedSlots = booked.map(b => b.timeSlot);
    const available = allSlots.filter(slot => {
      const count = bookedSlots.filter(s => s === slot).length;
      return count < service.maxBookingsPerSlot;
    });

    res.json({ slots: available, allSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Bookings ──────────────────────────────────────────────────

exports.createBooking = async (req, res) => {
  try {
    const { serviceId, date, timeSlot, notes } = req.body;
    if (!serviceId || !date || !timeSlot)
      return res.status(400).json({ message: "Service, date, and time slot required" });

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) return res.status(404).json({ message: "Service not found" });

    // Check slot availability
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingCount = await Booking.countDocuments({
      service: serviceId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingCount >= service.maxBookingsPerSlot)
      return res.status(400).json({ message: "This slot is fully booked" });

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      provider: service.provider,
      date: new Date(date),
      timeSlot,
      notes: notes || "",
      price: service.price,
    });

    await booking.populate([
      { path: "service", select: "title duration category" },
      { path: "provider", select: "username avatar name" },
    ]);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("service", "title duration category images")
      .populate("provider", "username avatar name")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate("user", "username avatar name")
      .populate("service", "title duration")
      .sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { provider: req.user._id }],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    if (req.body.cancelReason) booking.cancelReason = req.body.cancelReason;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.distinct("category", { isActive: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
