import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import GalleryProfile from "../components/GalleryProfile";
import ProfileHeader from "../components/ProfileHeader";
import EditProfileModal from "../components/EditProfileModal";
import FollowListModal from "../components/FollowListModal";
import { useAuth } from "../Context/AuthContext";
import { getUserPosts } from "../services/api";
import { getSocket } from "../utils/socket";

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
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

