import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { FaMusic, FaPause, FaPlay, FaUserFriends, FaLink, FaChevronDown, FaChevronUp } from "react-icons/fa";
import GalleryProfile from "../components/GalleryProfile";
import ProfileHeader from "../components/ProfileHeader";
import EditProfileModal from "../components/EditProfileModal";
import FollowListModal from "../components/FollowListModal";
import { useAuth } from "../Context/AuthContext";
import { getUserPosts, getCloseFriends } from "../services/api";
import { getSocket } from "../utils/socket";

// ── Mini Music Player ─────────────────────────────────────────
function MusicPlayer({ musicUrl, musicName }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  if (!musicUrl) return null;
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };
  return (
    <div className="flex items-center gap-2 bg-theme-card border border-theme rounded-full px-3 py-1.5 mt-2 w-fit">
      <FaMusic className="text-purple-400 text-xs flex-shrink-0" />
      <span className="text-xs text-theme-secondary truncate max-w-[120px]">{musicName || "Profile Music"}</span>
      <button onClick={toggle} className="text-purple-400 hover:text-purple-300 transition flex-shrink-0">
        {playing ? <FaPause size={10} /> : <FaPlay size={10} />}
      </button>
      <audio ref={audioRef} src={musicUrl} onEnded={() => setPlaying(false)} />
    </div>
  );
}

// ── Close Friends Section ─────────────────────────────────────
function CloseFriendsSection() {
  const [friends, setFriends] = useState([]);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    getCloseFriends().then(r => setFriends(r.data || [])).catch(() => {});
  }, []);
  if (!friends.length) return null;
  return (
    <div className="mt-3">
      <button onClick={() => setShow(s => !s)}
        className="flex items-center gap-1.5 text-xs font-semibold text-green-400 hover:text-green-300 transition">
        <FaUserFriends size={12} /> Close Friends ({friends.length})
        {show ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
      </button>
      {show && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {friends.map(f => (
            <button key={f._id} onClick={() => navigate(`/profile/${f.username}`)}
              className="flex flex-col items-center gap-1">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500">
                <img src={f.avatar || `https://ui-avatars.com/api/?name=${f.username}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-900" alt="" />
              </div>
              <span className="text-[10px] text-theme-muted truncate max-w-[48px]">{f.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bio Links Section ─────────────────────────────────────────
function BioLinksSection({ bioLinks }) {
  if (!bioLinks?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {bioLinks.map((link, i) => (
        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs bg-theme-card border border-theme rounded-full px-2.5 py-1 text-blue-400 hover:border-blue-400 transition">
          <FaLink size={9} /> {link.title || link.url}
        </a>
      ))}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followModal, setFollowModal] = useState(null); // null | "followers" | "following"
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (user?._id) {
      // Refresh user to get populated followers/following
      refreshUser();
      setLoadingPosts(true);
      getUserPosts(user._id)
        .then((res) => setUserPosts(res.data))
        .catch(console.error)
        .finally(() => setLoadingPosts(false));
    }
  }, [user?._id]);

  // Real-time: new post by me → prepend to gallery instantly
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    const onNew = (post) => {
      if ((post.user?._id || post.user) === user._id) {
        setUserPosts((prev) =>
          prev.some((p) => p._id === post._id) ? prev : [post, ...prev]
        );
      }
    };
    socket.on("newPost", onNew);
    return () => socket.off("newPost", onNew);
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-xl font-semibold">Please login first</h1>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    await refreshUser();
    setIsEditModalOpen(false);
  };

  return (
    <div className="bg-theme-primary min-h-screen pb-[68px] md:pb-0">
      {/* Header section — max width centered like Instagram */}
      <div className="max-w-[935px] mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-theme-primary">{user.username}</h2>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 text-theme-secondary hover:bg-theme-hover rounded-full transition-colors"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>

        <ProfileHeader
          user={user}
          postCount={userPosts.length}
          onEditClick={() => setIsEditModalOpen(true)}
          onFollowersClick={() => setFollowModal("followers")}
          onFollowingClick={() => setFollowModal("following")}
        />

        {/* Music Player */}
        <MusicPlayer musicUrl={user.profileMusic} musicName={user.profileMusicName} />

        {/* Bio Links */}
        <BioLinksSection bioLinks={user.bioLinks} />

        {/* Close Friends */}
        <CloseFriendsSection />
      </div>

      {/* Divider */}
      <div className="border-t border-theme" />

      {/* Gallery — full width, no side gaps */}
      <GalleryProfile posts={userPosts} loading={loadingPosts} />
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        user={user}
      />

      {followModal && (
        <FollowListModal
          title={followModal === "followers" ? "Followers" : "Following"}
          users={followModal === "followers" ? (user.followers || []) : (user.following || [])}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  );
}

