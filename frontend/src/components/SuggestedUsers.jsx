import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSuggestedUsers, followUser } from "../services/api";
import { useAuth } from "../Context/AuthContext";

const avatar = (u) =>
  u?.avatar || `https://ui-avatars.com/api/?name=${u?.username || "U"}&background=random`;

export default function SuggestedUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggested,    setSuggested]    = useState([]);
  const [followStatus, setFollowStatus] = useState({});

  useEffect(() => {
    getSuggestedUsers().then((res) => {
      setSuggested(res.data);
      const init = {};
      res.data.forEach((u) => {
        init[u._id] = u.followers?.some((f) => (f._id || f) === user?._id) ? "following"
                    : u.followRequests?.some((f) => (f._id || f) === user?._id) ? "requested"
                    : "none";
      });
      setFollowStatus(init);
    }).catch(() => {});
  }, [user?._id]);

  const handleFollow = async (id) => {
    try {
      const res = await followUser(id);
      setFollowStatus((p) => ({
        ...p,
        [id]: res.data.status === "requested"  ? "requested"
             : res.data.status === "unfollowed" ? "none"
             : res.data.status === "cancelled"  ? "none"
             : "following",
      }));
    } catch (_) {}
  };

  return (
    <div className="w-full">
      {/* My profile mini card */}
      {user && (
        <div
          className="flex items-center gap-3 mb-5 cursor-pointer group"
          onClick={() => navigate("/profile")}
        >
          <img
            src={avatar(user)}
            alt={user.username}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-theme-primary truncate group-hover:underline">
              {user.username}
            </p>
            <p className="text-xs text-theme-muted truncate">{user.name || "View profile"}</p>
          </div>
        </div>
      )}

      {/* Suggested header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide">
          Suggested for you
        </p>
        <button
          onClick={() => navigate("/explore")}
          className="text-xs font-semibold text-theme-primary hover:text-theme-muted transition"
        >
          See all
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {suggested.length === 0 && (
          <p className="text-xs text-theme-muted py-2">No suggestions right now.</p>
        )}
        {suggested.map((u) => (
          <div key={u._id} className="flex items-center gap-3">
            <img
              src={avatar(u)}
              alt={u.username}
              onClick={() => navigate(`/profile/${u.username}`)}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 cursor-pointer"
            />
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate(`/profile/${u.username}`)}
            >
              <p className="text-sm font-semibold text-theme-primary truncate hover:underline">
                {u.username}
              </p>
              <p className="text-xs text-theme-muted truncate">Suggested for you</p>
            </div>
            <button
              onClick={() => handleFollow(u._id)}
              className={`text-xs font-semibold flex-shrink-0 transition ${
                followStatus[u._id] === "following" || followStatus[u._id] === "requested"
                  ? "text-theme-muted"
                  : "text-blue-500 hover:text-blue-600"
              }`}
            >
              {followStatus[u._id] === "following" ? "Following"
               : followStatus[u._id] === "requested" ? "Requested"
               : "Follow"}
            </button>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div className="mt-6 flex flex-wrap gap-x-2 gap-y-1">
        {["About", "Help", "Press", "API", "Privacy", "Terms"].map((l) => (
          <span key={l} className="text-[11px] text-theme-muted hover:underline cursor-pointer">{l}</span>
        ))}
        <span className="text-[11px] text-theme-muted mt-1 w-full">© 2025 Pixagram</span>
      </div>
    </div>
  );
}
