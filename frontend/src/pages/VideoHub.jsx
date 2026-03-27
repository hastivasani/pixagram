import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FaSearch, FaThumbsUp, FaThumbsDown, FaShare, FaEllipsisV,
  FaPlay, FaListUl, FaFire, FaHome, FaCompass, FaHistory,
  FaBookmark, FaVideo, FaTimes, FaChevronLeft, FaChevronRight,
  FaCheck, FaDownload, FaBell, FaPlus, FaClock, FaEye,
  FaRegBell, FaRegBookmark, FaRegThumbsUp,
  FaCog, FaFlag, FaQuestionCircle, FaCommentAlt,
  FaGamepad, FaDumbbell, FaNewspaper
} from "react-icons/fa";
import { MdVideoLibrary, MdSubscriptions, MdOutlineWatchLater, MdOutlineVideoLibrary } from "react-icons/md";
import { HiOutlineQueueList } from "react-icons/hi2";

// ─── Data ────────────────────────────────────────────────────
const VIDEOS = [
  { id:"v1",  title:"Building a Full Stack App with React & Node.js in 2026",       channel:"CodeWithMe",    avatar:"https://i.pravatar.cc/40?img=1",  thumb:"https://images.unsplash.com/photo-1587620962725-abab19836100?w=640&h=360&fit=crop", views:"1.2M", age:"3 days ago",   dur:"18:42", verified:true,  cat:"Programming", likes:"48K", subs:"234K" },
  { id:"v2",  title:"Top 10 Travel Destinations You Must Visit This Year",           channel:"WanderWorld",   avatar:"https://i.pravatar.cc/40?img=2",  thumb:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=640&h=360&fit=crop", views:"4.5M", age:"1 week ago",  dur:"12:15", verified:true,  cat:"Travel",      likes:"120K",subs:"1.1M" },
  { id:"v3",  title:"Mastering Tailwind CSS — Complete Guide for Beginners",         channel:"DevTips",       avatar:"https://i.pravatar.cc/40?img=3",  thumb:"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&h=360&fit=crop", views:"890K", age:"2 weeks ago", dur:"24:30", verified:false, cat:"Programming", likes:"32K", subs:"98K" },
  { id:"v4",  title:"Cooking the Perfect Biryani — Restaurant Style at Home",       channel:"FoodieKitchen", avatar:"https://i.pravatar.cc/40?img=4",  thumb:"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=640&h=360&fit=crop", views:"2.1M", age:"5 days ago",  dur:"22:08", verified:true,  cat:"Food",        likes:"87K", subs:"560K" },
  { id:"v5",  title:"iPhone 17 Pro Max — Full Review After 30 Days",                channel:"TechReviewer",  avatar:"https://i.pravatar.cc/40?img=5",  thumb:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=640&h=360&fit=crop", views:"6.7M", age:"2 days ago",  dur:"15:55", verified:true,  cat:"Tech",        likes:"210K",subs:"2.3M" },
  { id:"v6",  title:"Morning Yoga Routine — 20 Minutes Full Body Stretch",          channel:"YogaWithSara",  avatar:"https://i.pravatar.cc/40?img=6",  thumb:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=640&h=360&fit=crop", views:"3.4M", age:"1 month ago", dur:"20:00", verified:false, cat:"Fitness",     likes:"95K", subs:"780K" },
  { id:"v7",  title:"How to Make Money Online in 2026 — Proven Methods",            channel:"FinanceGuru",   avatar:"https://i.pravatar.cc/40?img=7",  thumb:"https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=640&h=360&fit=crop", views:"5.2M", age:"4 days ago",  dur:"31:20", verified:true,  cat:"Finance",     likes:"178K",subs:"1.8M" },
  { id:"v8",  title:"Minecraft Survival Series — Episode 47: Building a Castle",    channel:"GamerPro",      avatar:"https://i.pravatar.cc/40?img=8",  thumb:"https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=640&h=360&fit=crop", views:"780K", age:"6 hours ago", dur:"45:12", verified:false, cat:"Gaming",      likes:"29K", subs:"145K" },
  { id:"v9",  title:"Learn Python in 1 Hour — Crash Course for Absolute Beginners", channel:"PythonMaster",  avatar:"https://i.pravatar.cc/40?img=9",  thumb:"https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=640&h=360&fit=crop", views:"9.1M", age:"3 months ago",dur:"58:44", verified:true,  cat:"Programming", likes:"340K",subs:"3.2M" },
  { id:"v10", title:"Exploring the Streets of Tokyo — 4K Walking Tour",             channel:"CityWalker",    avatar:"https://i.pravatar.cc/40?img=10", thumb:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=640&h=360&fit=crop", views:"1.8M", age:"2 weeks ago", dur:"1:02:30",verified:true,  cat:"Travel",      likes:"67K", subs:"430K" },
  { id:"v11", title:"DIY Home Decor Ideas on a Budget — Transform Your Space",      channel:"HomeStyle",     avatar:"https://i.pravatar.cc/40?img=11", thumb:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=640&h=360&fit=crop", views:"450K", age:"1 week ago",  dur:"16:33", verified:false, cat:"Lifestyle",   likes:"18K", subs:"67K" },
  { id:"v12", title:"The Science of Black Holes Explained Simply",                  channel:"SpaceTime",     avatar:"https://i.pravatar.cc/40?img=12", thumb:"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=640&h=360&fit=crop", views:"7.3M", age:"5 months ago",dur:"28:17", verified:true,  cat:"Science",     likes:"290K",subs:"4.1M" },
];

const SHORTS = [
  { id:"s1", title:"Quick Python tip 🐍", channel:"PythonMaster", thumb:"https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=200&h=356&fit=crop", views:"2.3M" },
  { id:"s2", title:"Sunset in Santorini 🌅", channel:"WanderWorld",  thumb:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200&h=356&fit=crop", views:"5.1M" },
  { id:"s3", title:"60s biryani hack 🍛",   channel:"FoodieKitchen",thumb:"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=356&fit=crop", views:"8.7M" },
  { id:"s4", title:"iPhone camera test 📸", channel:"TechReviewer", thumb:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=356&fit=crop", views:"3.4M" },
  { id:"s5", title:"1-min yoga stretch 🧘", channel:"YogaWithSara", thumb:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=356&fit=crop", views:"1.9M" },
  { id:"s6", title:"Tokyo night walk 🌃",   channel:"CityWalker",   thumb:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=356&fit=crop", views:"4.2M" },
];

const CATS = ["All","Programming","Travel","Food","Tech","Fitness","Finance","Gaming","Science","Lifestyle","Music","News","Sports"];

const MENU_ITEMS = [
  { icon: FaHome,              label:"Home",        id:"home" },
  { icon: FaCompass,           label:"Explore",     id:"explore" },
  { icon: MdSubscriptions,     label:"Subscriptions",id:"subs" },
  { icon: FaHistory,           label:"History",     id:"history" },
  { icon: MdVideoLibrary,      label:"Your Videos", id:"yours" },
  { icon: MdOutlineWatchLater, label:"Watch Later", id:"later" },
  { icon: FaBookmark,          label:"Saved",       id:"saved" },
  { icon: HiOutlineQueueList,  label:"Playlists",   id:"playlists" },
];

const CHANNELS = [
  { name:"CodeWithMe",    img:"https://i.pravatar.cc/32?img=21", subs:"234K",  new:true },
  { name:"TechReviewer",  img:"https://i.pravatar.cc/32?img=22", subs:"2.3M",  new:false },
  { name:"WanderWorld",   img:"https://i.pravatar.cc/32?img=23", subs:"1.1M",  new:true },
  { name:"GamerPro",      img:"https://i.pravatar.cc/32?img=24", subs:"145K",  new:false },
  { name:"YogaWithSara",  img:"https://i.pravatar.cc/32?img=25", subs:"780K",  new:true },
];

// ─── Verified Badge ──────────────────────────────────────────
const Badge = () => (
  <svg className="w-3 h-3 text-theme-secondary inline-block ml-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
  </svg>
);

// ─── Main Component ──────────────────────────────────────────
export default function VideoHub() {
  const navigate = useNavigate();
  const [cat, setCat]           = useState("All");
  const [search, setSearch]     = useState("");
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked]       = useState({});
  const [saved, setSaved]       = useState({});
  const [subbed, setSubbed]     = useState({});
  const [watchLater, setWatchLater] = useState({});
  const catRef = useRef(null);

  const scrollCat = d => { if (catRef.current) catRef.current.scrollLeft += d * 200; };

  const filtered = VIDEOS.filter(v =>
    (cat === "All" || v.cat === cat) &&
    (!query || v.title.toLowerCase().includes(query.toLowerCase()) || v.channel.toLowerCase().includes(query.toLowerCase()))
  );

  if (selected) return (
    <VideoPlayer video={selected} related={VIDEOS.filter(v => v.id !== selected.id)}
      onBack={() => setSelected(null)} liked={liked} setLiked={setLiked}
      saved={saved} setSaved={setSaved} subbed={subbed} setSubbed={setSubbed}
      watchLater={watchLater} setWatchLater={setWatchLater} onSelect={setSelected} />
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">

      {/* ── Topbar ── */}
      <div className="sticky top-0 z-20 bg-theme-primary border-b border-theme flex items-center gap-2 px-3 py-2 h-13">
        {/* Logo */}
        <div className="flex items-center gap-1.5 flex-shrink-0 mr-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-md">
            <FaPlay className="text-white text-xs ml-0.5" />
          </div>
          <span className="font-bold text-base hidden sm:block tracking-tight">VideoHub</span>
        </div>
        {/* Search */}
        <div className="flex flex-1 max-w-xl mx-auto items-center bg-theme-secondary border border-theme rounded-full overflow-hidden focus-within:border-purple-500 transition-colors">
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setQuery(search)}
            placeholder="Search videos, channels..."
            className="flex-1 px-4 py-2 bg-transparent text-sm outline-none" />
          <button onClick={() => setQuery(search)} className="px-4 py-2 bg-theme-hover border-l border-theme text-theme-secondary hover:text-purple-400 transition-colors">
            <FaSearch size={13} />
          </button>
        </div>
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <button onClick={() => navigate("/create")} className="w-9 h-9 rounded-full hover:bg-theme-hover hidden sm:flex items-center justify-center" title="Upload">
            <FaVideo size={14} className="text-theme-secondary" />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-theme-hover flex items-center justify-center relative">
            <FaBell size={14} className="text-theme-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-theme-primary" />
          </button>
          {/* Hamburger at the end */}
          <button onClick={() => setMenuOpen(true)} className="w-9 h-9 rounded-full hover:bg-theme-hover flex flex-col items-center justify-center gap-[5px] flex-shrink-0">
            <span className="w-[18px] h-[2px] bg-[var(--text-primary)] rounded-full" />
            <span className="w-[18px] h-[2px] bg-[var(--text-primary)] rounded-full" />
            <span className="w-[18px] h-[2px] bg-[var(--text-primary)] rounded-full" />
          </button>
        </div>
      </div>

      {/* ── Drawer Portal ── */}
      {menuOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{zIndex:9998}} onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-theme-primary border-l border-theme shadow-2xl flex flex-col overflow-y-auto scrollbar-hide" style={{zIndex:9999}}>

            {/* ── Header ── */}
            <div className="flex items-center gap-2 px-4 py-3 sticky top-0 bg-theme-primary z-10 border-b border-theme flex-shrink-0">
              <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full hover:bg-theme-hover flex flex-col items-center justify-center gap-[5px]">
                <span className="w-[18px] h-[2px] bg-[var(--text-primary)] rounded-full" />
                <span className="w-[18px] h-[2px] bg-[var(--text-primary)] rounded-full" />
                <span className="w-[18px] h-[2px] bg-[var(--text-primary)] rounded-full" />
              </button>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                  <FaPlay className="text-white text-xs ml-0.5" />
                </div>
                <span className="font-bold tracking-tight">VideoHub</span>
              </div>
            </div>

            {/* ── Main Nav ── */}
            <div className="px-2 py-2">
              {[
                { icon: FaHome,    label: "Home",   active: true },
                { icon: FaPlay,    label: "Shorts", active: false },
                { icon: MdSubscriptions, label: "Subscriptions", active: false },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors text-sm font-medium ${item.active ? "bg-theme-secondary text-theme-primary" : "text-theme-secondary"}`}>
                    <Icon size={19} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <hr className="border-theme mx-3" />

            {/* ── Subscriptions ── */}
            <div className="px-2 py-2">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-sm font-bold">Subscriptions</span>
                <FaChevronRight size={11} className="text-theme-secondary" />
              </div>
              {CHANNELS.map(ch => (
                <button key={ch.name} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors">
                  <div className="relative flex-shrink-0">
                    <img src={ch.img} className="w-7 h-7 rounded-full" alt={ch.name} />
                    {ch.new && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-theme-primary" />}
                  </div>
                  <span className="text-sm text-theme-secondary truncate flex-1 text-left">{ch.name}</span>
                  {ch.new && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                </button>
              ))}
              <button onClick={() => setMenuOpen(false)} className="flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors text-sm text-theme-secondary">
                <FaChevronLeft size={14} className="rotate-180" />
                <span>Show more</span>
              </button>
            </div>

            <hr className="border-theme mx-3" />

            {/* ── You ── */}
            <div className="px-2 py-2">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-sm font-bold">You</span>
                <FaChevronRight size={11} className="text-theme-secondary" />
              </div>
              {[
                { icon: FaHistory,           label: "History" },
                { icon: FaListUl,            label: "Playlists" },
                { icon: MdOutlineWatchLater, label: "Watch later" },
                { icon: FaThumbsUp,          label: "Liked videos" },
                { icon: FaVideo,             label: "Your videos" },
                { icon: FaDownload,          label: "Downloads" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors text-sm text-theme-secondary">
                    <Icon size={18} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button onClick={() => setMenuOpen(false)} className="flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors text-sm text-theme-secondary">
                <FaChevronLeft size={14} className="rotate-180" />
                <span>Show more</span>
              </button>
            </div>

            <hr className="border-theme mx-3" />

            {/* ── Explore ── */}
            <div className="px-2 py-2">
              <p className="text-sm font-bold px-3 py-1.5">Explore</p>
              {[
                { icon: FaFire,      label: "Trending" },
                { icon: FaBookmark,  label: "Shopping" },
                { icon: FaPlay,      label: "Music" },
                { icon: FaVideo,     label: "Movies" },
                { icon: FaCompass,   label: "Live" },
                { icon: FaGamepad,   label: "Gaming" },
                { icon: FaNewspaper, label: "News" },
                { icon: FaDumbbell,  label: "Sports" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors text-sm text-theme-secondary">
                    <Icon size={18} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button onClick={() => setMenuOpen(false)} className="flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors text-sm text-theme-secondary">
                <FaChevronLeft size={14} className="rotate-180" />
                <span>Show more</span>
              </button>
            </div>

            <hr className="border-theme mx-3" />

            {/* ── More from VideoHub ── */}
            <div className="px-2 py-2">
              <p className="text-sm font-bold px-3 py-1.5">More from VideoHub</p>
              {[
                { emoji: "⭐", label: "VideoHub Premium", color: "text-yellow-400" },
                { emoji: "🎵", label: "VideoHub Music",   color: "text-green-400" },
                { emoji: "👶", label: "VideoHub Kids",    color: "text-blue-400" },
              ].map(item => (
                <button key={item.label} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors text-sm text-theme-secondary">
                  <span className="text-lg flex-shrink-0">{item.emoji}</span>
                  <span className={item.color}>{item.label}</span>
                </button>
              ))}
            </div>

            <hr className="border-theme mx-3" />

            {/* ── Settings / Report ── */}
            <div className="px-2 py-2">
              {[
                { icon: FaCog,   label: "Settings" },
                { icon: FaFlag,  label: "Report history" },
                { icon: FaQuestionCircle, label: "Help" },
                { icon: FaCommentAlt,     label: "Send feedback" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 w-full px-3 py-2.5 rounded-xl hover:bg-theme-hover transition-colors text-sm text-theme-secondary">
                    <Icon size={17} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Footer ── */}
            <div className="px-5 py-4 text-[10px] text-theme-secondary leading-relaxed">
              <p className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
                {["About","Press","Copyright","Contact us","Creators","Advertise","Developers"].map(l => (
                  <span key={l} className="hover:text-theme-primary cursor-pointer">{l}</span>
                ))}
              </p>
              <p className="flex flex-wrap gap-x-2 gap-y-1 mb-3">
                {["Terms","Privacy","Policy & Safety","How VideoHub works","Test new features"].map(l => (
                  <span key={l} className="hover:text-theme-primary cursor-pointer">{l}</span>
                ))}
              </p>
              <p>© 2026 VideoHub LLC</p>
            </div>

          </div>
        </>,
        document.body
      )}

      {/* ── Category Pills ── */}
      <div className="sticky top-[52px] z-10 bg-theme-primary border-b border-theme px-2 py-2 flex items-center gap-1">
        <button onClick={() => scrollCat(-1)} className="flex-shrink-0 w-7 h-7 rounded-full bg-theme-secondary flex items-center justify-center hover:bg-theme-hover transition-colors">
          <FaChevronLeft size={10} />
        </button>
        <div ref={catRef} className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-semibold transition-all flex-shrink-0 ${cat === c ? "bg-theme-primary text-theme-primary scale-105" : "bg-theme-secondary text-theme-secondary hover:bg-theme-hover"}`}
              style={cat === c ? { backgroundColor:"var(--color-text-primary)", color:"var(--color-bg-primary)" } : {}}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => scrollCat(1)} className="flex-shrink-0 w-7 h-7 rounded-full bg-theme-secondary flex items-center justify-center hover:bg-theme-hover transition-colors">
          <FaChevronRight size={10} />
        </button>
      </div>

      {/* ── Search Banner ── */}
      {query && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-theme bg-purple-500/5">
          <FaSearch className="text-purple-400" size={13} />
          <p className="text-sm text-theme-secondary">Results for <span className="font-bold text-theme-primary">"{query}"</span></p>
          <button onClick={() => { setQuery(""); setSearch(""); }} className="ml-auto text-xs text-purple-400 hover:underline">Clear</button>
        </div>
      )}

      <div className="px-4 py-5 pb-24 md:pb-6 space-y-8">

        {/* ── Shorts Row (only on All tab) ── */}
        {cat === "All" && !query && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
                <FaPlay className="text-white text-[8px] ml-0.5" />
              </div>
              <h2 className="font-bold text-base">Shorts</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {SHORTS.map(s => (
                <div key={s.id} className="flex-shrink-0 w-28 cursor-pointer group" onClick={() => setSelected(VIDEOS[0])}>
                  <div className="relative w-28 h-48 rounded-2xl overflow-hidden bg-theme-secondary">
                    <img src={s.thumb} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-[11px] font-medium line-clamp-2 leading-tight">{s.title}</p>
                      <p className="text-white/70 text-[10px] mt-0.5">{s.views} views</p>
                    </div>
                    <div className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaPlay className="text-white text-[8px] ml-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Featured Banner (only on All tab) ── */}
        {cat === "All" && !query && (
          <section className="relative rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setSelected(VIDEOS[4])}>
            <img src={VIDEOS[4].thumb} alt={VIDEOS[4].title} className="w-full h-44 md:h-56 object-cover group-hover:scale-[1.02] transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-end p-5">
              <div className="max-w-md">
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold mb-2 inline-block">🔥 TRENDING</span>
                <h3 className="text-white font-bold text-lg leading-snug mb-1">{VIDEOS[4].title}</h3>
                <p className="text-white/70 text-sm">{VIDEOS[4].channel} • {VIDEOS[4].views} views</p>
                <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-white/90 transition-colors">
                  <FaPlay size={10} /> Watch Now
                </button>
              </div>
            </div>
            <span className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-medium">{VIDEOS[4].dur}</span>
          </section>
        )}

        {/* ── Video Grid ── */}
        <section>
          {cat === "All" && !query && (
            <div className="flex items-center gap-2 mb-4">
              <FaFire className="text-orange-400" />
              <h2 className="font-bold text-base">Recommended for you</h2>
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-theme-secondary">
              <FaSearch className="text-5xl mb-4 opacity-20" />
              <p className="font-medium">No videos found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
              {filtered.map(v => (
                <VideoCard key={v.id} video={v} onClick={() => setSelected(v)}
                  wl={watchLater[v.id]} onWL={() => setWatchLater(p => ({ ...p, [v.id]: !p[v.id] }))} />
              ))}
            </div>
          )}
        </section>

        {/* ── Trending Section ── */}
        {cat === "All" && !query && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FaEye className="text-blue-400" />
              <h2 className="font-bold text-base">Trending Now</h2>
            </div>
            <div className="space-y-3">
              {VIDEOS.slice(0,5).map((v, i) => (
                <div key={v.id} onClick={() => setSelected(v)} className="flex gap-3 cursor-pointer group p-2 rounded-xl hover:bg-theme-secondary transition-colors">
                  <span className="text-2xl font-black text-theme-secondary w-8 flex-shrink-0 flex items-center justify-center">{i+1}</span>
                  <div className="relative w-36 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-theme-secondary">
                    <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded font-medium">{v.dur}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-2 leading-snug mb-1">{v.title}</p>
                    <p className="text-xs text-theme-secondary">{v.channel}</p>
                    <p className="text-xs text-theme-secondary">{v.views} views • {v.age}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Video Card ──────────────────────────────────────────────
function VideoCard({ video: v, onClick, wl, onWL }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-theme-secondary rounded-xl overflow-hidden mb-3">
        <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[11px] px-1.5 py-0.5 rounded font-semibold">{v.dur}</span>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
            <FaPlay className="text-white text-sm ml-0.5" />
          </div>
        </div>
        {/* Watch Later hover btn */}
        <button onClick={e => { e.stopPropagation(); onWL(); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wl ? "bg-purple-600 opacity-100" : "bg-black/70 opacity-0 group-hover:opacity-100"}`}>
          {wl ? <FaCheck className="text-white text-xs" /> : <MdOutlineWatchLater className="text-white text-sm" />}
        </button>
      </div>
      {/* Info */}
      <div className="flex gap-2.5">
        <img src={v.avatar} alt={v.channel} className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm line-clamp-2 leading-snug mb-1">{v.title}</p>
          <p className="text-xs text-theme-secondary flex items-center gap-0.5">
            {v.channel}{v.verified && <Badge />}
          </p>
          <p className="text-xs text-theme-secondary">{v.views} views • {v.age}</p>
        </div>
        {/* 3-dot */}
        <div className="relative flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); setMenu(m => !m); }}
            className="w-7 h-7 rounded-full hover:bg-theme-hover flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaEllipsisV size={11} className="text-theme-secondary" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setMenu(false); }} />
              <div className="absolute right-0 top-8 z-20 w-52 bg-theme-card border border-theme rounded-2xl shadow-2xl overflow-hidden py-1">
                {[
                  { icon: MdOutlineWatchLater, label: wl ? "Remove from Watch Later" : "Save to Watch Later" },
                  { icon: FaListUl,            label: "Save to playlist" },
                  { icon: FaDownload,          label: "Download" },
                  { icon: FaShare,             label: "Share" },
                  { icon: FaTimes,             label: "Not interested" },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={e => { e.stopPropagation(); setMenu(false); if (item.label.includes("Watch Later")) onWL(); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-theme-hover text-sm text-theme-primary transition-colors">
                      <Icon size={15} className="text-theme-secondary flex-shrink-0" />{item.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Video Player ────────────────────────────────────────────
function VideoPlayer({ video: v, related, onBack, liked, setLiked, saved, setSaved, subbed, setSubbed, watchLater, setWatchLater, onSelect }) {
  const [showDesc, setShowDesc] = useState(false);
  const [comment, setComment]   = useState("");
  const [activeTab, setActiveTab] = useState("comments"); // comments | related
  const [comments, setComments] = useState([
    { id:1, user:"Alex M.",  avatar:"https://i.pravatar.cc/32?img=20", text:"This is absolutely amazing! 🔥 Keep it up!", likes:234, time:"2 days ago", liked:false },
    { id:2, user:"Priya S.", avatar:"https://i.pravatar.cc/32?img=21", text:"I've been looking for this explanation for so long. Thank you so much!", likes:89, time:"1 day ago", liked:false },
    { id:3, user:"John D.",  avatar:"https://i.pravatar.cc/32?img=22", text:"Could you make a follow-up video on advanced topics?", likes:45, time:"5 hours ago", liked:false },
    { id:4, user:"Meera K.", avatar:"https://i.pravatar.cc/32?img=23", text:"Best explanation I've seen on this topic 👏", likes:112, time:"3 days ago", liked:false },
  ]);

  const isLiked = liked[v.id];
  const isSaved = saved[v.id];
  const isSubbed = subbed[v.channel];
  const isWL = watchLater[v.id];

  const addComment = () => {
    if (!comment.trim()) return;
    setComments(c => [{ id: Date.now(), user:"You", avatar:"https://i.pravatar.cc/32?img=30", text:comment, likes:0, time:"Just now", liked:false }, ...c]);
    setComment("");
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-6">
      {/* Mini topbar */}
      <div className="sticky top-0 z-20 bg-theme-primary/95 backdrop-blur border-b border-theme flex items-center gap-2 px-3 py-2 h-13">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
            <FaPlay className="text-white text-xs ml-0.5" />
          </div>
          <span className="font-bold hidden sm:block tracking-tight">VideoHub</span>
        </div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-theme-secondary hover:text-theme-primary transition-colors ml-2 px-3 py-1.5 rounded-full hover:bg-theme-hover">
          <FaChevronLeft size={11} /> Back
        </button>
        <div className="flex-1 max-w-lg mx-auto hidden md:flex items-center bg-theme-secondary border border-theme rounded-full overflow-hidden focus-within:border-purple-500 transition-colors">
          <input placeholder="Search videos..." className="flex-1 px-4 py-2 bg-transparent text-sm outline-none" />
          <button className="px-4 py-2 bg-theme-hover border-l border-theme text-theme-secondary hover:text-purple-400 transition-colors"><FaSearch size={13} /></button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto px-4 py-4 gap-6">
        {/* ── Left ── */}
        <div className="flex-1 min-w-0">
          {/* Player */}
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-2xl ring-1 ring-white/5">
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
              className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={v.title} />
          </div>

          {/* Title */}
          <h1 className="font-bold text-lg leading-snug mb-3">{v.title}</h1>

          {/* Channel row */}
          <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-theme">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <img src={v.avatar} alt={v.channel} className="w-10 h-10 rounded-full ring-2 ring-purple-500/30 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-sm flex items-center gap-1">{v.channel}{v.verified && <Badge />}</p>
                <p className="text-xs text-theme-secondary">{v.subs} subscribers</p>
              </div>
              <button onClick={() => setSubbed(p => ({ ...p, [v.channel]: !p[v.channel] }))}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0 ${isSubbed ? "bg-theme-secondary text-theme-secondary" : "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"}`}>
                {isSubbed ? "✓ Subscribed" : "Subscribe"}
              </button>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-theme-secondary rounded-full overflow-hidden ring-1 ring-theme">
                <button onClick={() => setLiked(p => ({ ...p, [v.id]: !p[v.id] }))}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold hover:bg-theme-hover transition-colors border-r border-theme ${isLiked ? "text-purple-400" : ""}`}>
                  <FaThumbsUp size={13} /> {isLiked ? v.likes : v.likes}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold hover:bg-theme-hover transition-colors">
                  <FaThumbsDown size={13} />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-theme-secondary rounded-full text-sm font-semibold hover:bg-theme-hover transition-colors ring-1 ring-theme">
                <FaShare size={12} /> Share
              </button>
              <button onClick={() => setWatchLater(p => ({ ...p, [v.id]: !p[v.id] }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ring-1 ring-theme ${isWL ? "bg-purple-600 text-white" : "bg-theme-secondary hover:bg-theme-hover"}`}>
                {isWL ? <FaCheck size={12} /> : <FaClock size={12} />} {isWL ? "Saved" : "Watch Later"}
              </button>
              <button onClick={() => setSaved(p => ({ ...p, [v.id]: !p[v.id] }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ring-1 ring-theme ${isSaved ? "bg-theme-secondary text-purple-400" : "bg-theme-secondary hover:bg-theme-hover"}`}>
                {isSaved ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />} Save
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-theme-secondary rounded-2xl p-4 mb-5 cursor-pointer hover:bg-theme-hover transition-colors" onClick={() => setShowDesc(s => !s)}>
            <div className="flex items-center gap-3 mb-1.5 text-sm">
              <span className="font-bold">{v.views} views</span>
              <span className="text-theme-secondary">{v.age}</span>
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full font-medium">{v.cat}</span>
            </div>
            <p className={`text-sm text-theme-secondary leading-relaxed ${showDesc ? "" : "line-clamp-2"}`}>
              Welcome to this video about <strong>{v.title}</strong>. In this video, we cover everything you need to know from beginner to advanced level. Don't forget to like, share and subscribe for more amazing content! Links and resources are in the description below. 🔔 Hit the bell icon to never miss an update!
            </p>
            <button className="text-sm font-bold mt-1.5 text-theme-primary">{showDesc ? "Show less ▲" : "...more ▼"}</button>
          </div>

          {/* Mobile tabs */}
          <div className="flex lg:hidden gap-1 bg-theme-secondary rounded-xl p-1 mb-4">
            {["comments","related"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${activeTab === t ? "bg-purple-600 text-white" : "text-theme-secondary"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Comments */}
          <div className={activeTab === "comments" ? "block" : "hidden lg:block"}>
            <h3 className="font-bold text-base mb-4">{comments.length + 1}K Comments</h3>
            <div className="flex gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">U</div>
              <div className="flex-1">
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()}
                  placeholder="Add a comment..."
                  className="w-full bg-transparent border-b-2 border-theme pb-2 text-sm outline-none focus:border-purple-500 transition-colors" />
                {comment && (
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setComment("")} className="px-4 py-1.5 rounded-full text-sm hover:bg-theme-hover transition-colors">Cancel</button>
                    <button onClick={addComment} className="px-4 py-1.5 rounded-full text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors">Comment</button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-5">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <img src={c.avatar} alt={c.user} className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">{c.user}</span>
                      <span className="text-xs text-theme-secondary">{c.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{c.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button className="flex items-center gap-1.5 text-xs text-theme-secondary hover:text-purple-400 transition-colors font-medium">
                        <FaRegThumbsUp size={12} /> {c.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-theme-secondary hover:text-theme-primary transition-colors">
                        <FaThumbsDown size={11} />
                      </button>
                      <button className="text-xs text-theme-secondary hover:text-theme-primary font-bold transition-colors">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Related ── */}
        <aside className={`w-full lg:w-80 flex-shrink-0 ${activeTab === "related" ? "block" : "hidden lg:block"}`}>
          <p className="font-bold mb-3 hidden lg:block">Up next</p>
          <div className="space-y-3">
            {related.slice(0, 12).map(r => (
              <div key={r.id} onClick={() => onSelect(r)} className="flex gap-2.5 cursor-pointer group p-1.5 rounded-xl hover:bg-theme-secondary transition-colors">
                <div className="relative w-40 aspect-video bg-theme-secondary rounded-xl overflow-hidden flex-shrink-0">
                  <img src={r.thumb} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] px-1 py-0.5 rounded font-semibold">{r.dur}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold line-clamp-2 leading-snug mb-1">{r.title}</p>
                  <p className="text-xs text-theme-secondary flex items-center gap-0.5">{r.channel}{r.verified && <Badge />}</p>
                  <p className="text-xs text-theme-secondary">{r.views} • {r.age}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
