import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getFeed, likePost, repostPost, getExplorePosts } from "../services/api";
import { getSocket } from "../utils/socket";
import { FaTwitter, FaSearch, FaTimes } from "react-icons/fa";
import ComposeBox  from "../components/twitter/ComposeBox";
import TweetCard   from "../components/twitter/TweetCard";
import RightSidebar from "../components/twitter/RightSidebar";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

export default function Twitter() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(false);
  const [page, setPage]               = useState(1);
  const [tab, setTab]                 = useState("for_you");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchPosts = useCallback(async (pageNum = 1, replace = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      let newPosts = [], more = false;
      if (tab === "following") {
        const res  = await getFeed(pageNum, true);
        const data = res.data;
        newPosts = data.posts || data || [];
        more = data.hasMore ?? newPosts.length === 20;
      } else {
        const res = await getExplorePosts(true);
        newPosts  = Array.isArray(res.data) ? res.data : [];
        more = false;
      }
      setPosts(prev => replace ? newPosts : [...prev, ...newPosts]);
      setHasMore(more);
      setPage(pageNum);
    } catch (e) {
      console.error("[Twitter] fetchPosts error:", e);
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [tab]);

  useEffect(() => { fetchPosts(1, true); }, [tab]);

  // Real-time new posts
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    const onNew = (post) => {
      if (post?.source !== "twitter") return;
      setPosts(prev => prev.some(p => p._id === post._id) ? prev : [post, ...prev]);
    };
    socket.on("newPost", onNew);
    return () => socket.off("newPost", onNew);
  }, [user?._id]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) fetchPosts(page + 1);
  }, [loadingMore, hasMore, page, fetchPosts]);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  const handleLike = async (postId) => {
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const liked = p.likes?.some(id => String(id?._id || id) === String(user._id));
      return {
        ...p,
        likes: liked
          ? (p.likes || []).filter(id => String(id?._id || id) !== String(user._id))
          : [...(p.likes || []), user._id],
      };
    }));
    try { await likePost(postId); } catch (_) {}
  };

  const handleRepost = async (postId) => {
    try {
      const res = await repostPost(postId);
      if (res.data.repost) {
        setPosts(prev => prev.some(p => p._id === res.data.repost._id)
          ? prev : [res.data.repost, ...prev]);
      }
    } catch (_) {}
  };

  return (
    <div className="h-screen bg-theme-primary flex overflow-hidden">

      {/* ── Feed (70%) ──────────────────────────────────────── */}
      <div className="w-full lg:w-[70%] flex flex-col h-screen border-r border-theme overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 bg-theme-primary/90 backdrop-blur-md border-b border-theme z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <FaTwitter className="text-blue-400" size={20} />
              <h1 className="text-lg font-bold text-theme-primary">Home</h1>
            </div>
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-theme-hover transition text-theme-muted hover:text-blue-400">
              <FaSearch size={16} />
            </button>
          </div>
          <div className="flex">
            {[{ id: "for_you", label: "For you" }, { id: "following", label: "Following" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm font-semibold transition relative ${tab === t.id ? "text-theme-primary" : "text-theme-muted hover:text-theme-primary hover:bg-theme-hover/30"}`}>
                {t.label}
                {tab === t.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-400 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable feed */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-theme scrollbar-track-transparent">
          {user && <ComposeBox user={user} onTweet={post => post && setPosts(prev => [post, ...prev])} />}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-theme-muted text-sm">Loading tweets...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-theme-muted">
              <FaTwitter size={40} className="opacity-20" />
              <p className="text-base font-semibold">No posts yet</p>
              <p className="text-sm text-center px-8">
                {tab === "following" ? "Follow people to see their tweets here" : "Be the first to post something!"}
              </p>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <TweetCard key={post._id} post={post} currentUser={user}
                  onLike={handleLike} onRepost={handleRepost}
                  onNavigate={username => navigate(`/profile/${username}`)} />
              ))}
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {loadingMore && <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                {!hasMore && posts.length > 0 && <p className="text-xs text-theme-muted">You're all caught up ✓</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Right Sidebar (30%) — desktop ───────────────────── */}
      <div className="hidden lg:flex lg:w-[30%] h-screen flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-theme scrollbar-track-transparent">
        <RightSidebar navigate={navigate} />
      </div>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-theme-primary z-50 overflow-y-auto shadow-2xl lg:hidden animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-theme sticky top-0 bg-theme-primary z-10">
              <h2 className="font-bold text-theme-primary">Explore</h2>
              <button onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-hover text-theme-muted transition">
                <FaTimes size={14} />
              </button>
            </div>
            <RightSidebar navigate={navigate} />
          </div>
        </>
      )}
    </div>
  );
}
