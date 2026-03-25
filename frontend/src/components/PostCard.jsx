import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHeart, HiOutlineHeart,
  HiOutlineChat,
  HiOutlinePaperAirplane,
  HiOutlineBookmark, HiBookmark,
  HiDotsHorizontal, HiTrash,
} from "react-icons/hi";
import { likePost, commentPost, deletePost } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { useContent } from "../Context/ContentContext";

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)  return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const avatar = (u) =>
  u?.avatar || `https://ui-avatars.com/api/?name=${u?.username || "U"}&background=random`;

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user }    = useAuth();
  const { setPosts } = useContent();

  const [likes,        setLikes]        = useState(post.likes || []);
  const [comments,     setComments]     = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState("");
  const [showMenu,     setShowMenu]     = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [shared,       setShared]       = useState(false);

  const isLiked = user && likes.some((id) => (id?._id || id) === user._id);
  const isOwner = user && post.user?._id === user._id;

  const handleLike = async () => {
    setLikes((p) => isLiked ? p.filter((id) => (id?._id || id) !== user._id) : [...p, user._id]);
    try { const r = await likePost(post._id); setLikes(r.data.likes); }
    catch (e) { console.error(e); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const r = await commentPost(post._id, commentText);
      setComments((p) => [...p, r.data]);
      setCommentText("");
    } catch (e) { console.error(e); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${post.user?.username}`);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(post._id);
      setPosts((p) => p.filter((x) => x._id !== post._id));
    } catch (e) { console.error(e); }
  };

  return (
    <article className="w-full bg-theme-card border border-theme rounded-2xl overflow-hidden shadow-theme">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <button
          onClick={() => navigate(`/profile/${post.user?.username}`)}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex-shrink-0">
            <img
              src={avatar(post.user)}
              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-900"
              alt={post.user?.username}
            />
          </div>
          <div className="text-left min-w-0">
            <p className="text-[13px] font-semibold text-theme-primary truncate leading-tight">
              {post.user?.username}
            </p>
            <p className="text-[11px] text-theme-muted">{timeAgo(post.createdAt)}</p>
          </div>
        </button>

        {/* 3-dot menu — owner only */}
        {isOwner && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu((s) => !s)}
              className="p-2 rounded-full hover:bg-theme-hover transition text-theme-muted"
            >
              <HiDotsHorizontal size={20} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-theme-card border border-theme rounded-xl shadow-xl z-20 overflow-hidden min-w-[140px]">
                  <button
                    onClick={() => { setShowMenu(false); handleDelete(); }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-theme-hover transition"
                  >
                    <HiTrash size={15} /> Delete post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Media ── */}
      <div className="w-full bg-black">
        {post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full max-h-[600px] object-contain"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption || "post"}
            className="w-full max-h-[600px] object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* ── Actions ── */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-3.5">
            {/* Like */}
            <button
              onClick={handleLike}
              className="transition-transform active:scale-125 hover:opacity-70"
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              {isLiked
                ? <HiHeart className="w-7 h-7 text-red-500" />
                : <HiOutlineHeart className="w-7 h-7 text-theme-primary" />
              }
            </button>

            {/* Comment */}
            <button
              onClick={() => setShowComments((s) => !s)}
              className="hover:opacity-70 transition"
              aria-label="Comment"
            >
              <HiOutlineChat className="w-7 h-7 text-theme-primary" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="hover:opacity-70 transition"
              aria-label="Share"
            >
              <HiOutlinePaperAirplane
                className={`w-6 h-6 ${shared ? "text-green-500" : "text-theme-primary"}`}
              />
            </button>
          </div>

          {/* Save */}
          <button
            onClick={() => setSaved((s) => !s)}
            className="hover:opacity-70 transition"
            aria-label="Save"
          >
            {saved
              ? <HiBookmark className="w-6 h-6 text-theme-primary" />
              : <HiOutlineBookmark className="w-6 h-6 text-theme-primary" />
            }
          </button>
        </div>

        {/* Like count */}
        {likes.length > 0 && (
          <p className="text-[13px] font-semibold text-theme-primary mb-1">
            {likes.length.toLocaleString()} {likes.length === 1 ? "like" : "likes"}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-[13px] text-theme-primary mb-1">
            <button
              onClick={() => navigate(`/profile/${post.user?.username}`)}
              className="font-semibold mr-1 hover:underline"
            >
              {post.user?.username}
            </button>
            {post.caption}
          </p>
        )}

        {/* View comments toggle */}
        {comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-[12px] text-theme-muted hover:text-theme-secondary transition mb-1"
          >
            View all {comments.length} comment{comments.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <div className="px-3 pb-2 space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
          {comments.map((c, i) => (
            <div key={c._id || i} className="flex items-start gap-2">
              <img
                src={avatar(c.user)}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                alt={c.user?.username}
              />
              <p className="text-[13px] text-theme-primary leading-snug">
                <span className="font-semibold mr-1">{c.user?.username}</span>
                <span className="text-theme-secondary">{c.text}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Add comment ── */}
      <form
        onSubmit={handleComment}
        className="flex items-center gap-2 px-3 py-2.5 border-t border-theme"
      >
        <img
          src={avatar(user)}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          alt={user?.username}
        />
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-[13px] text-theme-primary outline-none placeholder:text-theme-muted"
        />
        {commentText.trim() && (
          <button
            type="submit"
            className="text-blue-500 text-[13px] font-semibold flex-shrink-0"
          >
            Post
          </button>
        )}
      </form>
    </article>
  );
}
