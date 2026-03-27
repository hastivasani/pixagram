import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfileByUsername, getUserPosts, followUser, blockUser } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import GalleryProfile from "../components/GalleryProfile";
import FollowListModal from "../components/FollowListModal";
import { HiDotsHorizontal, HiX } from "react-icons/hi";
import { FaMusic, FaPlay, FaPause, FaLink } from "react-icons/fa";

function ThreeDotMenu({ onBlock, onShare, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { label: "Block",            action: onBlock,  danger: true },
    { label: "Close Friends",    action: onClose,  danger: false },
    { label: "Share this account", action: onShare, danger: false },
    { label: "About this account", action: onClose, danger: false },
    { label: "Report",           action: onClose,  danger: true },
    { label: "Cancel",           action: onClose,  danger: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div ref={menuRef} onClick={e => e.stopPropagation()}
        className="w-full sm:w-80 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        {items.map(({ label, action, danger }) => (
          <button key={label} onClick={action}
            className={"w-full py-3.5 text-sm font-medium border-b border-gray-100 dark:border-gray-800 last:border-0 transition hover:bg-gray-50 dark:hover:bg-gray-800 " + (danger ? "text-red-500" : "text-gray-900 dark:text-white")}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileMusicPlayer({ musicUrl, musicName, color }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };
  return (
    <div className="flex items-center gap-2 rounded-full px-3 py-1.5 mt-2 w-fit border"
      style={{ borderColor: color + "66", background: color + "11" }}>
      <FaMusic style={{ color }} className="text-xs flex-shrink-0" />
      <span className="text-xs text-theme-secondary truncate max-w-[120px]">{musicName || "Profile Music"}</span>
      <button onClick={toggle} style={{ color }} className="hover:opacity-70 transition flex-shrink-0">
        {playing ? <FaPause size={10} /> : <FaPlay size={10} />}
      </button>
      <audio ref={audioRef} src={musicUrl} onEnded={() => setPlaying(false)} />
    </div>
  );
}

export default function UserProfile() {
  const { username } = useParams();
  const navigate     = useNavigate();
  const { user: me } = useAuth();

  const [profileUser,  setProfileUser]  = useState(null);
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [followStatus, setFollowStatus] = useState("none");
  const [error,        setError]        = useState("");
  const [followModal,  setFollowModal]  = useState(null);
  const [showMenu,     setShowMenu]     = useState(false);
  const [isBlocked,    setIsBlocked]    = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    getProfileByUsername(username)
      .then((res) => {
        const u = res.data;
        setProfileUser(u);
        const isFollowing = u.followers?.some((f) => (f._id || f) === me?._id);
        const isRequested = u.followRequests?.some((f) => (f._id || f) === me?._id);
        setFollowStatus(isFollowing ? "following" : isRequested ? "requested" : "none");
        return getUserPosts(u._id);
      })
      .then((res) => setPosts(res.data))
      .catch(() => setError("User not found"))
      .finally(() => setLoading(false));
  }, [username, me?._id]);

  const handleFollow = async () => {
    if (!profileUser) return;
    try {
      const res = await followUser(profileUser._id);
      if (res.data.status === "requested")  setFollowStatus("requested");
      else if (res.data.status === "cancelled") setFollowStatus("none");
      else if (res.data.status === "unfollowed") {
        setFollowStatus("none");
        setProfileUser(prev => ({ ...prev, followers: (prev.followers||[]).filter(f => (f._id||f) !== me._id) }));
      } else if (res.data.status === "following") setFollowStatus("following");
    } catch (err) { console.error(err); }
  };

  const handleBlock = async () => {
    if (!profileUser) return;
    try {
      await blockUser(profileUser._id);
      setIsBlocked(true);
      setShowMenu(false);
      navigate(-1);
    } catch (_) {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowMenu(false);
  };

  const btnLabel = followStatus === "following" ? "Following"
                 : followStatus === "requested" ? "Requested"
                 : "Follow";
  const btnClass = followStatus === "following"
    ? "bg-theme-secondary text-theme-primary hover:bg-theme-hover"
    : followStatus === "requested"
    ? "bg-theme-secondary text-theme-muted cursor-default"
    : "bg-blue-600 text-white hover:bg-blue-700";

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-theme-primary">
      <p className="text-theme-muted">Loading profile...</p>
    </div>
  );

  if (error || !profileUser) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-theme-primary">
      <p className="text-theme-muted text-lg">User not found</p>
      <button onClick={() => navigate("/")} className="text-blue-500 hover:underline text-sm">Go home</button>
    </div>
  );

  const isOwnProfile = me?._id === profileUser._id;

  // Profile theme color
  const themeColor = profileUser.profileColor || "#a855f7";

  return (
    <div className="bg-theme-primary min-h-screen pb-[68px] md:pb-0">

      {/* Themed header banner */}
      <div className="h-16 w-full"  />

      {/* Header section */}
      <div className="max-w-[935px] mx-auto px-4 pb-4 -mt-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-theme-primary">{profileUser.username}</h2>
          {!isOwnProfile && (
            <button onClick={() => setShowMenu(true)} className="p-2 rounded-full hover:bg-theme-hover transition">
              <HiDotsHorizontal size={20} className="text-theme-primary" />
            </button>
          )}
        </div>

      {/* Profile card — Instagram style, no card box */}
        <div className="flex items-start gap-6 sm:gap-12 mb-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <img
                src={profileUser.avatar || `https://ui-avatars.com/api/?name=${profileUser.username}`}
                alt={profileUser.username}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white dark:border-gray-900"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Username + actions */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-theme-primary">{profileUser.username}</h2>
              {!isOwnProfile && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={handleFollow}
                    className={"px-4 py-1.5 text-sm font-semibold rounded-lg transition " + btnClass}>
                    {btnLabel}
                  </button>
                  <button onClick={() => navigate("/messages", { state: { chatUser: profileUser } })}
                    className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-theme-secondary text-theme-primary hover:bg-theme-hover transition">
                    Message
                  </button>
                </div>
              )}
              {isOwnProfile && (
                <button onClick={() => navigate("/profile")}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-theme-secondary text-theme-primary hover:bg-theme-hover transition">
                  Edit profile
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 sm:gap-8 mb-4">
              {[
                ["posts",     posts.length,                       null],
                ["followers", profileUser.followers?.length || 0, () => setFollowModal("followers")],
                ["following", profileUser.following?.length || 0, () => setFollowModal("following")],
              ].map(([label, val, onClick]) => (
                <button key={label} onClick={onClick || undefined}
                  className="flex flex-col items-center sm:items-start">
                  <span className="text-sm sm:text-base font-bold text-theme-primary">{Number(val).toLocaleString()}</span>
                  <span className="text-xs text-theme-muted">{label}</span>
                </button>
              ))}
            </div>

            {profileUser.name    && <p className="text-[13px] font-semibold text-theme-primary mb-0.5">{profileUser.name}</p>}
            {profileUser.bio     && <p className="text-[13px] text-theme-secondary mb-1">{profileUser.bio}</p>}
            {profileUser.website && <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue-500 hover:underline">{profileUser.website}</a>}

            {/* Bio Links */}
            {profileUser.bioLinks?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profileUser.bioLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs rounded-full px-2.5 py-1 border transition hover:opacity-80"
                    style={{ borderColor: themeColor, color: themeColor }}>
                    <FaLink size={9} /> {link.title || link.url}
                  </a>
                ))}
              </div>
            )}

            {/* Profile Music */}
            {profileUser.profileMusic && (
              <ProfileMusicPlayer musicUrl={profileUser.profileMusic} musicName={profileUser.profileMusicName} color={themeColor} />
            )}
          </div>
        </div>
      </div>{/* end max-width header */}

      {/* Divider */}
      <div className="border-t border-theme" />

      {/* Posts — full width */}
      {(isOwnProfile || followStatus === "following") ? (
        <GalleryProfile posts={posts} loading={false} />
      ) : (
        <div className="text-center py-16">
          <p className="text-theme-muted text-sm">
            {followStatus === "requested"
              ? "Follow request sent. Posts will appear once accepted."
              : "Follow this account to see their posts."}
          </p>
        </div>
      )}

      {/* Follow list modals */}
      {followModal && (
        <FollowListModal
          title={followModal === "followers" ? "Followers" : "Following"}
          users={followModal === "followers" ? (profileUser.followers||[]) : (profileUser.following||[])}
          onClose={() => setFollowModal(null)}
        />
      )}

      {/* 3-dot menu */}
      {showMenu && (
        <ThreeDotMenu
          onBlock={handleBlock}
          onShare={handleShare}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
