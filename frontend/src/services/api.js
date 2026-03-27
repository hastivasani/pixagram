import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : `${window.location.origin}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────
export const registerUser = (data) => {
  if (data instanceof FormData) {
    const hasFile = data.get("avatar") instanceof File && data.get("avatar").size > 0;
    if (hasFile) {
      return api.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    // No file — send as JSON to avoid multer/body-parser conflict
    const json = {};
    data.forEach((v, k) => { json[k] = v; });
    return api.post("/auth/register", json, {
      headers: { "Content-Type": "application/json" },
    });
  }
  return api.post("/auth/register", data);
};
export const loginUser = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

// ── Users ─────────────────────────────────────────────────────
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
export const searchUsers       = (q)  => api.get(`/users/search?q=${q}`);
export const getSuggestedUsers = ()   => api.get("/users/suggested");
export const togglePrivacy     = ()   => api.put("/users/privacy");
export const blockUser         = (id) => api.post(`/users/${id}/block`);
export const getBlockedUsers   = ()   => api.get("/users/blocked");
export const changePassword    = (data) => api.put("/auth/change-password", data);
export const deleteAccount     = (data) => api.delete("/auth/delete-account", { data });
export const updateNotificationSettings = (data) => api.put("/users/notification-settings", data);
export const updateMediaSettings        = (data) => api.put("/users/media-settings", data);

// ── Posts ─────────────────────────────────────────────────────
export const createPost         = (data) => api.post("/posts", data);
export const getFeed = (page = 1, twitterOnly = false, excludeTwitter = false) =>
  api.get(`/posts/feed?page=${page}${twitterOnly ? "&twitter=1" : ""}${excludeTwitter ? "&notwitter=1" : ""}`);
export const getExplorePosts    = (twitterOnly = false) => api.get(`/posts/explore${twitterOnly ? "?twitter=1" : ""}`);
export const getUserPosts       = (userId) => api.get(`/posts/user/${userId}`);
export const likePost           = (id) => api.post(`/posts/${id}/like`);
export const commentPost        = (id, text) => api.post(`/posts/${id}/comment`, { text });
export const deletePost         = (id) => api.delete(`/posts/${id}`);
export const repostPost         = (id, caption = "") => api.post(`/posts/${id}/repost`, { caption });
export const getPostsByHashtag  = (tag) => api.get(`/posts/hashtag/${tag}`);
export const getTrendingHashtags= () => api.get("/posts/trending-hashtags");
export const getTrendingPosts   = () => api.get("/posts/trending-posts");
export const getTrendingCreators= () => api.get("/posts/trending-creators");
export const savePost           = (id) => api.post(`/posts/${id}/save`);
export const votePoll           = (id, optionIndex) => api.post(`/posts/${id}/vote`, { optionIndex });
export const getScheduledPosts  = () => api.get("/posts/scheduled");
export const publishScheduled   = (id) => api.post(`/posts/${id}/publish`);

// ── User Extended ─────────────────────────────────────────────
export const toggleCloseFriend  = (id) => api.post(`/users/${id}/close-friend`);
export const getCloseFriends    = () => api.get("/users/close-friends");
export const getSavedPosts      = () => api.get("/users/saved-posts");
export const getCreatorAnalytics= () => api.get("/users/analytics");
export const getLoginActivity   = () => api.get("/users/login-activity");
export const generateReferral   = () => api.get("/users/referral");
export const useReferral        = (code) => api.post("/users/referral/use", { code });
export const checkInStreak      = () => api.post("/users/streak/checkin");
export const updateBioLinks     = (bioLinks) => api.put("/users/bio-links", { bioLinks });
export const updateProfileMusic = (data) => api.put("/users/profile-music", data);
export const updateProfileTheme = (data) => api.put("/users/profile-theme", data);
export const updateWordFilter   = (wordFilter) => api.put("/users/word-filter", { wordFilter });

// ── Stories ───────────────────────────────────────────────────
export const createStory    = (data) => api.post("/stories", data);
export const getStories     = () => api.get("/stories");
export const viewStory      = (id) => api.post(`/stories/${id}/view`);
export const getStoryViewers= (id) => api.get(`/stories/${id}/viewers`);
export const reactToStory   = (id, emoji) => api.post(`/stories/${id}/react`, { emoji });
export const commentOnStory = (id, text)  => api.post(`/stories/${id}/comment`, { text });

// ── Reels ─────────────────────────────────────────────────────
export const createReel  = (data) => api.post("/reels", data);
export const getReels    = () => api.get("/reels");
export const likeReel    = (id) => api.post(`/reels/${id}/like`);
export const commentReel = (id, text) => api.post(`/reels/${id}/comment`, { text });

// ── Messages ──────────────────────────────────────────────────
export const sendMessage = (data) =>
  api.post("/messages", data, {
    headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  });
export const getConversation     = (userId) => api.get(`/messages/${userId}`);
export const getConversationList = () => api.get("/messages");
export const reactToMessage      = (id, emoji) => api.post(`/messages/${id}/react`, { emoji });
export const deleteMessage       = (id) => api.delete(`/messages/${id}`);

// ── Groups ────────────────────────────────────────────────────
export const createGroup         = (name, description = "", isPublic = true) =>
  api.post("/groups", { name, description, isPublic });
export const getMyGroups         = () => api.get("/groups");
export const getGroup            = (id) => api.get(`/groups/${id}`);
export const joinGroupByCode     = (code) => api.post(`/groups/join/${code}`);
export const addGroupMember      = (id, userId) => api.post(`/groups/${id}/add-member`, { userId });
export const leaveGroup          = (id) => api.post(`/groups/${id}/leave`);
export const sendGroupMessage    = (id, text, mediaFile = null) => {
  if (mediaFile) {
    const fd = new FormData();
    fd.append("text", text || "");
    fd.append("media", mediaFile);
    return api.post(`/groups/${id}/messages`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  }
  return api.post(`/groups/${id}/messages`, { text });
};
export const getGroupMessages    = (id, page = 1) => api.get(`/groups/${id}/messages?page=${page}`);
export const reactToGroupMessage = (id, msgId, emoji) => api.post(`/groups/${id}/messages/${msgId}/react`, { emoji });

// ── Gaming ────────────────────────────────────────────────────
export const createLobby     = (data) => api.post("/gaming/lobby", data);
export const getLobby        = (id) => api.get(`/gaming/lobby/${id}`);
export const joinLobbyByCode = (code) => api.post(`/gaming/lobby/join/${code}`);
export const getLeaderboard  = (game) => api.get(`/gaming/leaderboard/${game}`);
export const updateScore     = (data) => api.post("/gaming/score", data);
export const getMyGameStats  = () => api.get("/gaming/my-stats");

// ── Voice Rooms ───────────────────────────────────────────────
export const createVoiceRoom  = (data) => api.post("/voice-rooms", data);
export const getActiveRooms   = () => api.get("/voice-rooms");
export const joinVoiceRoom    = (id) => api.post(`/voice-rooms/${id}/join`);
export const leaveVoiceRoom   = (id) => api.post(`/voice-rooms/${id}/leave`);
export const closeVoiceRoom   = (id) => api.post(`/voice-rooms/${id}/close`);

// ── Notifications ─────────────────────────────────────────────
export const getNotifications = () => api.get("/notifications");
export const markAllRead      = () => api.put("/notifications/read-all");
export const markOneRead      = (id) => api.put(`/notifications/${id}/read`);
export const getUnreadCount   = () => api.get("/notifications/unread-count");

// ── Notes ─────────────────────────────────────────────────────
export const getNotes   = ()     => api.get("/notes");
export const upsertNote = (data) => api.post("/notes", data);
export const deleteNote = ()     => api.delete("/notes");

export default api;

// ── Shop ──────────────────────────────────────────────────────
export const getProducts       = (params = "") => api.get(`/shop/products${params}`);
export const getProduct        = (id) => api.get(`/shop/products/${id}`);
export const getMyProducts     = () => api.get("/shop/products/mine");
export const createProduct     = (data) => api.post("/shop/products", data, {
  headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
});
export const updateProduct     = (id, data) => api.put(`/shop/products/${id}`, data, {
  headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
});
export const deleteProduct     = (id) => api.delete(`/shop/products/${id}`);
export const addProductReview  = (id, data) => api.post(`/shop/products/${id}/review`, data);
export const getProductCategories = () => api.get("/shop/products/categories");

export const getCart           = () => api.get("/shop/cart");
export const addToCart         = (productId, quantity = 1) => api.post("/shop/cart", { productId, quantity });
export const updateCartItem    = (productId, quantity) => api.put(`/shop/cart/${productId}`, { quantity });
export const removeFromCart    = (productId) => api.delete(`/shop/cart/${productId}`);
export const clearCart         = () => api.delete("/shop/cart");

export const createOrder       = (data) => api.post("/shop/orders", data);
export const getMyOrders       = () => api.get("/shop/orders");
export const getOrder          = (id) => api.get(`/shop/orders/${id}`);
export const cancelOrder       = (id, reason) => api.post(`/shop/orders/${id}/cancel`, { reason });
export const getSellerOrders   = () => api.get("/shop/seller/orders");
export const updateOrderStatus = (id, data) => api.put(`/shop/seller/orders/${id}/status`, data);

// ── Booking ───────────────────────────────────────────────────
export const getServices          = (params = "") => api.get(`/booking/services${params}`);
export const getService           = (id) => api.get(`/booking/services/${id}`);
export const getMyServices        = () => api.get("/booking/services/mine");
export const createService        = (data) => api.post("/booking/services", data, {
  headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
});
export const updateService        = (id, data) => api.put(`/booking/services/${id}`, data);
export const deleteService        = (id) => api.delete(`/booking/services/${id}`);
export const getAvailableSlots    = (id, date) => api.get(`/booking/services/${id}/slots?date=${date}`);
export const getServiceCategories = () => api.get("/booking/services/categories");

export const createBooking        = (data) => api.post("/booking/bookings", data);
export const getMyBookings        = () => api.get("/booking/bookings/mine");
export const getProviderBookings  = () => api.get("/booking/bookings/provider");
export const updateBookingStatus  = (id, status, cancelReason) =>
  api.put(`/booking/bookings/${id}/status`, { status, cancelReason });

// ── Video Platform ────────────────────────────────────────────
export const createPlaylist       = (data) => api.post("/video/playlists", data);
export const getMyPlaylists       = () => api.get("/video/playlists");
export const getUserPlaylists     = (userId) => api.get(`/video/playlists/user/${userId}`);
export const getPlaylist          = (id) => api.get(`/video/playlists/${id}`);
export const addToPlaylist        = (id, videoId) => api.post(`/video/playlists/${id}/add`, { videoId });
export const removeFromPlaylist   = (id, videoId) => api.delete(`/video/playlists/${id}/remove/${videoId}`);
export const deletePlaylist       = (id) => api.delete(`/video/playlists/${id}`);
export const recordWatch          = (reelId, watchTime) => api.post("/video/watch", { reelId, watchTime });
export const getWatchHistory      = () => api.get("/video/history");
export const clearWatchHistory    = () => api.delete("/video/history");
export const getRecommendedVideos = () => api.get("/video/recommended");
export const searchVideos         = (q) => api.get(`/video/search?q=${q}`);

// ── Search ────────────────────────────────────────────────────
export const globalSearch         = (q, type = "all") => api.get(`/search?q=${encodeURIComponent(q)}&type=${type}`);
export const autocomplete         = (q) => api.get(`/search/autocomplete?q=${encodeURIComponent(q)}`);
export const searchMessages       = (q, userId) => api.get(`/search/messages?q=${encodeURIComponent(q)}&userId=${userId}`);

// ── Password Reset ────────────────────────────────────────────
export const requestPasswordReset = (email) => api.post("/password/request", { email });
export const resetPassword        = (token, newPassword) => api.post("/password/reset", { token, newPassword });
export const verifyResetToken     = (token) => api.get(`/password/verify?token=${token}`);

// ── Post extras ───────────────────────────────────────────────
export const editPost             = (id, data) => api.put(`/posts/${id}`, data);
export const quotePost            = (id, caption) => api.post(`/posts/${id}/quote`, { caption });

// ── Comments (threaded) ───────────────────────────────────────
export const getComments    = (postId) => api.get(`/posts/${postId}/comments`);
export const replyComment   = (commentId, text) => api.post(`/posts/comments/${commentId}/reply`, { text });
export const likeComment    = (commentId) => api.post(`/posts/comments/${commentId}/like`);

// ── News ──────────────────────────────────────────────────────
export const getNews = () => api.get("/news");

// ── Admin ─────────────────────────────────────────────────────
export const adminGetStats    = ()           => api.get("/admin/stats");
export const adminGetUsers    = (params="")  => api.get(`/admin/users${params}`);
export const adminUpdateUser  = (id, data)   => api.put(`/admin/users/${id}`, data);
export const adminDeleteUser  = (id)         => api.delete(`/admin/users/${id}`);
export const adminGetPosts    = (params="")  => api.get(`/admin/posts${params}`);
export const adminDeletePost  = (id)         => api.delete(`/admin/posts/${id}`);
export const adminGetOrders   = (params="")  => api.get(`/admin/orders${params}`);
export const adminGetBookings = (params="")  => api.get(`/admin/bookings${params}`);
