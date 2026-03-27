export const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return "Just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const getAvatar = (u) =>
  u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.username || u?.name || "U")}&background=random`;
