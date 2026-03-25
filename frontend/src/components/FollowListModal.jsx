import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HiX, HiDotsHorizontal } from "react-icons/hi";
import { getProfile, followUser, blockUser } from "../services/api";
import { useAuth } from "../Context/AuthContext";

function UserMenu({ u, onClose, onBlock, onShare }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div ref={ref} onClick={e => e.stopPropagation()}
        className="w-full sm:w-72 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-center">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{u.username}</p>
        </div>
        {[
          { label: "Block",              action: onBlock,  danger: true },
          { label: "Close Friends",      action: onClose,  danger: false },
          { label: "Share this account", action: onShare,  danger: false },
          { label: "About this account", action: onClose,  danger: false },
          { label: "Cancel",             action: onClose,  danger: false },
        ].map(({ label, action, danger }) => (
          <button key={label} onClick={action}
            className={"w-full py-3.5 text-sm font-medium border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition " + (danger ? "text-red-500" : "text-gray-900 dark:text-white")}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FollowListModal({ title, users = [], onClose }) {
  const navigate   = useNavigate();
  const { user: me } = useAuth();
  const [resolved,  setResolved]  = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [menuUser,  setMenuUser]  = useState(null);

  const isFollowers = title?.toLowerCase().includes("follower");

  useEffect(() => {
    if (!users.length) { setResolved([]); return; }
    const allPopulated = users.every((u) => typeof u === "object" && u.username);
    if (allPopulated) { setResolved(users); return; }
    Promise.all(
      users.map((u) => {
        const id = typeof u === "object" ? u._id : u;
        if (typeof u === "object" && u.username) return Promise.resolve(u);
        return getProfile(id).then(r => r.data).catch(() => ({ _id: id, username: "unknown", avatar: "" }));
      })
    ).then(setResolved);
  }, [users]);

  const handleClick = (username) => {
    if (!username || username === "unknown") return;
    onClose();
    navigate("/profile/" + username);
  };

  const handleAction = async (e, u) => {
    e.stopPropagation();
    const id = u._id || u;
    setLoadingId(id);
    try {
      await followUser(id);
      setResolved(prev => prev.filter(x => (x._id || x) !== id));
    } catch (_) {}
    setLoadingId(null);
  };

  const handleBlock = async (u) => {
    try {
      await blockUser(u._id || u);
      setResolved(prev => prev.filter(x => (x._id || x) !== (u._id || u)));
      setMenuUser(null);
    } catch (_) {}
  };

  const handleShare = (u) => {
    navigator.clipboard.writeText(window.location.origin + "/profile/" + u.username);
    setMenuUser(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-theme-card rounded-2xl w-full max-w-sm shadow-xl border border-theme overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
            <h3 className="font-semibold text-theme-primary text-base">{title}</h3>
            <button onClick={onClose} className="text-theme-secondary hover:text-theme-primary">
              <HiX size={20} />
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-80 scrollbar-hide">
            {resolved.length === 0 && (
              <p className="text-center text-theme-muted text-sm py-8">No users yet.</p>
            )}
            {resolved.map((u) => {
              const id       = u._id || u;
              const username = u.username || "unknown";
              const avatar   = u.avatar || "https://ui-avatars.com/api/?name=" + username;
              const name     = u.name || "";
              const isMe     = me?._id === id;

              return (
                <div key={id} onClick={() => handleClick(username)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-theme-hover cursor-pointer transition">
                  <img src={avatar} alt={username}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    onError={e => { e.target.src = "https://ui-avatars.com/api/?name=" + username; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-theme-primary truncate">{username}</p>
                    {name && <p className="text-xs text-theme-muted truncate">{name}</p>}
                  </div>

                  {!isMe && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Remove/Unfollow */}
                      <button onClick={e => handleAction(e, u)} disabled={loadingId === id}
                        className={"text-xs font-semibold px-3 py-1.5 rounded-lg border transition disabled:opacity-50 " + (isFollowers ? "border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "border-theme text-theme-secondary hover:bg-theme-hover")}>
                        {loadingId === id ? "..." : isFollowers ? "Remove" : "Unfollow"}
                      </button>
                      {/* 3-dot */}
                      <button onClick={e => { e.stopPropagation(); setMenuUser(u); }}
                        className="p-1.5 rounded-full hover:bg-theme-hover transition text-theme-muted">
                        <HiDotsHorizontal size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3-dot menu */}
      {menuUser && (
        <UserMenu
          u={menuUser}
          onClose={() => setMenuUser(null)}
          onBlock={() => handleBlock(menuUser)}
          onShare={() => handleShare(menuUser)}
        />
      )}
    </>
  );
}
