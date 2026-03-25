const Note = require("../models/Note");
const User = require("../models/User");

// POST /api/notes — create or replace my note
exports.upsertNote = async (req, res) => {
  try {
    const { text, song, songArtist } = req.body;
    if (!text && !song) return res.status(400).json({ message: "Note text or song required" });

    // Delete any existing note by this user first
    await Note.deleteMany({ user: req.user._id });

    const note = await Note.create({
      user:       req.user._id,
      text:       text || "",
      song:       song || "",
      songArtist: songArtist || "",
    });

    const populated = await note.populate("user", "username avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/notes — delete my note
exports.deleteNote = async (req, res) => {
  try {
    await Note.deleteMany({ user: req.user._id });
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/notes — get notes from people I follow + my own
exports.getNotes = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const ids = [...(me.following || []).map(String), req.user._id.toString()];

    const notes = await Note.find({
      user:      { $in: ids },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar");

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
