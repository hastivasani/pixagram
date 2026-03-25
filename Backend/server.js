const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://localhost:5173",
  "http://192.168.29.58:5173",
  "https://192.168.29.58:5173",
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Track online users: userId -> socketId
const onlineUsers = new Map();

// Track active live streams: hostUserId -> { socketId, hostName, hostAvatar, viewers: Set }
const liveStreams = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log(`[SOCKET] Connected: ${userId} | online: ${[...onlineUsers.keys()]}`);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  }

  // ── WebRTC Signaling ──────────────────────────────────────────
  // Caller → Callee: incoming call
  socket.on("callUser", ({ to, signal, from, callerName, callerAvatar, callType }) => {
    const targetSocket = onlineUsers.get(to);
    console.log(`[CALL] ${from} → ${to} | targetSocket: ${targetSocket || "NOT FOUND"} | online: ${[...onlineUsers.keys()]}`);
    if (targetSocket) {
      io.to(targetSocket).emit("incomingCall", { signal, from, callerName, callerAvatar, callType });
    }
  });

  // Callee → Caller: accepted, send answer signal
  socket.on("answerCall", ({ to, signal }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("callAccepted", { signal });
    }
  });

  // Either side: end call
  socket.on("endCall", ({ to }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("callEnded");
    }
  });

  // ICE candidate relay
  socket.on("iceCandidate", ({ to, candidate }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("iceCandidate", { candidate });
    }
  });

  // ── Live Streaming ────────────────────────────────────────────
  socket.on("startLive", ({ hostId, hostName, hostAvatar, followers }) => {
    liveStreams.set(hostId, { socketId: socket.id, hostName, hostAvatar, viewers: new Set() });
    // Notify all online followers
    followers.forEach(fid => {
      const fSocket = onlineUsers.get(fid);
      if (fSocket) io.to(fSocket).emit("liveStarted", { hostId, hostName, hostAvatar });
    });
    console.log(`[LIVE] ${hostName} started live`);
  });

  socket.on("joinLive", ({ hostId, viewerId, viewerName }) => {
    const live = liveStreams.get(hostId);
    if (!live) return socket.emit("liveEnded");
    live.viewers.add(viewerId);
    socket.join("live_" + hostId);
    // Tell host a viewer joined
    io.to(live.socketId).emit("viewerJoined", { viewerId, viewerName, count: live.viewers.size });
    // Send current viewer count to joiner
    socket.emit("liveViewerCount", { count: live.viewers.size });
  });

  socket.on("liveOffer", ({ hostId, viewerId, signal }) => {
    const live = liveStreams.get(hostId);
    if (live) io.to(live.socketId).emit("liveOffer", { viewerId, signal });
  });

  socket.on("liveAnswer", ({ viewerId, signal }) => {
    const vSocket = onlineUsers.get(viewerId);
    if (vSocket) io.to(vSocket).emit("liveAnswer", { signal });
  });

  socket.on("liveIce", ({ to, candidate, isHost, hostId }) => {
    if (isHost) {
      const vSocket = onlineUsers.get(to);
      if (vSocket) io.to(vSocket).emit("liveIce", { candidate });
    } else {
      const live = liveStreams.get(hostId);
      if (live) io.to(live.socketId).emit("liveIce", { candidate, from: to });
    }
  });

  socket.on("liveComment", ({ hostId, viewerName, text }) => {
    io.to("live_" + hostId).emit("liveComment", { viewerName, text });
    const live = liveStreams.get(hostId);
    if (live) io.to(live.socketId).emit("liveComment", { viewerName, text });
  });

  socket.on("liveLike", ({ hostId, viewerName }) => {
    const live = liveStreams.get(hostId);
    if (!live) return;
    if (!live.likes) live.likes = 0;
    live.likes++;
    io.to("live_" + hostId).emit("liveLike", { count: live.likes, viewerName });
    io.to(live.socketId).emit("liveLike", { count: live.likes, viewerName });
  });

  socket.on("liveEmoji", ({ hostId, emoji, viewerName }) => {
    const live = liveStreams.get(hostId);
    io.to("live_" + hostId).emit("liveEmoji", { emoji, viewerName });
    if (live) io.to(live.socketId).emit("liveEmoji", { emoji, viewerName });
  });

  socket.on("endLive", ({ hostId, followers }) => {
    liveStreams.delete(hostId);
    io.to("live_" + hostId).emit("liveEnded");
    followers?.forEach(fid => {
      const fSocket = onlineUsers.get(fid);
      if (fSocket) io.to(fSocket).emit("liveEnded_" + hostId);
    });
    console.log(`[LIVE] ${hostId} ended live`);
  });

  socket.on("leaveLive", ({ hostId, viewerId }) => {
    const live = liveStreams.get(hostId);
    if (live) {
      live.viewers.delete(viewerId);
      io.to(live.socketId).emit("viewerLeft", { viewerId, count: live.viewers.size });
    }
    socket.leave("live_" + hostId);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

app.set("io", io);
app.set("onlineUsers", onlineUsers);

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/reels", require("./routes/reelRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/notes",         require("./routes/noteRoutes"));

app.get("/", (req, res) => res.send("Pixagram API running 🚀"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
