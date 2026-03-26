import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../Context/ContentContext";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import { viewStory as markViewed, createStory, getStoryViewers, reactToStory, commentOnStory } from "../services/api";
import { HiPlus, HiX, HiChevronLeft, HiChevronRight, HiEye, HiPaperAirplane } from "react-icons/hi";

const EMOJIS = ["❤️", "🔥", "😂", "😮", "😢", "👏", "😍", "🎉"];

function timeAgo(story) {
  const diff = Date.now() - new Date(story.createdAt).getTime();
  if (diff < 60000) return "just now";
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}

export default function Status() {
  const { stories, setStories } = useContent();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [activeStory,   setActiveStory]   = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [progress,      setProgress]      = useState(0);
  const [, setTick] = useState(0);
  const [liveStreams,   setLiveStreams]   = useState([]);

  // Viewers panel state
  const [showViewers,  setShowViewers]  = useState(false);
  const [viewersData,  setViewersData]  = useState({ viewers: [], reactions: [], comments: [] });
  const [loadingViewers, setLoadingViewers] = useState(false);

  // Comment + emoji state
  const [commentText,  setCommentText]  = useState("");
  const [showEmojis,   setShowEmojis]   = useState(false);
  const [sending,      setSending]      = useState(false);
  const [myReaction,   setMyReaction]   = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    const onStart = (data) => setLiveStreams(p => [...p.filter(l => l.hostId !== data.hostId), data]);
    const onEnd   = (data) => setLiveStreams(p => p.filter(l => l.hostId !== data?.hostId));
    socket.on("liveStarted", onStart);
    socket.on("liveEnded",   onEnd);
    return () => { socket.off("liveStarted", onStart); socket.off("liveEnded", onEnd); };
  }, [user?._id]);

  // Auto-advance progress bar
  useEffect(() => {
    if (!activeStory) return;
    setProgress(0);
    setMyReaction(null);
    setShowEmojis(false);
    setCommentText("");
    const duration = activeStory.mediaType === "video" ? 15000 : 5000;
    const step = 100 / (duration / 100);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(t); return 100; }
        return p + step;
      });
    }, 100);
    const auto = setTimeout(() => closeStory(), duration);
    return () => { clearInterval(t); clearTimeout(auto); };
  }, [activeStory?._id]);

  const liveStories = stories.filter(s => new Date(s.expiresAt).getTime() > Date.now());

  const grouped = liveStories.reduce((acc, s) => {
    const uid = s.user?._id || s.user;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(s);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped);

  const openStory = async (story) => {
    setActiveStory(story);
    try { await markViewed(story._id); } catch (_) {}
  };

  const closeStory = () => { setActiveStory(null); setProgress(0); setShowViewers(false); };

  const nextStory = () => {
    if (!activeStory) return;
    const uid = activeStory.user?._id || activeStory.user;
    const group = grouped[uid] || [];
    const idx = group.findIndex(s => s._id === activeStory._id);
    if (idx < group.length - 1) setActiveStory(group[idx + 1]);
    else closeStory();
  };

  const prevStory = () => {
    if (!activeStory) return;
    const uid = activeStory.user?._id || activeStory.user;
    const group = grouped[uid] || [];
    const idx = group.findIndex(s => s._id === activeStory._id);
    if (idx > 0) setActiveStory(group[idx - 1]);
  };

  const isMyStory = activeStory && (activeStory.user?._id || activeStory.user) === user?._id;

  const loadViewers = useCallback(async () => {
    if (!activeStory || !isMyStory) return;
    setLoadingViewers(true);
    try {
      const res = await getStoryViewers(activeStory._id);
      setViewersData(res.data);
    } catch (_) {}
    finally { setLoadingViewers(false); }
  }, [activeStory?._id, isMyStory]);

  const handleShowViewers = () => {
    setShowViewers(true);
    loadViewers();
  };

  const handleReact = async (emoji) => {
    setMyReaction(emoji);
    setShowEmojis(false);
    try { await reactToStory(activeStory._id, emoji); } catch (_) {}
  };

  const handleComment = async (e) => {
    e?.preventDefault();
    if (!commentText.trim() || sending) return;
    setSending(true);
    try {
      await commentOnStory(activeStory._id, commentText);
      setCommentText("");
    } catch (_) {}
    finally { setSending(false); }
  };

  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadPreview({ url: URL.createObjectURL(file), file, type: file.type.startsWith("video") ? "video" : "image" });
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!uploadPreview) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("media", uploadPreview.file);
      const res = await createStory(fd);
      setStories(prev => [res.data, ...prev]);
      setUploadPreview(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const myStories  = liveStories.filter(s => (s.user?._id || s.user) === user?._id);
  const hasMyStory = myStories.length > 0;

  return (
    <>
      {/* Story bar */}
      <div className="w-full px-4 sm:px-6 py-3">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 sm:gap-5 w-max">

            {/* My story */}
            {user && (
              <div className="flex flex-col items-center flex-shrink-0 cursor-pointer">
                <div className="relative" onClick={() => hasMyStory ? openStory(myStories[0]) : fileRef.current.click()}>
                  <div className={`p-0.5 rounded-full ${hasMyStory ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" : "bg-gray-200"}`}>
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} alt="Your story" className="w-14 h-14 rounded-full object-cover border-2 border-white" loading="lazy" />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }} className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-600 transition">
                    <HiPlus size={11} className="text-white" />
                  </button>
                </div>
                <span className="text-xs text-gray-600 mt-1">{hasMyStory ? "Your story" : "Add story"}</span>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleFilePick} />

            {/* Live streams */}
            {liveStreams.map(live => (
              <div key={live.hostId} className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={() => navigate("/live", { state: { mode: "viewer", hostId: live.hostId, hostName: live.hostName, hostAvatar: live.hostAvatar } })}>
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-red-500 via-pink-500 to-orange-400 animate-pulse">
                  <div className="relative">
                    <img src={live.hostAvatar || `https://ui-avatars.com/api/?name=${live.hostName}`} alt={live.hostName} className="w-14 h-14 rounded-full object-cover border-2 border-white" loading="lazy" />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">LIVE</span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 max-w-[70px] truncate mt-2">{live.hostName}</span>
              </div>
            ))}

            {/* Others' stories */}
            {groupKeys.filter(uid => uid !== user?._id).map(uid => {
              const group = grouped[uid];
              const first = group[0];
              const allViewed = group.every(s => s.viewers?.includes(user?._id));
              return (
                <div key={uid} className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={() => openStory(first)}>
                  <div className={`p-0.5 rounded-full ${allViewed ? "bg-gray-200" : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"}`}>
                    <img src={first.user?.avatar || `https://ui-avatars.com/api/?name=${first.user?.username}`} alt={first.user?.username} className="w-14 h-14 rounded-full object-cover border-2 border-white" loading="lazy" />
                  </div>
                  <span className="text-xs text-gray-600 max-w-[70px] truncate mt-1">{first.user?.username}</span>
                  <span className="text-[10px] text-gray-400">{timeAgo(first)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload preview */}
      {uploadPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="relative bg-black rounded-2xl overflow-hidden w-[340px] max-h-[90vh] flex flex-col">
            <button onClick={() => setUploadPreview(null)} className="absolute top-3 right-3 z-10 bg-black/50 rounded-full p-1.5 text-white"><HiX size={18} /></button>
            <div className="flex-1 flex items-center justify-center bg-black min-h-[400px]">
              {uploadPreview.type === "video"
                ? <video src={uploadPreview.url} autoPlay loop muted className="max-h-[70vh] w-full object-contain" />
                : <img src={uploadPreview.url} className="max-h-[70vh] w-full object-contain" alt="preview" />
              }
            </div>
            <div className="p-4 bg-black">
              <button onClick={handleUpload} disabled={uploading} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 transition">
                {uploading ? "Uploading..." : "Share to story"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story viewer */}
      {activeStory && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={closeStory}>
          <div className="relative w-full max-w-sm h-full max-h-[100dvh] flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Progress bars */}
            {(() => {
              const uid = activeStory.user?._id || activeStory.user;
              const group = grouped[uid] || [activeStory];
              const curIdx = group.findIndex(s => s._id === activeStory._id);
              return (
                <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
                  {group.map((s, i) => (
                    <div key={s._id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-none" style={{ width: i < curIdx ? "100%" : i === curIdx ? `${progress}%` : "0%" }} />
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Header */}
            <div className="absolute top-7 left-3 right-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <img src={activeStory.user?.avatar || `https://ui-avatars.com/api/?name=${activeStory.user?.username}`} className="w-8 h-8 rounded-full object-cover border border-white/50" alt="" />
                <span className="text-white text-sm font-semibold drop-shadow">{activeStory.user?.username}</span>
                <span className="text-white/60 text-xs">{timeAgo(activeStory)}</span>
              </div>
              <button onClick={closeStory} className="text-white bg-black/30 rounded-full p-1"><HiX size={18} /></button>
            </div>

            {/* Media */}
            <div className="flex-1 flex items-center justify-center bg-black">
              {activeStory.mediaType === "video"
                ? <video src={activeStory.mediaUrl} autoPlay className="max-h-[85vh] max-w-sm rounded-xl object-contain" onClick={e => e.stopPropagation()} />
                : <img src={activeStory.mediaUrl} alt="story" className="max-h-[85vh] max-w-sm rounded-xl object-contain" />
              }
            </div>

            {/* My reaction shown */}
            {myReaction && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl animate-bounce pointer-events-none z-20">
                {myReaction}
              </div>
            )}

            {/* Tap zones */}
            <div className="absolute inset-0 flex" style={{ bottom: "80px" }}>
              <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
              <div className="w-2/3 h-full cursor-pointer" onClick={nextStory} />
            </div>

            {/* Nav arrows */}
            <button onClick={prevStory} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1 text-white z-10"><HiChevronLeft size={22} /></button>
            <button onClick={nextStory} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1 text-white z-10"><HiChevronRight size={22} /></button>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-4 pt-2 bg-gradient-to-t from-black/70 to-transparent">
              {isMyStory ? (
                /* Owner: show viewers button */
                <button onClick={handleShowViewers} className="flex items-center gap-2 text-white text-sm bg-white/20 rounded-full px-4 py-2 hover:bg-white/30 transition">
                  <HiEye size={18} />
                  <span>Viewers</span>
                </button>
              ) : (
                /* Viewer: comment + emoji */
                <div className="flex items-center gap-2">
                  {/* Emoji picker */}
                  <div className="relative">
                    <button onClick={() => setShowEmojis(s => !s)} className="text-2xl">
                      {myReaction || "😊"}
                    </button>
                    {showEmojis && (
                      <div className="absolute bottom-10 left-0 flex gap-2 bg-black/80 rounded-2xl px-3 py-2">
                        {EMOJIS.map(e => (
                          <button key={e} onClick={() => handleReact(e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Comment input */}
                  <form onSubmit={handleComment} className="flex-1 flex items-center gap-2 bg-white/20 rounded-full px-3 py-2">
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Send message..."
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/60"
                      onClick={e => e.stopPropagation()}
                    />
                    <button type="submit" disabled={!commentText.trim() || sending} className="text-white disabled:opacity-40">
                      <HiPaperAirplane size={18} className="rotate-90" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Viewers panel */}
      {showViewers && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end justify-center" onClick={() => setShowViewers(false)}>
          <div className="w-full max-w-sm bg-theme-card rounded-t-2xl max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-theme">
              <h3 className="font-semibold text-theme-primary">Viewers ({viewersData.viewers.length})</h3>
              <button onClick={() => setShowViewers(false)} className="text-theme-muted"><HiX size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              {loadingViewers ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : viewersData.viewers.length === 0 ? (
                <p className="text-center text-theme-muted py-8 text-sm">No viewers yet</p>
              ) : (
                viewersData.viewers.map(v => {
                  const reaction = viewersData.reactions.find(r => (r.user?._id || r.user) === v._id);
                  return (
                    <div key={v._id} className="flex items-center gap-3 px-4 py-3 border-b border-theme last:border-0">
                      <img src={v.avatar || `https://ui-avatars.com/api/?name=${v.username}`} className="w-10 h-10 rounded-full object-cover" alt="" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-theme-primary">{v.username}</p>
                        {v.name && <p className="text-xs text-theme-muted">{v.name}</p>}
                      </div>
                      {reaction && <span className="text-2xl">{reaction.emoji}</span>}
                    </div>
                  );
                })
              )}

              {/* Comments section */}
              {viewersData.comments.length > 0 && (
                <div className="px-4 py-3 border-t border-theme">
                  <p className="text-xs font-semibold text-theme-muted uppercase mb-2">Comments</p>
                  {viewersData.comments.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.username}`} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" loading="lazy" />
                      <div className="bg-theme-hover rounded-xl px-3 py-1.5">
                        <p className="text-xs font-semibold text-theme-primary">{c.user?.username}</p>
                        <p className="text-sm text-theme-secondary">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
