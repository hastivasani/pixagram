import { useState, useEffect } from "react";
import { FaComment, FaRetweet, FaEllipsisH, FaClock } from "react-icons/fa";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import { getComments, commentPost } from "../../services/api";
import { getSocket } from "../../utils/socket";
import { timeAgo, getAvatar } from "../../utils/timeAgo";
import CommentItem from "./CommentItem";

// Shows remaining time before tweet expires
function ExpiryBadge({ expiresAt }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt) - Date.now();
      if (diff <= 0) { setRemaining("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [expiresAt]);

  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full mb-1">
      <FaClock size={8} /> {remaining}
    </span>
  );
}

export default function TweetCard({ post, currentUser, onLike, onRepost, onNavigate }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]         = useState([]);
  const [loadingCmts, setLoadingCmts]   = useState(false);
  const [replyText, setReplyText]       = useState("");
  const [replying, setReplying]         = useState(false);

  const isLiked    = post.likes?.some(id => String(id?._id || id) === String(currentUser?._id));
  const isReposted = post.reposts?.some(id => String(id?._id || id) === String(currentUser?._id));
  const likeCount    = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;
  const repostCount  = post.reposts?.length || 0;

  // Real-time new comments
  useEffect(() => {
    if (!currentUser?._id) return;
    const socket = getSocket(currentUser._id);
    const handler = ({ postId, comment }) => {
      if (String(postId) !== String(post._id)) return;
      setComments(prev =>
        prev.some(c => String(c._id) === String(comment._id)) ? prev : [comment, ...prev]
      );
    };
    socket.on("newComment", handler);
    return () => socket.off("newComment", handler);
  }, [post._id, currentUser?._id]);

  const loadComments = async () => {
    if (loadingCmts) return;
    setLoadingCmts(true);
    try {
      const res = await getComments(post._id);
      setComments(res.data || []);
    } catch (_) {}
    finally { setLoadingCmts(false); }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(s => !s);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    const tempId = `temp_${Date.now()}`;
    const optimistic = { _id: tempId, text: replyText.trim(), user: currentUser, replies: [], likes: [], createdAt: new Date() };
    setComments(prev => [optimistic, ...prev]);
    const text = replyText.trim();
    setReplyText("");
    try {
      await commentPost(post._id, text);
      setComments(prev => prev.filter(c => c._id !== tempId));
    } catch (_) {
      setComments(prev => prev.filter(c => c._id !== tempId));
    } finally { setReplying(false); }
  };

  return (
    <article className="border-b border-theme px-4 py-3 hover:bg-theme-hover/20 transition-colors">
      <div className="flex gap-3">
        <img src={getAvatar(post.user)} className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 flex-shrink-0"
          onClick={() => onNavigate?.(post.user?.username)} alt="" />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-theme-primary text-sm hover:underline cursor-pointer"
              onClick={() => onNavigate?.(post.user?.username)}>
              {post.user?.name || post.user?.username}
            </span>
            {post.user?.isVerified && <span className="text-blue-400 text-xs">✓</span>}
            <span className="text-theme-muted text-sm">@{post.user?.username}</span>
            <span className="text-theme-muted text-sm">·</span>
            <span className="text-theme-muted text-sm">{timeAgo(post.createdAt)}</span>
            <button className="ml-auto text-theme-muted hover:text-theme-primary p-1 rounded-full hover:bg-theme-hover transition">
              <FaEllipsisH size={13} />
            </button>
          </div>

          {post.isRepost && (
            <p className="text-xs text-theme-muted mb-1 flex items-center gap-1">
              <FaRetweet size={10} /> Reposted from @{post.originalPost?.user?.username}
            </p>
          )}

          {/* Twitter 24h expiry indicator */}
          {post.twitterExpiresAt && (
            <ExpiryBadge expiresAt={post.twitterExpiresAt} />
          )}

          {post.caption && (
            <p className="text-theme-primary text-sm mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
              {post.caption.split(/(#\w+)/g).map((part, i) =>
                part.startsWith("#")
                  ? <span key={i} className="text-blue-400 hover:underline cursor-pointer">{part}</span>
                  : part
              )}
            </p>
          )}

          {post.mediaUrl && post.mediaType !== "text" && (
            <div className="mt-2 rounded-2xl overflow-hidden border border-theme max-h-80">
              {post.mediaType === "video"
                ? <video src={post.mediaUrl} controls className="w-full max-h-80 object-cover" />
                : <img src={post.mediaUrl} alt="" className="w-full max-h-80 object-cover" />
              }
            </div>
          )}

          {post.mediaType === "carousel" && post.carouselMedia?.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-theme">
              {post.carouselMedia.slice(0, 4).map((m, i) => (
                <div key={i} className={`${post.carouselMedia.length === 1 ? "col-span-2" : ""} aspect-square overflow-hidden`}>
                  {m.type === "video"
                    ? <video src={m.url} muted className="w-full h-full object-cover" />
                    : <img src={m.url} alt="" className="w-full h-full object-cover" />
                  }
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3">
            <button onClick={toggleComments}
              className={`flex items-center gap-1.5 transition group ${showComments ? "text-blue-400" : "text-theme-muted hover:text-blue-400"}`}>
              <div className="p-1.5 rounded-full group-hover:bg-blue-400/10 transition"><FaComment size={14} /></div>
              <span className="text-xs">{commentCount > 0 ? commentCount : ""}</span>
            </button>
            <button onClick={() => onRepost(post._id)}
              className={`flex items-center gap-1.5 transition group ${isReposted ? "text-green-400" : "text-theme-muted hover:text-green-400"}`}>
              <div className="p-1.5 rounded-full group-hover:bg-green-400/10 transition"><FaRetweet size={14} /></div>
              <span className="text-xs">{repostCount > 0 ? repostCount : ""}</span>
            </button>
            <button onClick={() => onLike(post._id)}
              className={`flex items-center gap-1.5 transition group ${isLiked ? "text-red-500" : "text-theme-muted hover:text-red-400"}`}>
              <div className="p-1.5 rounded-full group-hover:bg-red-400/10 transition">
                {isLiked ? <HiHeart size={16} /> : <HiOutlineHeart size={16} />}
              </div>
              <span className="text-xs">{likeCount > 0 ? likeCount : ""}</span>
            </button>
          </div>

          {/* Comments */}
          {showComments && (
            <div className="mt-3 border-t border-theme pt-3 space-y-3">
              <div className="flex gap-2">
                <img src={getAvatar(currentUser)} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                <div className="flex-1 flex gap-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReply()}
                    placeholder="Post your reply..."
                    className="flex-1 bg-theme-secondary text-theme-primary text-sm rounded-full px-3 py-1.5 outline-none border border-theme focus:border-blue-400 transition" />
                  <button onClick={handleReply} disabled={replying || !replyText.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold px-3 py-1.5 rounded-full transition">
                    {replying ? "..." : "Reply"}
                  </button>
                </div>
              </div>
              {loadingCmts ? (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-theme-muted text-center py-2">No replies yet. Be the first!</p>
              ) : comments.map(c => (
                <CommentItem key={c._id} comment={c} currentUser={currentUser} postId={post._id}
                  onReplyAdded={(reply) => setComments(prev => prev.map(cm =>
                    cm._id === c._id ? { ...cm, replies: [...(cm.replies || []), reply] } : cm
                  ))} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
