import { useState } from "react";
import { HiHeart, HiOutlineHeart } from "react-icons/hi";
import { replyComment, likeComment } from "../../services/api";
import { timeAgo, getAvatar } from "../../utils/timeAgo";

export default function CommentItem({ comment, currentUser, onReplyAdded, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying]   = useState(false);
  const [liked, setLiked]         = useState(
    comment.likes?.some(id => String(id?._id || id) === String(currentUser?._id))
  );
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await replyComment(comment._id, replyText.trim());
      onReplyAdded?.(res.data);
      setReplyText("");
      setShowReply(false);
    } catch (_) {}
    finally { setReplying(false); }
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(l => !l);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      await likeComment(comment._id);
    } catch (_) {
      // revert on error
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
    }
  };

  return (
    <div className={`flex gap-2 ${depth > 0 ? "ml-8 mt-2" : ""}`}>
      <img src={getAvatar(comment.user)} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" alt="" />
      <div className="flex-1 min-w-0">
        <div className="bg-theme-secondary rounded-2xl px-3 py-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-xs text-theme-primary">{comment.user?.username}</span>
            {comment.user?.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
            <span className="text-theme-muted text-[10px]">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-theme-primary break-words">{comment.text}</p>
        </div>

        <div className="flex items-center gap-4 mt-1 px-1">
          <button onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition ${liked ? "text-red-400" : "text-theme-muted hover:text-red-400"}`}>
            {liked ? <HiHeart size={12} /> : <HiOutlineHeart size={12} />}
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          {depth === 0 && (
            <button onClick={() => setShowReply(s => !s)}
              className="text-xs text-theme-muted hover:text-blue-400 transition">
              Reply
            </button>
          )}
        </div>

        {showReply && (
          <div className="flex gap-2 mt-2">
            <img src={getAvatar(currentUser)} className="w-6 h-6 rounded-full object-cover flex-shrink-0" alt="" />
            <div className="flex-1 flex gap-1.5">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReply()}
                placeholder={`Reply to @${comment.user?.username}...`}
                className="flex-1 bg-theme-secondary text-theme-primary text-xs rounded-full px-3 py-1.5 outline-none border border-theme focus:border-blue-400 transition"
              />
              <button onClick={handleReply} disabled={replying || !replyText.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold px-2.5 py-1 rounded-full transition">
                {replying ? "..." : "↩"}
              </button>
            </div>
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => (
              <CommentItem key={reply._id} comment={reply} currentUser={currentUser}
                onReplyAdded={() => {}} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
