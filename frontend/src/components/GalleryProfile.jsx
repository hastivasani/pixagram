import { useState } from "react";
import { HiHeart, HiChat } from "react-icons/hi";
import PostModal from "./child/PostModal";

export default function GalleryProfile({ posts = [], loading = false }) {
  const [selectedPost, setSelectedPost] = useState(null);

  if (loading) {
    return <div className="p-6 text-center text-theme-muted">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return <div className="p-6 text-center text-theme-muted">No posts yet.</div>;
  }

  return (
    <div className="bg-theme-primary">
      <div className="grid grid-cols-3 gap-0.5">
        {posts.map((post) => (
          <div
            key={post._id}
            onClick={() => setSelectedPost(post)}
            className="relative group cursor-pointer aspect-square overflow-hidden bg-theme-secondary"
          >
            {post.mediaType === "video" ? (
              <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
            ) : (
              <img
                src={post.mediaUrl}
                alt={post.caption || "post"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold">
              <div className="flex items-center gap-1.5">
                <HiHeart size={20} />
                <span className="text-sm">{post.likes?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HiChat size={20} />
                <span className="text-sm">{post.comments?.length || 0}</span>
              </div>
            </div>
            {/* Video indicator */}
            {post.mediaType === "video" && (
              <span className="absolute top-2 right-2 text-white text-xs bg-black/50 rounded px-1.5 py-0.5">▶</span>
            )}
          </div>
        ))}
      </div>

      <PostModal
        selectedPost={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}
