import { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import { getFeed, getStories, getReels } from "../services/api";
import { useAuth } from "./AuthContext";
import { getSocket } from "../utils/socket";

const ContentContext = createContext();

export function ContentProvider({ children }) {
  const { user } = useAuth();
  const [posts,        setPosts]        = useState([]);
  const [stories,      setStories]      = useState([]);
  const [reels,        setReels]        = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore,      setHasMore]      = useState(true);
  const [feedPage,     setFeedPage]     = useState(1);

  const fetchFeed = useCallback(async (page = 1) => {
    try {
      setLoadingPosts(true);
      // excludeTwitter=true — show all posts except twitter source
      const res = await getFeed(page, false, true);
      const data    = res.data?.posts ?? res.data;
      const more    = res.data?.hasMore ?? false;
      const sorted  = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (page === 1) {
        setPosts(sorted);
      } else {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p._id));
          const newOnes = sorted.filter((p) => !ids.has(p._id));
          return [...prev, ...newOnes];
        });
      }
      setHasMore(more);
      setFeedPage(page);
    } catch (err) {
      console.error("Feed error:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const loadMoreFeed = useCallback(() => {
    if (!loadingPosts && hasMore) fetchFeed(feedPage + 1);
  }, [loadingPosts, hasMore, feedPage, fetchFeed]);

  const fetchStories = useCallback(async () => {
    try {
      const res = await getStories();
      const now = Date.now();
      // filter out any already-expired stories on the client side too
      const live = res.data.filter((s) => new Date(s.expiresAt).getTime() > now);
      setStories(live);
    } catch (err) {
      console.error("Stories error:", err);
    }
  }, []);

  const fetchReels = useCallback(async () => {
    try {
      const res = await getReels();
      setReels(res.data);
    } catch (err) {
      console.error("Reels error:", err);
    }
  }, []);

  // Auto-remove expired stories from state without a refresh
  useEffect(() => {
    if (stories.length === 0) return;
    // find the soonest expiry
    const soonest = Math.min(...stories.map((s) => new Date(s.expiresAt).getTime()));
    const delay = soonest - Date.now();
    if (delay <= 0) {
      setStories((prev) => prev.filter((s) => new Date(s.expiresAt).getTime() > Date.now()));
      return;
    }
    const timer = setTimeout(() => {
      setStories((prev) => prev.filter((s) => new Date(s.expiresAt).getTime() > Date.now()));
    }, delay);
    return () => clearTimeout(timer);
  }, [stories]);

  const prependPost = (post) => setPosts((prev) => {
    if (prev.some((p) => p._id === post._id)) return prev;
    return [post, ...prev];
  });

  // ── Real-time socket listeners ──────────────────────────────
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);

    const onNewPost = (post) => {
      // Only show non-twitter posts on home feed
      if (post?.source === "twitter") return;
      setPosts((prev) => {
        if (prev.some((p) => p._id === post._id)) return prev;
        return [post, ...prev];
      });
    };

    const onLike = ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((p) => p._id === postId ? { ...p, likes } : p)
      );
    };

    const onComment = ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), comment] }
            : p
        )
      );
    };

    const onNewStory = (story) => {
      // only add if not expired
      if (new Date(story.expiresAt).getTime() <= Date.now()) return;
      setStories((prev) => {
        if (prev.some((s) => s._id === story._id)) return prev;
        return [story, ...prev];
      });
    };

    const onNewReel = (reel) => {
      setReels((prev) => {
        if (prev.some((r) => r._id === reel._id)) return prev;
        return [reel, ...prev];
      });
    };

    socket.on("newPost",    onNewPost);
    socket.on("postLiked",  onLike);
    socket.on("newComment", onComment);
    socket.on("newStory",   onNewStory);
    socket.on("newReel",    onNewReel);

    return () => {
      socket.off("newPost",    onNewPost);
      socket.off("postLiked",  onLike);
      socket.off("newComment", onComment);
      socket.off("newStory",   onNewStory);
      socket.off("newReel",    onNewReel);
    };
  }, [user?._id]);

  const contextValue = useMemo(() => ({
    posts, stories, reels,
    loadingPosts, hasMore,
    fetchFeed, fetchStories, fetchReels, loadMoreFeed,
    prependPost,
    setPosts, setStories, setReels,
  }), [posts, stories, reels, loadingPosts, hasMore, fetchFeed, fetchStories, fetchReels, loadMoreFeed]);

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}
