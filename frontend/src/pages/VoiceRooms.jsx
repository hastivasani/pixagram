import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { getSocket } from "../utils/socket";
import {
  getFeed, likePost, commentPost, createPost,
  getSuggestedUsers, followUser, getTrendingHashtags,
} from "../services/api";
import { HiOutlineHeart, HiHeart, HiOutlineChat, HiOutlineUpload,
  HiOutlineDotsHorizontal, HiOutlinePhotograph, HiOutlineEmojiHappy,
  HiOutlineChartBar, HiSparkles, HiSearch, HiHome,
  HiSun, HiMoon } from "react-icons/hi";
import { FaTwitter, FaRetweet, FaFeatherAlt } from "react-icons/fa";

// Theme-aware color tokens
const T = (isDark) => ({
  bg:         isDark ? "bg-black"       : "bg-white",
  bgHover:    isDark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50",
  bgCard:     isDark ? "bg-[#16181c]"   : "bg-gray-50",
  bgInput:    isDark ? "bg-[#202327]"   : "bg-gray-100",
  bgTopbar:   isDark ? "bg-black/90"    : "bg-white/90",
  border:     isDark ? "border-[#2f3336]" : "border-gray-200",
  text:       isDark ? "text-white"     : "text-gray-900",
  textMuted:  isDark ? "text-[#71767b]" : "text-gray-500",
  textHover:  isDark ? "hover:text-white" : "hover:text-gray-900",
  iconHover:  isDark ? "hover:bg-white/10" : "hover:bg-gray-100",
});

const av = (u) => u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.username||"U")}&background=1d9bf0&color=fff&bold=true`;
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
};
const fmt = (n=0) => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(1)+"K" : String(n);

// ── Top Bar ───────────────────────────────────────────────────
function XTopBar({ currentUser, search, setSearch, onHome, tab, setTab }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const c = T(isDark);
  return (
    <div className={`${c.bgTopbar} backdrop-blur-md border-b ${c.border}`}>
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* X Logo */}
        <button onClick={onHome} className={`p-1.5 rounded-full ${c.iconHover} transition flex-shrink-0`}>
          <FaTwitter size={24} className="text-[#1d9bf0]" />
        </button>

        {/* Home */}
        <button onClick={onHome}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${c.iconHover} transition ${c.text} font-bold text-[15px] flex-shrink-0`}>
          <HiHome size={20} />
          <span>Home</span>
        </button>

        {/* Search */}
        <div className={`flex-1 flex items-center gap-2 ${c.bgInput} rounded-full px-4 py-2 border border-transparent focus-within:border-[#1d9bf0] transition`}>
          <HiSearch className={`${c.textMuted} flex-shrink-0`} size={17} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
            className={`bg-transparent ${c.text} text-[14px] outline-none flex-1 placeholder:${c.textMuted}`} />
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className={`p-2 rounded-full ${c.iconHover} transition flex-shrink-0 ${c.textMuted}`}>
          {isDark ? <HiSun size={20} /> : <HiMoon size={20} />}
        </button>

        {/* Avatar */}
        <button onClick={() => navigate("/profile")} className="flex-shrink-0">
          <img src={av(currentUser)} className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-400" alt="" />
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex border-t ${c.border}`}>
        {[{id:"for-you",label:"For you"},{id:"following",label:"Following"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3.5 text-[15px] font-semibold transition relative ${c.bgHover} ${tab===t.id ? c.text : c.textMuted}`}>
            {t.label}
            {tab===t.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1d9bf0] rounded-full"/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tweet Card ────────────────────────────────────────────────
