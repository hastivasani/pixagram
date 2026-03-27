import { getAvatar } from "../../utils/timeAgo";

/**
 * Avatar — consistent avatar across the app.
 * @param {object} user   - user object with avatar/username
 * @param {string} size   - tailwind size class e.g. "w-10 h-10"
 * @param {string} className - extra classes
 * @param {Function} onClick
 */
export default function Avatar({ user, size = "w-10 h-10", className = "", onClick }) {
  return (
    <img
      src={getAvatar(user)}
      alt={user?.username || "user"}
      className={`${size} rounded-full object-cover flex-shrink-0 ${onClick ? "cursor-pointer hover:opacity-90" : ""} ${className}`}
      onClick={onClick}
      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=U&background=random`; }}
    />
  );
}
