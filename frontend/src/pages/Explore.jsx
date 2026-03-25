import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsers, getExplorePosts, getUserPosts } from "../services/api";
import { HiSearch, HiX } from "react-icons/hi";

const CATEGORIES = ["For You", "Art", "Travel", "Food", "Music", "Style", "Nature", "Fitness", "Tech", "Pets"];

const FALLBACK_URLS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600",
];

const FALLBACK = FALLBACK_URLS.map((url, i) => ({
  _id: "fb_" + i,
  mediaUrl: url,
  mediaType: "image",
  likes: [],
  comments: [],
  user: null,
}));

// Aspect ratio pattern per column for masonry feel
const ASPECTS = [
  ["aspect-[3/4]", "aspect-square",  "aspect-[2/3]",  "aspect-[4/5]",  "aspect-square",  "aspect-[3/4]"],
  ["aspect-square",  "aspect-[4/5]",  "aspect-[3/4]",  "aspect-square",  "aspect-[2/3]",  "aspect-[4/5]"],
  ["aspect-[2/3]",  "aspect-[3/4]",  "aspect-square",  "aspect-[2/3]",  "aspect-[3/4]",  "aspect-square"],
];

function splitColumns(posts) {
  const cols = [[], [], []];
  posts.forEach((p, i) => cols[i % 3].push(p));
  return cols;
}

export default function Explore() {
  const navigate = useNavigate();
  const [query,        setQuery]        = useState("");
  const [activeTab,    setActiveTab]    = useState("For You");
  const [users,        setUsers]        = useState([]);
  const [userPosts,    setUserPosts]    = useState({});
  const [explorePosts, setExplorePosts] = useState([]);
  const [searching,    setSearching]    = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    getExplorePosts()
      .then((res) => setExplorePosts(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setUsers([]); setUserPosts({}); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchUsers(query.trim());
        setUsers(res.data);
        const postsMap = {};
        await Promise.all(
          res.data.map(async (u) => {
            try {
              const pr = await getUserPosts(u._id);
              postsMap[u._id] = pr.data.slice(0, 6);
            } catch (_) { postsMap[u._id] = []; }
          })
        );
        setUserPosts(postsMap);
      } catch (_) {}
      setSearching(false);
    }, 350);
  }, [query]);

  const isSearching = query.trim().length > 0;
  const displayPosts = explorePosts.length > 0 ? explorePosts : FALLBACK;
  const columns = splitColumns(displayPosts);

  return (
    <div className="min-h-screen bg-theme-primary pb-[68px] md:pb-0">

      {/* Sticky top */}
      <div className="sticky top-0 bg-theme-primary z-20 px-3 pt-3 pb-0">
        <div className="relative mb-3">
          <HiSearch size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-theme-input text-theme-primary rounded-xl pl-9 pr-9 py-2.5 outline-none placeholder:text-theme-muted text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted">
              <HiX size={15} />
            </button>
          )}
        </div>

        {!isSearching && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={
                  "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 " +
                  (activeTab === cat
                    ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white"
                    : "bg-theme-input text-theme-secondary border-theme")
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search results */}
      {isSearching ? (
        <div className="px-3 py-2">
          {searching ? (
            <p className="text-center text-theme-muted text-sm py-10">Searching...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-theme-muted text-sm py-10">No results for "{query}"</p>
          ) : (
            <div className="space-y-5">
              {users.map((u) => (
                <div key={u._id}>
                  <div
                    onClick={() => navigate("/profile/" + u.username)}
                    className="flex items-center gap-3 py-2 px-2 cursor-pointer hover:bg-theme-hover rounded-xl transition"
                  >
                    <img
                      src={u.avatar || "https://ui-avatars.com/api/?name=" + u.username + "&background=random"}
                      alt={u.username}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-theme-primary text-sm truncate">{u.username}</p>
                      {u.name && <p className="text-theme-muted text-xs truncate">{u.name}</p>}
                    </div>
                  </div>
                  {userPosts[u._id]?.length > 0 && (
                    <div className="grid grid-cols-3 gap-0.5 mt-1">
                      {userPosts[u._id].map((post) => (
                        <div
                          key={post._id}
                          onClick={() => navigate("/profile/" + u.username)}
                          className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer relative"
                        >
                          {post.mediaType === "video"
                            ? <video src={post.mediaUrl} muted className="w-full h-full object-cover" />
                            : <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                          }
                          {post.mediaType === "video" && (
                            <span className="absolute top-1 right-1 text-white text-[10px] bg-black/50 rounded px-1">▶</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Masonry 3-column grid */
        <div className="flex gap-0.5 mt-0.5">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-0.5 flex-1 min-w-0">
              {col.map((post, pi) => {
                const aspect = ASPECTS[ci][pi % ASPECTS[ci].length];
                return (
                  <div
                    key={post._id}
                    onClick={() => post.user && navigate("/profile/" + post.user.username)}
                    className={"relative overflow-hidden cursor-pointer group bg-gray-100 dark:bg-gray-800 w-full " + aspect}
                  >
                    {post.mediaType === "video" ? (
                      <video
                        src={post.mediaUrl}
                        muted
                        className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition duration-200"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition duration-200"
                      />
                    )}
                    {post.mediaType === "video" && (
                      <span className="absolute top-2 right-2 text-white text-xs bg-black/40 rounded-full px-1.5 py-0.5">▶</span>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 pointer-events-none">
                      <span className="text-white font-semibold text-xs drop-shadow">{"❤️ " + (post.likes?.length || 0)}</span>
                      <span className="text-white font-semibold text-xs drop-shadow">{"💬 " + (post.comments?.length || 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
