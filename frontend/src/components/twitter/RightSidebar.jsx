import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { getTrendingHashtags, getTrendingCreators, followUser, getNews } from "../../services/api";
import { FaSearch, FaEllipsisH, FaTimes, FaExternalLinkAlt, FaNewspaper } from "react-icons/fa";
import { getAvatar, timeAgo } from "../../utils/timeAgo";

// ── Today's News ──────────────────────────────────────────────
function TodaysNews() {
  const [articles, setArticles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [nextRefresh, setNextRefresh] = useState(null);

  const fetchNews = async () => {
    try {
      const res = await getNews();
      setArticles(res.data.articles || []);
      if (res.data.nextRefresh) setNextRefresh(res.data.nextRefresh);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Auto-refresh when cache expires
  useEffect(() => {
    if (!nextRefresh) return;
    const delay = nextRefresh - Date.now();
    if (delay <= 0) { fetchNews(); return; }
    const t = setTimeout(fetchNews, delay);
    return () => clearTimeout(t);
  }, [nextRefresh]);

  if (dismissed) return null;

  const display = expanded ? articles : articles.slice(0, 3);

  const categoryColor = (cat) => {
    const map = {
      Technology: "text-blue-400 bg-blue-400/10",
      Sports:     "text-green-400 bg-green-400/10",
      Finance:    "text-yellow-400 bg-yellow-400/10",
      World:      "text-purple-400 bg-purple-400/10",
      General:    "text-gray-400 bg-gray-400/10",
    };
    return map[cat] || map.General;
  };

  return (
    <div className="bg-theme-secondary rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <FaNewspaper className="text-blue-400" size={14} />
          <h3 className="font-bold text-theme-primary text-lg">Today's News</h3>
        </div>
        <button onClick={() => setDismissed(true)}
          className="text-theme-muted hover:text-theme-primary transition p-1 rounded-full hover:bg-theme-hover">
          <FaTimes size={12} />
        </button>
      </div>

      {loading ? (
        <div className="px-4 pb-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-1.5">
              <div className="h-3 bg-theme-hover rounded w-full" />
              <div className="h-3 bg-theme-hover rounded w-3/4" />
              <div className="h-2 bg-theme-hover rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {display.map((article, i) => (
            <a
              key={i}
              href={article.url !== "#" ? article.url : undefined}
              target={article.url !== "#" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex gap-3 px-4 py-3 hover:bg-theme-hover transition cursor-pointer group"
            >
              {/* Article image or icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-theme-hover flex items-center justify-center">
                {article.image ? (
                  <img src={article.image} alt="" className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <FaNewspaper className="text-theme-muted" size={18} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-theme-primary line-clamp-2 group-hover:text-blue-400 transition leading-snug">
                  {article.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${categoryColor(article.category)}`}>
                    {article.category || article.source}
                  </span>
                  <span className="text-[10px] text-theme-muted">{timeAgo(article.publishedAt)}</span>
                  {article.url !== "#" && (
                    <FaExternalLinkAlt size={8} className="text-theme-muted ml-auto opacity-0 group-hover:opacity-100 transition" />
                  )}
                </div>
              </div>
            </a>
          ))}

          {articles.length > 3 && (
            <button onClick={() => setExpanded(s => !s)}
              className="w-full text-left px-4 py-3 text-blue-400 hover:bg-theme-hover text-sm transition">
              {expanded ? "Show less" : `Show ${articles.length - 3} more`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function RightSidebar({ navigate }) {
  const { user } = useAuth();
  const [search, setSearch]       = useState("");
  const [trending, setTrending]   = useState([]);
  const [allUsers, setAllUsers]   = useState([]);
  const [showAll, setShowAll]     = useState(false);
  const [followed, setFollowed]   = useState(new Set());

  useEffect(() => {
    getTrendingHashtags().then(r => setTrending(r.data?.slice(0, 5) || [])).catch(() => {});
    getTrendingCreators().then(r => {
      setAllUsers((r.data || []).filter(u => u._id !== user?._id));
    }).catch(() => {});
  }, [user?._id]);

  const handleFollow = async (id) => {
    try {
      await followUser(id);
      setFollowed(prev => new Set([...prev, id]));
    } catch (_) {}
  };

  const displayUsers = showAll ? allUsers : allUsers.slice(0, 3);

  const fallbackTrending = [
    { tag: "OpenAI", count: "125K" },
    { tag: "Cricket", count: "89K" },
    { tag: "Music", count: "54K" },
  ];

  return (
    <div className="p-4 space-y-4 w-full">
      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted text-sm" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
          className="w-full bg-theme-secondary rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition text-theme-primary placeholder:text-theme-muted" />
      </div>

      {/* Premium */}
      <div className="bg-theme-secondary rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-theme-primary">Subscribe to Premium</h3>
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">50% off</span>
        </div>
        <p className="text-xs text-theme-muted mb-3">Get rid of ads, see your analytics, boost your replies and unlock 20+ features.</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full transition">Subscribe</button>
      </div>

      {/* Today's News */}
      <TodaysNews />

      {/* Trending */}
      <div className="bg-theme-secondary rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h3 className="font-bold text-theme-primary text-lg">What's happening</h3>
        </div>
        {(trending.length > 0 ? trending : fallbackTrending).map((t, i) => (
          <button key={t._id || i} onClick={() => navigate(`/twitter?hashtag=${t.tag}`)}
            className="w-full flex items-start justify-between px-4 py-3 hover:bg-theme-hover transition text-left">
            <div>
              <p className="text-xs text-theme-muted">Trending · {typeof t.count === "number" ? t.count.toLocaleString() : t.count} posts</p>
              <p className="font-bold text-theme-primary text-sm">#{t.tag}</p>
            </div>
            <FaEllipsisH className="text-theme-muted mt-1 flex-shrink-0" size={13} />
          </button>
        ))}
        <button className="w-full text-left px-4 py-3 text-blue-400 hover:bg-theme-hover text-sm transition">Show more</button>
      </div>

      {/* Who to follow */}
      {allUsers.length > 0 && (
        <div className="bg-theme-secondary rounded-2xl overflow-hidden">
          <h3 className="font-bold text-theme-primary text-lg px-4 pt-4 pb-2">Who to follow</h3>
          {displayUsers.map(u => (
            <div key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-theme-hover transition">
              <img src={getAvatar(u)} className="w-10 h-10 rounded-full object-cover cursor-pointer flex-shrink-0"
                onClick={() => navigate(`/profile/${u.username}`)} alt="" />
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${u.username}`)}>
                <div className="flex items-center gap-1">
                  <p className="font-bold text-sm text-theme-primary truncate">{u.name || u.username}</p>
                  {u.isVerified && <span className="text-blue-400 text-xs">✓</span>}
                </div>
                <p className="text-xs text-theme-muted truncate">@{u.username}</p>
              </div>
              <button onClick={() => handleFollow(u._id)} disabled={followed.has(u._id)}
                className={`text-sm font-bold px-3 py-1.5 rounded-full transition flex-shrink-0 border ${
                  followed.has(u._id) ? "border-theme text-theme-muted" : "border-theme-primary text-theme-primary hover:border-blue-400 hover:text-blue-400"
                }`}>
                {followed.has(u._id) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
          <button onClick={() => setShowAll(s => !s)}
            className="w-full text-left px-4 py-3 text-blue-400 hover:bg-theme-hover text-sm transition">
            {showAll ? "Show less" : "Show more"}
          </button>
        </div>
      )}

      <p className="text-xs text-theme-muted px-1 pb-6 leading-relaxed">
        Terms · Privacy · Cookies · Ads info · More · © 2026 X Corp.
      </p>
    </div>
  );
}
