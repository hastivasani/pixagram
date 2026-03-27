const VoiceRoom = require("../models/VoiceRoom");

// Create voice room
exports.createRoom = async (req, res) => {
  try {
    const { name, isPublic, maxUsers } = req.body;
    if (!name) return res.status(400).json({ message: "Room name required" });

    const room = await VoiceRoom.create({
      name,
      host: req.user._id,
      participants: [req.user._id],
      isPublic: isPublic !== false,
      maxUsers: maxUsers || 20,
    });

    const populated = await room.populate("participants", "username avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get active public rooms
exports.getActiveRooms = async (req, res) => {
  try {
    const rooms = await VoiceRoom.find({ isActive: true, isPublic: true })
      .populate("host", "username avatar")
      .populate("participants", "username avatar")
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join room
exports.joinRoom = async (req, res) => {
  try {
    const room = await VoiceRoom.findById(req.params.id);
    if (!room || !room.isActive) return res.status(404).json({ message: "Room not found" });
    if (room.participants.length >= room.maxUsers)
      return res.status(400).json({ message: "Room is full" });

    room.participants.addToSet(req.user._id);
    await room.save();

    const io = req.app.get("io");
    io.to("voice_" + room._id).emit("voiceRoomUpdate", { roomId: room._id, participants: room.participants });

    res.json({ message: "Joined", room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const room = await VoiceRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.participants.pull(req.user._id);
    if (room.participants.length === 0) room.isActive = false;
    await room.save();

    const io = req.app.get("io");
    io.to("voice_" + room._id).emit("voiceRoomUpdate", { roomId: room._id, participants: room.participants });

    res.json({ message: "Left room" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Close room (host only)
exports.closeRoom = async (req, res) => {
  try {
    const room = await VoiceRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.host.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not the host" });

    room.isActive = false;
    await room.save();

    const io = req.app.get("io");
    io.to("voice_" + room._id).emit("voiceRoomClosed", { roomId: room._id });

    res.json({ message: "Room closed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
