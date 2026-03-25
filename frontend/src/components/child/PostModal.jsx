import { useState, useEffect, useRef } from "react";
import {
  HiHeart, HiOutlineHeart,
  HiOutlineBookmark, HiBookmark,
  HiOutlineChat, HiOutlinePaperAirplane,
  HiDotsHorizontal, HiX, HiEmojiHappy,
} from "react-icons/hi";
import { likePost, commentPost, deletePost } from "../../services/api";
import { useAuth } from "../../Context/AuthContext";
import { useContent } from "../../Context/ContentContext";

const av = (u) => u?.avatar || `https://ui-avatars.com/api/?name=${u?.username || "U"}`;

const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ── Three-dot menu ─────────────────────────────────────── */
function ThreeDotMenu({ onClose, isOwner, onDelete }) {
  const options = [
    isOwner && { label: "Delete",               action: onDelete, red: true },
    { label: "Copy link",  action: () => { navigator.clipboard.writeText(window.location.href); onClose(); } },
    { label: "Share to...", action: onClose },
    { label: "Cancel",     action: onClose, bold: true },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[60]" onClick={onClose}>
      <div className="w-full sm:w-72 bg-theme-card rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {options.map((opt, i) => (
          <button key={i} onClick={opt.action}
            className={`w-full py-4 text-sm border-b border-theme last:border-0 transition hover:bg-theme-hover
              ${opt.red ? "text-red-500 font-semibold" : "text-theme-primary"}
              ${opt.bold ? "font-semibold" : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main PostModal ──────────────────────────────────────── */
export default function PostModal({ selectedPost, onClose }) {
  const { user }     = useAuth();
  const { setPosts } = useContent();

  const [likes,       setLikes]       = useState(selectedPost?.likes    || []);
  const [comments,    setComments]    = useState(selectedPost?.comments || []);
  const [commentText, setCommentText] = useState("");
  const [saved,       setSaved]       = useState(false);
  const [posting,     setPosting]     = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedPost) {
      setLikes(selectedPost.likes    || []);
      setComments(selectedPost.comments || []);
      setSaved(false);
    }
  }, [selectedPost?._id]);

  if (!selectedPost) return null;

  const isLiked = user && likes.some((id) => (id?._id || id) === user._id);
  const isOwner = user && (selectedPost.user?._id === user._id || selectedPost.user === user._id);

  const handleLike = async () => {
    setLikes((p) => isLiked ? p.filter((id) => (id?._id || id) !== user._id) : [...p, user._id]);
    try { const r = await likePost(selectedPost._id); setLikes(r.data.likes); }
    catch (e) { console.error(e); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || posting) return;
    setPosting(true);
    try {
      const r = await commentPost(selectedPost._id, commentText);
      setComments((p) => [...p, r.data]);
      setCommentText("");
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try { await deletePost(selectedPost._id); setPosts((p) => p.filter((x) => x._id !== selectedPost._id)); onClose(); }
    catch (e) { console.error(e); }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>

        {/* ── Modal box ──
            Mobile  : full-width sheet from bottom, vertical stack
            sm+     : centered card, side-by-side layout           */}
        <div
          className="
            bg-theme-card w-full overflow-hidden shadow-2xl
            flex flex-col
            rounded-t-2xl sm:rounded-2xl
            max-h-[92dvh] sm:max-h-[88vh]
            sm:flex-row sm:w-[90vw] sm:max-w-4xl sm:h-[80vh]
          "
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Media ── */}
          <div className="
            bg-black flex-shrink-0 flex items-center justify-center
            w-full h-[45vw] max-h-[280px]
            sm:w-[55%] sm:h-full sm:max-h-none
          ">
            {selectedPost.mediaType === "video" ? (
              <video src={selectedPost.mediaUrl} controls className="w-full h-full object-contain" />
            ) : (
              <img src={selectedPost.mediaUrl} alt="post" className="w-full h-full object-contain" />
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-col flex-1 min-w-0 min-h-0 border-t sm:border-t-0 sm:border-l border-theme">

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-theme flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={av(selectedPost.user)} className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-pink-400" alt="" />
                <p className="text-[13px] font-semibold text-theme-primary truncate">{selectedPost.user?.username}</p>
              </div>
              <button onClick={() => setShowMenu(true)} className="p-1.5 text-theme-muted hover:text-theme-primary flex-shrink-0">
                <HiDotsHorizontal size={18} />
              </button>
            </div>

            {/* Comments scroll area */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-hide min-h-0">
              {/* Caption */}
              {selectedPost.caption && (
                <div className="flex items-start gap-2">
                  <img src={av(selectedPost.user)} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                  <div>
                    <p className="text-[13px] text-theme-primary">
                      <span className="font-semibold mr-1">{selectedPost.user?.username}</span>
                      {selectedPost.caption}
                    </p>
                    <p className="text-[11px] text-theme-muted mt-0.5">{timeAgo(selectedPost.createdAt)}</p>
                  </div>
                </div>
              )}

              {comments.length === 0 && !selectedPost.caption && (
                <p className="text-[12px] text-theme-muted text-center py-6">No comments yet.</p>
              )}

              {comments.map((c, i) => (
                <div key={c._id || i} className="flex items-start gap-2">
                  <img src={av(c.user)} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-theme-primary">
                      <span className="font-semibold mr-1">{c.user?.username}</span>
                      <span className="text-theme-secondary break-words">{c.text}</span>
                    </p>
                    <p className="text-[11px] text-theme-muted mt-0.5">{timeAgo(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions + input */}
            <div className="border-t border-theme px-3 pt-2.5 pb-3 flex-shrink-0">
              {/* Action row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3.5">
                  <button onClick={handleLike} className="active:scale-125 transition-transform">
                    {isLiked
                      ? <HiHeart className="w-6 h-6 text-red-500" />
                      : <HiOutlineHeart className="w-6 h-6 text-theme-primary" />}
                  </button>
                  <button onClick={() => inputRef.current?.focus()}>
                    <HiOutlineChat className="w-6 h-6 text-theme-primary" />
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/profile/${selectedPost.user?.username}`)}>
                    <HiOutlinePaperAirplane className="w-5 h-5 text-theme-primary" />
                  </button>
                </div>
                <button onClick={() => setSaved((s) => !s)} className="active:scale-110 transition-transform">
                  {saved
                    ? <HiBookmark className="w-6 h-6 text-theme-primary" />
                    : <HiOutlineBookmark className="w-6 h-6 text-theme-primary" />}
                </button>
              </div>

              {/* Like count */}
              {likes.length > 0 && (
                <p className="text-[13px] font-semibold text-theme-primary mb-1">
                  {likes.length.toLocaleString()} {likes.length === 1 ? "like" : "likes"}
                </p>
              )}
              <p className="text-[11px] text-theme-muted mb-2">{timeAgo(selectedPost.createdAt)}</p>

              {/* Comment input */}
              <form onSubmit={handleComment} className="flex items-center gap-2 border-t border-theme pt-2.5">
                <HiEmojiHappy size={20} className="text-theme-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-[13px] text-theme-primary outline-none placeholder:text-theme-muted min-w-0"
                />
                {commentText.trim() && (
                  <button type="submit" disabled={posting}
                    className="text-blue-500 text-[13px] font-semibold flex-shrink-0 disabled:opacity-40">
                    {posting ? "..." : "Post"}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition z-10"
        >
          <HiX size={20} />
        </button>
      </div>

      {showMenu && (
        <ThreeDotMenu onClose={() => setShowMenu(false)} isOwner={isOwner} onDelete={handleDelete} />
      )}
    </>
  );
}
