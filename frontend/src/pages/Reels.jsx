import { useRef, useState, useEffect } from "react";
import {
  HiHeart, HiOutlineHeart,
  HiOutlineChat,
  HiOutlinePaperAirplane,
  HiOutlineDotsVertical,
  HiOutlineVolumeUp,
  HiOutlineVolumeOff,
  HiX,
} from "react-icons/hi";
import { useContent } from "../Context/ContentContext";
import { useAuth } from "../Context/AuthContext";
import { likeReel, commentReel } from "../services/api";

const EMOJIS = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

function FloatingEmoji({ emoji, id, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <span
      key={id}
      className="pointer-events-none absolute right-16 bottom-32 text-3xl animate-bounce"
      style={{ animation: "floatUp 1.2s ease-out forwards" }}
    >
      {emoji}
    </span>
  );
}

function ReelItem({ reel }) {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [muted,         setMuted]         = useState(true);
  const [likes,         setLikes]         = useState(reel.likes || []);
  const [comments,      setComments]      = useState(reel.comments || []);
  const [showComments,  setShowComments]  = useState(false);
  const [commentText,   setCommentText]   = useState("");
  const [shared,        setShared]        = useState(false);
  const [showEmojis,    setShowEmojis]    = useState(false);
  const [floating,      setFloating]      = useState([]); // [{id, emoji}]

  const isLiked = user && likes.some((id) => (id?._id || id) === user._id);

  const handleLike = async () => {
    setLikes((prev) =>
      isLiked ? prev.filter((id) => (id?._id || id) !== user._id) : [...prev, user._id]
    );
    try { const res = await likeReel(reel._id); setLikes(res.data.likes); }
    catch (err) { console.error(err); }
  };

  const handleEmojiReact = (emoji) => {
    const id = Date.now() + Math.random();
    setFloating((prev) => [...prev, { id, emoji }]);
    setShowEmojis(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await commentReel(reel._id, commentText);
      setComments((prev) => [...prev, res.data]);
    } catch (err) { console.error(err); }
    setCommentText("");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/reels`);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="h-screen w-full relative snap-start flex justify-center items-center bg-black overflow-hidden">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover"
        autoPlay loop muted={muted} playsInline
      />

      {/* Floating emoji reactions */}
      {floating.map(({ id, emoji }) => (
        <FloatingEmoji key={id} id={id} emoji={emoji} onDone={() => setFloating((p) => p.filter((f) => f.id !== id))} />
      ))}

      {/* Right action buttons */}
      <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6 text-white z-10">
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 active:scale-125 transition-transform">
          {isLiked ? <HiHeart size={30} className="text-red-500" /> : <HiOutlineHeart size={30} />}
          <span className="text-xs">{likes.length}</span>
        </button>

        {/* Comment */}
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
          <HiOutlineChat size={30} />
          <span className="text-xs">{comments.length}</span>
        </button>

        {/* Emoji react */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setShowEmojis((s) => !s)}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">😊</span>
            <span className="text-xs">React</span>
          </button>
          {showEmojis && (
            <div className="absolute bottom-12 right-0 bg-black/80 backdrop-blur-sm rounded-2xl px-3 py-2 flex gap-2 z-20">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => handleEmojiReact(em)}
                  className="text-2xl hover:scale-125 transition-transform active:scale-150"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          {shared
            ? <HiOutlinePaperAirplane size={30} className="text-green-400" />
            : <HiOutlinePaperAirplane size={30} />
          }
          <span className="text-xs">{shared ? "Copied!" : "Share"}</span>
        </button>

        <button><HiOutlineDotsVertical size={28} /></button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-4 text-white max-w-[70%] z-10">
        <p className="font-semibold text-sm drop-shadow">@{reel.user?.username}</p>
        <p className="text-sm opacity-90 drop-shadow">{reel.caption}</p>
      </div>

      {/* Mute toggle */}
      <button className="absolute top-6 right-4 text-white z-10" onClick={() => setMuted((m) => !m)}>
        {muted ? <HiOutlineVolumeOff size={24} /> : <HiOutlineVolumeUp size={24} />}
      </button>

      {/* Comments drawer */}
      {showComments && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-20" onClick={() => setShowComments(false)}>
          <div className="w-full bg-theme-card rounded-t-2xl p-4 max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-theme-primary">Comments</h3>
              <button onClick={() => setShowComments(false)}><HiX size={20} className="text-theme-secondary" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 scrollbar-hide">
              {comments.length === 0 && (
                <p className="text-sm text-theme-muted text-center py-4">No comments yet.</p>
              )}
              {comments.map((c, i) => (
                <div key={c._id || i} className="flex items-start gap-2">
                  <img
                    src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.username}`}
                    className="w-7 h-7 rounded-full object-cover"
                    alt={c.user?.username}
                  />
                  <p className="text-sm text-theme-primary">
                    <span className="font-semibold">{c.user?.username}</span>{" "}
                    <span className="text-theme-secondary">{c.text}</span>
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex items-center gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-theme-input text-theme-primary text-sm rounded-full px-4 py-2 outline-none placeholder:text-theme-muted border border-theme"
              />
              <button type="submit" disabled={!commentText.trim()} className="text-blue-500 font-semibold text-sm disabled:opacity-40">
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Reels() {
  const { reels, fetchReels } = useContent();

  useEffect(() => { fetchReels(); }, []);

  if (reels.length === 0) {
    return (
      <div className="h-[calc(100dvh-64px)] md:h-screen flex items-center justify-center bg-black text-white">
        <p className="text-gray-400 text-sm">No reels yet. Be the first to upload one!</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-120px) scale(1.5); }
        }
      `}</style>
      <div className="h-[calc(100dvh-64px)] md:h-screen overflow-y-scroll snap-y snap-mandatory">
        {reels.map((reel) => (
          <ReelItem key={reel._id} reel={reel} />
        ))}
      </div>
    </>
  );
}
