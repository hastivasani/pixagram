import { useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHeart, HiOutlineHeart,
  HiOutlineChat,
  HiOutlinePaperAirplane,
  HiOutlineBookmark, HiBookmark,
  HiDotsHorizontal, HiTrash, HiRefresh,
  HiEye, HiEyeOff,
} from "react-icons/hi";
import { likePost, commentPost, deletePost, repostPost, savePost } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { useContent } from "../Context/ContentContext";
import PollCard from "./PollCard";

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return "Just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const getAvatar = (u) =>
  u?.avatar || `https://ui-avatars.com/api/?name=${u?.username || "U"}&background=random`;

function CaptionWithHashtags({ username, caption, onHashtagClick }) {
  if (!caption) return null;
  const parts = caption.split(/(#\w+)/g);
  return (
    <p className="text-[13px] text-theme-primary mb-1">
      <span className="font-semibold mr-1">{username}</span>
      {parts.map((part, i) =>
        part.startsWith("#") ? (
          <button key={i} onClick={() => onHashtagClick(part.slice(1))}
            className="text-blue-400 hover:underline">{part}</button>
        ) : part
      )}
    </p>
  );
}

const PostCard = memo(function PostCard({ post }) {
  const navigate = useNavigate();
  const { user }     = useAuth();
  const { setPosts } = useContent();

  const [likes,        setLikes]        = useState(post.likes || []);
  const [reposts,      setReposts]      = useState(post.reposts || []);
  const [comments,     setComments]     = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState("");
  const [showMenu,     setShowMenu]     = useState(false);
  const [saved,        setSaved]        = useState(post.saves?.map(String).includes(String(user?._id)) || false);
  const [shared,       setShared]       = useState(false);
  const [carouselIdx,  setCarouselIdx]  = useState(0);
  const [showContent,  setShowContent]  = useState(!post.hasContentWarning);
  const [pollData,     setPollData]     = useState(post);

  const isLiked    = useMemo(() => user && likes.some((id) => (id?._id || id) === user._id), [likes, user]);
  const isReposted = useMemo(() => user && reposts.some((id) => (id?._id || id) === user._id), [reposts, user]);
  const isOwner    = useMemo(() => user && post.user?._id === user._id, [user, post.user?._id]);
  const postAvatar = useMemo(() => getAvatar(post.user), [post.user?.avatar, post.user?.username]);
  const userAvatar = useMemo(() => getAvatar(user),      [user?.avatar, user?.username]);
  const isCarousel = post.mediaType === "carousel" && post.carouselMedia?.length > 1;

  const handleLike = useCallback(async () => {
    // Use functional updater to avoid stale isLiked closure
    setLikes(prev => {
      const alreadyLiked = prev.some(id => (id?._id || id) === user._id);
      return alreadyLiked
        ? prev.filter(id => (id?._id || id) !== user._id)
        : [...prev, user._id];
    });
    try { const r = await likePost(post._id); setLikes(r.data.likes); }
    catch (e) {
      // Revert on error
      setLikes(prev => {
        const alreadyLiked = prev.some(id => (id?._id || id) === user._id);
        return alreadyLiked
          ? prev.filter(id => (id?._id || id) !== user._id)
          : [...prev, user._id];
      });
    }
  }, [user?._id, post._id]);

  const handleRepost = useCallback(async () => {
    try {
      const r = await repostPost(post._id);
      setReposts(r.data.reposts);
      if (r.data.repost) setPosts(p => [r.data.repost, ...p]);
    } catch (e) { console.error(e); }
  }, [post._id, setPosts]);

  const handleComment = useCallback(async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const r = await commentPost(post._id, commentText);
      setComments((p) => [...p, r.data]);
      setCommentText("");
    } catch (e) { console.error(e); }
  }, [commentText, post._id]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${post.user?.username}`);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [post.user?.username]);

  const handleSave = useCallback(async () => {
    setSaved(s => !s);
    try { await savePost(post._id); } catch (_) { setSaved(s => !s); }
  }, [post._id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(post._id);
      setPosts((p) => p.filter((x) => x._id !== post._id));
    } catch (e) { console.error(e); }
  }, [post._id, setPosts]);

  const toggleComments = useCallback(() => setShowComments((s) => !s), []);
  const toggleMenu     = useCallback(() => setShowMenu((s) => !s),     []);

  return (
    <article className="w-full bg-theme-card border border-theme rounded-2xl overflow-hidden shadow-theme">

      {post.isRepost && (
        <div className="flex items-center gap-1.5 px-3 pt-2 text-xs text-theme-muted">
          <HiRefresh size={12} className="text-green-400" />
          <span>{post.user?.username} reposted</span>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2.5">
        <button
          onClick={() => navigate(`/profile/${(post.isRepost ? post.originalPost?.user : post.user)?.username || post.user?.username}`)}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex-shrink-0">
            <img
              src={post.isRepost ? getAvatar(post.originalPost?.user || post.user) : postAvatar}
              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-900"
              alt={post.user?.username}
              loading="lazy"
            />
          </div>
          <div className="text-left min-w-0">
            <p className="text-[13px] font-semibold text-theme-primary truncate leading-tight">
              {post.isRepost ? (post.originalPost?.user?.username || post.user?.username) : post.user?.username}
            </p>
            <p className="text-[11px] text-theme-muted">{timeAgo(post.createdAt)}</p>
          </div>
        </button>

        {isOwner && (
          <div className="relative flex-shrink-0">
            <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-theme-hover transition text-theme-muted">
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

      {post.mediaType === "text" ? (
        <div className="w-full min-h-[200px] bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-6">
          <p className="text-white text-lg font-semibold text-center">{post.caption}</p>
        </div>
      ) : post.mediaType === "poll" ? (
        <PollCard post={pollData} onUpdate={setPollData}/>
      ) : !showContent ? (
        <div className="w-full h-48 bg-theme-input flex flex-col items-center justify-center gap-3 cursor-pointer" onClick={() => setShowContent(true)}>
          <HiEyeOff size={32} className="text-theme-muted"/>
          <p className="text-sm font-semibold text-theme-primary">Sensitive Content</p>
          <p className="text-xs text-theme-muted">{post.contentWarningText || "This post may contain sensitive content"}</p>
          <button className="bg-theme-card border border-theme px-4 py-1.5 rounded-xl text-xs font-semibold text-theme-primary hover:bg-theme-hover transition">
            Show anyway
          </button>
        </div>
      ) : isCarousel ? (
        <div className="relative w-full bg-black">
          {post.carouselMedia[carouselIdx]?.type === "video" ? (
            <video src={post.carouselMedia[carouselIdx].url} controls preload="metadata" className="w-full max-h-[600px] object-contain" />
          ) : (
            <img src={post.carouselMedia[carouselIdx].url} alt="" className="w-full max-h-[600px] object-cover" loading="lazy" />
          )}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {post.carouselMedia.map((_, i) => (
              <button key={i} onClick={() => setCarouselIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition ${i === carouselIdx ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
          {carouselIdx > 0 && (
            <button onClick={() => setCarouselIdx(p => p - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-sm">‹</button>
          )}
          {carouselIdx < post.carouselMedia.length - 1 && (
            <button onClick={() => setCarouselIdx(p => p + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-sm">›</button>
          )}
        </div>
      ) : (
        <div className="w-full bg-black">
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} controls preload="metadata" className="w-full max-h-[600px] object-contain" />
          ) : (
            <img src={post.mediaUrl} alt={post.caption || "post"} className="w-full max-h-[600px] object-cover" loading="lazy" />
          )}
        </div>
      )}

      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-3.5">
            <button onClick={handleLike} className="transition-transform active:scale-125 hover:opacity-70" aria-label={isLiked ? "Unlike" : "Like"}>
              {isLiked ? <HiHeart className="w-7 h-7 text-red-500" /> : <HiOutlineHeart className="w-7 h-7 text-theme-primary" />}
            </button>
            <button onClick={toggleComments} className="hover:opacity-70 transition" aria-label="Comment">
              <HiOutlineChat className="w-7 h-7 text-theme-primary" />
            </button>
            <button onClick={handleRepost} className="hover:opacity-70 transition" aria-label="Repost">
              <HiRefresh className={`w-6 h-6 ${isReposted ? "text-green-500" : "text-theme-primary"}`} />
            </button>
            <button onClick={handleShare} className="hover:opacity-70 transition" aria-label="Share">
              <HiOutlinePaperAirplane className={`w-6 h-6 ${shared ? "text-green-500" : "text-theme-primary"}`} />
            </button>
          </div>
          <button onClick={handleSave} className="hover:opacity-70 transition" aria-label="Save">
            {saved ? <HiBookmark className="w-6 h-6 text-yellow-400" /> : <HiOutlineBookmark className="w-6 h-6 text-theme-primary" />}
          </button>
        </div>

        {likes.length > 0 && (
          <p className="text-[13px] font-semibold text-theme-primary mb-1">
            {likes.length.toLocaleString()} {likes.length === 1 ? "like" : "likes"}
            {reposts.length > 0 && <span className="text-theme-muted font-normal ml-2">· {reposts.length} reposts</span>}
          </p>
        )}

        {post.mediaType !== "text" && (
          <CaptionWithHashtags
            username={post.user?.username}
            caption={post.caption}
            onHashtagClick={(tag) => navigate(`/trending/${tag}`)}
          />
        )}

        {comments.length > 0 && !showComments && (
          <button onClick={() => setShowComments(true)} className="text-[12px] text-theme-muted hover:text-theme-secondary transition mb-1">
            View all {comments.length} comment{comments.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {showComments && (
        <div className="px-3 pb-2 space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
          {comments.map((c, i) => (
            <div key={c._id || i} className="flex items-start gap-2">
              <img src={getAvatar(c.user)} className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" alt={c.user?.username} loading="lazy" />
              <p className="text-[13px] text-theme-primary leading-snug">
                <span className="font-semibold mr-1">{c.user?.username}</span>
                <span className="text-theme-secondary">{c.text}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleComment} className="flex items-center gap-2 px-3 py-2.5 border-t border-theme">
        <img src={userAvatar} className="w-6 h-6 rounded-full object-cover flex-shrink-0" alt={user?.username} loading="lazy" />
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-[13px] text-theme-primary outline-none placeholder:text-theme-muted"
        />
        {commentText.trim() && (
          <button type="submit" className="text-blue-500 text-[13px] font-semibold flex-shrink-0">Post</button>
        )}
      </form>
    </article>
  );
});

export default PostCard;
