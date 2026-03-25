import { io } from "socket.io-client";

// Always connect to same origin — Vite proxy will forward to backend
// This avoids mixed-content (ws:// on https://) errors
const SOCKET_URL = window.location.origin;

let socket = null;
let currentUserId = null;

export const getSocket = (userId) => {
  if (socket && currentUserId !== userId) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Force websocket — skip polling to avoid proxy issues
      transports: ["websocket"],
    });
    currentUserId = userId;
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};