function TweetCard({ post, currentUser, onProfileClick, onReply }) {
  const { isDark } = useTheme();
  const c = T(isDark);
  const [showReply,  setShowReply]  = useState(false);
  const [replyText,  setReplyText]  = useState("");
  const [liked,      setLiked]      = useState(post.likes?.some(id=>(id?._id||id)?.toString()===currentUser?._id?.toString()));
  const [likeCount,  setLikeCount]  = useState(post.likes?.length||0);
  const [retweeted,  setRetweeted]  = useState(false);
  const [rtCount,    setRtCount]    = useState(post.reposts?.length||0);
  const [replyCount, setReplyCount] = useState(post.comments?.length||0);

  const handleLike = async (e) => {
    e.stopPropagation();
    setLiked(l=>!l); setLikeCount(c=>liked?c-1:c+1);
    try { await likePost(post._id); } catch(_){}
  };
  const handleRt = (e) => {
    e.stopPropagation();
    setRetweeted(r=>!r); setRtCount(c=>retweeted?c-1:c+1);
  };
  const submitReply = async () => {
    if (!replyText.trim()) return;
    try { await commentPost(post._id, replyText); setReplyText(""); setShowReply(false); setReplyCount(c=>c+1); if(onReply)onReply(); } catch(_){}
  };

  const u = post.user;
  return (
    <article className={`border-b ${c.border} px-4 py-3 ${c.bgHover} transition-colors`}>
      <div className="flex gap-3">
        <button onClick={()=>onProfileClick?.(u?.username)} className="flex-shrink-0 mt-0.5">
          <img src={av(u)} className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition" alt="" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <button onClick={()=>onProfileClick?.(u?.username)} className={`font-bold text-[15px] ${c.text} hover:underline truncate max-w-[120px]`}>
              {u?.name||u?.username}
            </button>
            <span className={`${c.textMuted} text-[15px] truncate`}>@{u?.username}</span>
            <span className={`${c.textMuted} text-[15px] flex-shrink-0`}>·</span>
            <span className={`${c.textMuted} text-[13px] flex-shrink-0`}>{timeAgo(post.createdAt)}</span>
            <button className={`ml-auto ${c.textMuted} hover:text-[#1d9bf0] p-1.5 rounded-full hover:bg-[#1d9bf0]/10 transition flex-shrink-0`}>
              <HiOutlineDotsHorizontal size={16}/>
            </button>
          </div>
          {post.caption && (
            <p className={`text-[15px] ${c.text} leading-relaxed mt-0.5 whitespace-pre-wrap break-words`}>{post.caption}</p>
          )}
          {post.mediaUrl && post.mediaType !== "text" && (
            <div className={`mt-3 rounded-2xl overflow-hidden border ${c.border} max-h-[400px]`}>
              {post.mediaType==="video"
                ? <video src={post.mediaUrl} controls className="w-full max-h-[400px] object-cover"/>
                : <img src={post.mediaUrl} alt="" className="w-full max-h-[400px] object-cover"/>}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 max-w-[400px] -ml-1.5">
            <button onClick={e=>{e.stopPropagation();setShowReply(s=>!s);}}
              className={`flex items-center gap-1 ${c.textMuted} hover:text-[#1d9bf0] group`}>
              <span className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition"><HiOutlineChat size={18}/></span>
              <span className="text-[13px]">{fmt(replyCount)}</span>
            </button>
            <button onClick={handleRt} className={`flex items-center gap-1 group ${retweeted?"text-[#00ba7c]":`${c.textMuted} hover:text-[#00ba7c]`}`}>
              <span className="p-1.5 rounded-full group-hover:bg-[#00ba7c]/10 transition"><FaRetweet size={17}/></span>
              <span className="text-[13px]">{fmt(rtCount)}</span>
            </button>
            <button onClick={handleLike} className={`flex items-center gap-1 group ${liked?"text-[#f91880]":`${c.textMuted} hover:text-[#f91880]`}`}>
              <span className="p-1.5 rounded-full group-hover:bg-[#f91880]/10 transition">
                {liked?<HiHeart size={18}/>:<HiOutlineHeart size={18}/>}
              </span>
              <span className="text-[13px]">{fmt(likeCount)}</span>
            </button>
            <button className={`flex items-center gap-1 ${c.textMuted} hover:text-[#1d9bf0] group`}>
              <span className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition"><HiOutlineChartBar size={18}/></span>
              <span className="text-[13px]">{fmt(Math.floor(Math.random()*9000)+500)}</span>
            </button>
            <button className={`flex items-center gap-1 ${c.textMuted} hover:text-[#1d9bf0] group`}>
              <span className="p-1.5 rounded-full group-hover:bg-[#1d9bf0]/10 transition"><HiOutlineUpload size={18}/></span>
            </button>
          </div>
          {showReply && (
            <div className="mt-3 flex gap-2 items-start">
              <img src={av(currentUser)} className="w-8 h-8 rounded-full flex-shrink-0" alt=""/>
              <div className={`flex-1 border ${c.border} rounded-2xl px-3 py-2`}>
                <input value={replyText} onChange={e=>setReplyText(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&submitReply()}
                  placeholder="Post your reply"
                  className={`w-full bg-transparent ${c.text} text-[15px] outline-none placeholder:${c.textMuted}`}/>
                <div className="flex justify-end mt-2">
                  <button onClick={submitReply} disabled={!replyText.trim()}
                    className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-4 py-1.5 rounded-full text-[14px] disabled:opacity-50 transition">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Compose Box ───────────────────────────────────────────────
function ComposeTweet({ currentUser, onPost }) {
  const { isDark } = useTheme();
  const c = T(isDark);
  const [text,         setText]         = useState("");
  const [posting,      setPosting]      = useState(false);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);
  const max  = 280;
  const left = max - text.length;
  const pct  = Math.min((text.length / max) * 100, 100);
  const color = left < 0 ? "#f4212e" : left < 20 ? "#ffd400" : "#1d9bf0";

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = () => { setImageFile(null); setImagePreview(null); };

  const handlePost = async () => {
    if ((!text.trim() && !imageFile) || posting || left < 0) return;
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append("caption", text.trim());
      if (imageFile) {
        fd.append("media", imageFile);
        fd.append("mediaType", "image");
      } else {
        fd.append("mediaType", "text");
      }
      await createPost(fd);
      setText(""); setImageFile(null); setImagePreview(null);
      if (onPost) onPost();
    } catch (_) {} finally { setPosting(false); }
  };

  return (
    <div className={`border-b ${c.border} px-4 pt-3 pb-2`}>
      <div className="flex gap-3">
        <img src={av(currentUser)} className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-1" alt="" />
        <div className="flex-1 min-w-0">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="What is happening?!"
            rows={text.length > 60 ? 4 : 2}
            className={`w-full bg-transparent ${c.text} text-[20px] outline-none resize-none placeholder:text-gray-400 leading-relaxed mt-2`} />
          {imagePreview && (
            <div className={`relative mt-2 rounded-2xl overflow-hidden border ${c.border}`}>
              <img src={imagePreview} alt="preview" className="w-full max-h-[300px] object-cover rounded-2xl" />
              <button onClick={removeImage}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black transition text-lg font-bold">×</button>
            </div>
          )}
          <div className={`border-t ${c.border} mt-2 pt-2 flex items-center justify-between`}>
            <div className="flex items-center gap-0 text-[#1d9bf0]">
              <button onClick={() => fileRef.current?.click()} className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition"><HiOutlinePhotograph size={20} /></button>
              <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={pickImage} />
              <button className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition"><HiOutlineEmojiHappy size={20} /></button>
              <button className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition"><FaFeatherAlt size={16} /></button>
            </div>
            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 22 22">
                    <circle cx="11" cy="11" r="9" fill="none" stroke={isDark?"#2f3336":"#e5e7eb"} strokeWidth="2.5" />
                    <circle cx="11" cy="11" r="9" fill="none" stroke={color} strokeWidth="2.5"
                      strokeDasharray={`${2*Math.PI*9}`} strokeDashoffset={`${2*Math.PI*9*(1-pct/100)}`}
                      strokeLinecap="round" transform="rotate(-90 11 11)" />
                  </svg>
                  {left <= 20 && <span className={`text-sm font-medium ${left<0?"text-[#f4212e]":c.textMuted}`}>{left}</span>}
                </div>
              )}
              <button onClick={handlePost} disabled={(!text.trim()&&!imageFile)||posting||left<0}
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-5 py-2 rounded-full text-[15px] disabled:opacity-50 transition">
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Right Sidebar ─────────────────────────────────────────────
function XRightSidebar({ currentUser }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const c = T(isDark);
  const [search,    setSearch]    = useState("");
  const [trends,    setTrends]    = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [following, setFollowing] = useState(new Set());

  useEffect(()=>{
    getTrendingHashtags().then(r=>setTrends(r.data?.slice(0,5)||[])).catch(()=>{});
    getSuggestedUsers().then(r=>setSuggested(r.data?.slice(0,3)||[])).catch(()=>{});
  },[]);

  const handleFollow = async (id) => {
    try { await followUser(id); setFollowing(p=>new Set([...p,id])); } catch(_){}
  };

  const defaultTrends = ["React","JavaScript","WebDev","OpenAI","Tech"].map((t,i)=>({tag:t,count:(i+1)*10000+Math.floor(Math.random()*5000)}));
  const displayTrends = trends.length>0 ? trends : defaultTrends;

  return (
    <div className="w-[350px] flex-shrink-0 pl-6 hidden lg:block">
      <div className="pt-2 space-y-4 px-4">
        <div className={`flex items-center gap-3 ${c.bgInput} rounded-full px-4 py-2.5 border border-transparent focus-within:border-[#1d9bf0] transition`}>
          <HiSearch className={`${c.textMuted} flex-shrink-0`} size={18}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search"
            className={`bg-transparent ${c.text} text-[15px] outline-none flex-1 placeholder:text-gray-400`}/>
        </div>
        <div className={`${c.bgCard} rounded-2xl p-4`}>
          <h2 className={`text-[19px] font-extrabold ${c.text} mb-1`}>Subscribe to Premium</h2>
          <p className={`text-[14px] ${c.text} mb-3 leading-snug`}>Subscribe to unlock new features and if eligible, receive a share of revenue.</p>
          <button className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-4 py-2 rounded-full text-[15px] transition">Subscribe</button>
        </div>
        <div className={`${c.bgCard} rounded-2xl overflow-hidden`}>
          <h2 className={`text-[19px] font-extrabold ${c.text} px-4 pt-3 pb-1`}>Trends for you</h2>
          {displayTrends.map((t,i)=>(
            <div key={i} onClick={()=>navigate(`/trending/${t.tag}`)}
              className={`px-4 py-3 ${c.bgHover} transition cursor-pointer border-t ${c.border} flex items-start justify-between group`}>
              <div>
                <p className={`${c.textMuted} text-[12px]`}>Trending</p>
                <p className={`${c.text} font-bold text-[15px] group-hover:text-[#1d9bf0] transition`}>#{t.tag}</p>
                <p className={`${c.textMuted} text-[12px]`}>{fmt(t.count)} posts</p>
              </div>
              <button className={`${c.textMuted} hover:text-[#1d9bf0] p-1 rounded-full hover:bg-[#1d9bf0]/10 transition mt-1`}>
                <HiOutlineDotsHorizontal size={16}/>
              </button>
            </div>
          ))}
          <button className={`px-4 py-3 text-[#1d9bf0] text-[15px] ${c.bgHover} transition w-full text-left border-t ${c.border}`}>Show more</button>
        </div>
        <div className={`${c.bgCard} rounded-2xl overflow-hidden`}>
          <h2 className={`text-[19px] font-extrabold ${c.text} px-4 pt-3 pb-1`}>Who to follow</h2>
          {suggested.length===0 ? (
            <p className={`px-4 py-3 ${c.textMuted} text-sm border-t ${c.border}`}>No suggestions yet</p>
          ) : suggested.map(u=>(
            <div key={u._id} className={`flex items-center gap-3 px-4 py-3 ${c.bgHover} transition border-t ${c.border}`}>
              <img src={av(u)} className="w-10 h-10 rounded-full object-cover cursor-pointer flex-shrink-0"
                onClick={()=>navigate(`/profile/${u.username}`)} alt=""/>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>navigate(`/profile/${u.username}`)}>
                <p className={`${c.text} font-bold text-[15px] truncate leading-tight`}>{u.name||u.username}</p>
                <p className={`${c.textMuted} text-[13px] truncate`}>@{u.username}</p>
              </div>
              <button onClick={()=>handleFollow(u._id)}
                className={`px-4 py-1.5 rounded-full text-[14px] font-bold transition flex-shrink-0 ${
                  following.has(u._id)
                    ? `bg-transparent border border-gray-400 ${c.text} hover:border-[#f4212e] hover:text-[#f4212e]`
                    : isDark ? "bg-white text-black hover:bg-gray-200" : "bg-gray-900 text-white hover:bg-gray-700"
                }`}>
                {following.has(u._id)?"Following":"Follow"}
              </button>
            </div>
          ))}
          <button className={`px-4 py-3 text-[#1d9bf0] text-[15px] ${c.bgHover} transition w-full text-left border-t ${c.border}`}>Show more</button>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 pb-4">
          {["Terms","Privacy","Cookie Policy","Accessibility","Ads info","More"].map(l=>(
            <span key={l} className={`${c.textMuted} text-[12px] hover:underline cursor-pointer`}>{l}</span>
          ))}
          <span className={`${c.textMuted} text-[12px]`}>© 2025 X Corp.</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function VoiceRooms() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("for-you");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isDark } = useTheme();
  const c = T(isDark);
  const loaderRef  = useRef(null);
  const loadingRef = useRef(false);

  const loadFeed = useCallback(async (reset=false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const p = reset ? 1 : page;
      const res = await getFeed(p);
      const newPosts = res.data?.posts || res.data || [];
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
      if (newPosts.length < 10) setHasMore(false);
      else { setHasMore(true); if(!reset) setPage(p+1); }
      if (reset) setPage(2);
    } catch(_){} finally { setLoading(false); loadingRef.current=false; }
  },[page]);

  useEffect(()=>{ loadFeed(true); },[tab]);

  useEffect(()=>{
    const obs = new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting&&hasMore&&!loadingRef.current) loadFeed();
    },{threshold:0.1});
    if(loaderRef.current) obs.observe(loaderRef.current);
    return ()=>obs.disconnect();
  },[hasMore, loadFeed]);

  useEffect(()=>{
    if(!user?._id) return;
    const socket = getSocket(user._id);
    const onNew = (post) => setPosts(prev=>prev.some(p=>p._id===post._id)?prev:[post,...prev]);
    socket.on("newPost", onNew);
    return ()=>socket.off("newPost", onNew);
  },[user?._id]);

  return (
    // overflow-hidden on outer — each column scrolls independently
    <div className={`${c.bg} h-screen overflow-hidden`} style={{marginLeft:"-4rem"}}>
      <div className="max-w-[1000px] mx-auto flex h-full">

        {/* Center feed — independent scroll */}
        <main className={`flex-1 min-w-0 border-x ${c.border} flex flex-col h-full overflow-y-auto scrollbar-hide`}>

          {/* Sticky top bar inside scrollable column */}
          <div className="sticky top-0 z-20">
            <XTopBar
              currentUser={user}
              search={search}
              setSearch={setSearch}
              tab={tab}
              setTab={setTab}
              onHome={() => { setTab("for-you"); loadFeed(true); }}
            />
          </div>

          {/* Compose */}
          <ComposeTweet currentUser={user} onPost={() => loadFeed(true)} />

          {/* Feed */}
          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-8">
              <FaTwitter size={44} className="mx-auto mb-4 text-[#1d9bf0]" />
              <h2 className="text-[23px] font-extrabold text-white mb-2">Welcome to X!</h2>
              <p className="text-[#71767b] text-[15px]">This is the best place to see what's happening. Follow some people to get started.</p>
            </div>
          ) : (
            posts.map(post => (
              <TweetCard key={post._id} post={post} currentUser={user}
                onProfileClick={username => navigate(`/profile/${username}`)}
                onReply={() => loadFeed(true)} />
            ))
          )}

          <div ref={loaderRef} className="py-6 flex justify-center">
            {loading && posts.length > 0 && <div className="w-5 h-5 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin" />}
          </div>
        </main>

        {/* Right sidebar — independent scroll */}
        <div className="w-[340px] flex-shrink-0 h-full overflow-y-auto scrollbar-hide hidden lg:block">
          <XRightSidebar currentUser={user} />
        </div>
      </div>
    </div>
  );
}
