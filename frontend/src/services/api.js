import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) =>
  api.post("/auth/register", data, {
    headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  });
export const loginUser = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

// Users
export const getProfile = (id) => api.get(`/users/${id}`);
export const getProfileByUsername = (username) => api.get(`/users/username/${username}`);
export const getAllUsers = () => api.get("/users");
export const updateProfile = (data) =>
  api.put("/users/profile", data, {
    headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  });
export const followUser        = (id) => api.post(`/users/${id}/follow`);
export const acceptFollow      = (id) => api.post(`/users/${id}/accept-follow`);
export const rejectFollow      = (id) => api.post(`/users/${id}/reject-follow`);
export const getFollowRequests = ()   => api.get("/users/follow-requests");
export const searchUsers = (q) => api.get(`/users/search?q=${q}`);
export const getSuggestedUsers = () => api.get("/users/suggested");
export const togglePrivacy   = ()   => api.put("/users/privacy");
export const blockUser       = (id) => api.post(`/users/${id}/block`);
export const getBlockedUsers = ()   => api.get("/users/blocked");
export const changePassword  = (data) => api.put("/auth/change-password", data);
export const deleteAccount   = (data) => api.delete("/auth/delete-account", { data });

// Posts
export const createPost = (data) => api.post("/posts", data);
export const getFeed = (page = 1) => api.get(`/posts/feed?page=${page}`);
export const getExplorePosts = () => api.get("/posts/explore");
export const getUserPosts = (userId) => api.get(`/posts/user/${userId}`);
export const likePost = (id) => api.post(`/posts/${id}/like`);
export const commentPost = (id, text) => api.post(`/posts/${id}/comment`, { text });
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Stories
export const createStory = (data) => api.post("/stories", data);
export const getStories = () => api.get("/stories");
export const viewStory = (id) => api.post(`/stories/${id}/view`);

// Reels
export const createReel = (data) => api.post("/reels", data);
export const getReels = () => api.get("/reels");
export const likeReel = (id) => api.post(`/reels/${id}/like`);
export const commentReel = (id, text) => api.post(`/reels/${id}/comment`, { text });

// Messages
export const sendMessage = (data) =>
  api.post("/messages", data, {
    headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  });
export const getConversation = (userId) => api.get(`/messages/${userId}`);
export const getConversationList = () => api.get("/messages");

// Notifications
export const getNotifications = () => api.get("/notifications");
export const markAllRead = () => api.put("/notifications/read-all");
export const markOneRead = (id) => api.put(`/notifications/${id}/read`);
export const getUnreadCount = () => api.get("/notifications/unread-count");

// Notes
export const getNotes    = ()     => api.get("/notes");
export const upsertNote  = (data) => api.post("/notes", data);
export const deleteNote  = ()     => api.delete("/notes");

export default api;
