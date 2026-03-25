import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../Context/ContentContext";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import { viewStory as markViewed, createStory } from "../services/api";
import { HiPlus, HiX, HiChevronLeft, HiChevronRight } from "react-icons/hi";

function timeAgo(story) {
  const created = new Date(story.createdAt).getTime();
  const diff = Date.now() - created;
  if (diff < 60000) return "just now";
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
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
  // Live streams: [{ hostId, hostName, hostAvatar }]
  const [liveStreams, setLiveStreams] = useState([]);

  // Re-render every minute for timeAgo
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // Listen for live stream events
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    const onStart = (data) => setLiveStreams(p => [...p.filter(l => l.hostId !== data.hostId), data]);
    const onEnd   = (data) => setLiveStreams(p => p.filter(l => l.hostId !== data?.hostId));
    socket.on("liveStarted", onStart);
    socket.on("liveEnded",   onEnd);
    return () => { socket.off("liveStarted", onStart); socket.off("liveEnded", onEnd); };
  }, [user?._id]);

  // Auto-advance progress bar when viewing
  useEffect(() => {
    if (!activeStory) return;
    setProgress(0);
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
  }, [activeStory]);

  const liveStories = stories.filter(
    (s) => new Date(s.expiresAt).getTime() > Date.now()
  );

  // Group by user
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

  const closeStory = () => { setActiveStory(null); setProgress(0); };

  const nextStory = () => {
    if (!activeStory) return;
    const uid = activeStory.user?._id || activeStory.user;
    const group = grouped[uid] || [];
    const idx = group.findIndex((s) => s._id === activeStory._id);
    if (idx < group.length - 1) setActiveStory(group[idx + 1]);
    else closeStory();
  };

  const prevStory = () => {
    if (!activeStory) return;
    const uid = activeStory.user?._id || activeStory.user;
    const group = grouped[uid] || [];
    const idx = group.findIndex((s) => s._id === activeStory._id);
    if (idx > 0) setActiveStory(group[idx - 1]);
  };

  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video") ? "video" : "image";
    setUploadPreview({ url, file, type });
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!uploadPreview) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("media", uploadPreview.file);
      const res = await createStory(fd);
      setStories((prev) => [res.data, ...prev]);
      setUploadPreview(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const myStories = liveStories.filter((s) => (s.user?._id || s.user) === user?._id);
  const hasMyStory = myStories.length > 0;

  return (
    <>
      <div className="w-full px-4 sm:px-6 py-3">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 sm:gap-5 w-max">

            {/* My story */}
            {user && (
              <div className="flex flex-col items-center flex-shrink-0 cursor-pointer">
                <div
                  className="relative"
                  onClick={() => hasMyStory ? openStory(myStories[0]) : fileRef.current.click()}
                >
                  <div className={`p-0.5 rounded-full ${hasMyStory ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" : "bg-gray-200"}`}>
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
                      alt="Your story"
                      className="w-14 h-14 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-600 transition"
                  >
                    <HiPlus size={11} className="text-white" />
                  </button>
                </div>
                <span className="text-xs text-gray-600 mt-1">
                  {hasMyStory ? "Your story" : "Add story"}
                </span>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleFilePick} />

            {/* Live streams */}
            {liveStreams.map((live) => (
              <div
                key={live.hostId}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer"
                onClick={() => navigate("/live", { state: { mode: "viewer", hostId: live.hostId, hostName: live.hostName, hostAvatar: live.hostAvatar } })}
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-red-500 via-pink-500 to-orange-400 animate-pulse">
                  <div className="relative">
                    <img
                      src={live.hostAvatar || `https://ui-avatars.com/api/?name=${live.hostName}`}
                      alt={live.hostName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white"
                    />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      LIVE
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 max-w-[70px] truncate mt-2">{live.hostName}</span>
              </div>
            ))}

            {/* Other users' stories */}
            {groupKeys
              .filter((uid) => uid !== user?._id)
              .map((uid) => {
                const group = grouped[uid];
                const first = group[0];
                const allViewed = group.every((s) => s.viewers?.includes(user?._id));
                return (
                  <div
                    key={uid}
                    className="flex flex-col items-center flex-shrink-0 cursor-pointer"
                    onClick={() => openStory(first)}
                  >
                    <div className={`p-0.5 rounded-full ${allViewed ? "bg-gray-200" : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"}`}>
                      <img
                        src={first.user?.avatar || `https://ui-avatars.com/api/?name=${first.user?.username}`}
                        alt={first.user?.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white"
                      />
                    </div>
                    <span className="text-xs text-gray-600 max-w-[70px] truncate mt-1">
                      {first.user?.username}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {timeAgo(first)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      {uploadPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="relative bg-black rounded-2xl overflow-hidden w-[340px] max-h-[90vh] flex flex-col">
            <button
              onClick={() => setUploadPreview(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 rounded-full p-1.5 text-white"
            >
              <HiX size={18} />
            </button>
            <div className="flex-1 flex items-center justify-center bg-black min-h-[400px]">
              {uploadPreview.type === "video" ? (
                <video src={uploadPreview.url} autoPlay loop muted className="max-h-[70vh] w-full object-contain" />
              ) : (
                <img src={uploadPreview.url} className="max-h-[70vh] w-full object-contain" alt="preview" />
              )}
            </div>
            <div className="p-4 bg-black">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 transition"
              >
                {uploading ? "Uploading..." : "Share to story"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story viewer */}
      {activeStory && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={closeStory}>
          <div className="relative w-full max-w-sm h-full max-h-[100dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>

            {/* Progress bars */}
            {(() => {
              const uid = activeStory.user?._id || activeStory.user;
              const group = grouped[uid] || [activeStory];
              const curIdx = group.findIndex((s) => s._id === activeStory._id);
              return (
                <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
                  {group.map((s, i) => (
                    <div key={s._id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-none"
                        style={{ width: i < curIdx ? "100%" : i === curIdx ? `${progress}%` : "0%" }}
                      />
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Header */}
            <div className="absolute top-7 left-3 right-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <img
                  src={activeStory.user?.avatar || `https://ui-avatars.com/api/?name=${activeStory.user?.username}`}
                  className="w-8 h-8 rounded-full object-cover border border-white/50"
                  alt=""
                />
                <span className="text-white text-sm font-semibold drop-shadow">
                  {activeStory.user?.username}
                </span>
                <span className="text-white/60 text-xs">{timeAgo(activeStory)}</span>
              </div>
              <button onClick={closeStory} className="text-white bg-black/30 rounded-full p-1">
                <HiX size={18} />
              </button>
            </div>

            {/* Media */}
            <div className="flex-1 flex items-center justify-center bg-black">
              {activeStory.mediaType === "video" ? (
                <video src={activeStory.mediaUrl} autoPlay className="max-h-[85vh] max-w-sm rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
              ) : (
                <img src={activeStory.mediaUrl} alt="story" className="max-h-[85vh] max-w-sm rounded-xl object-contain" />
              )}
            </div>

            {/* Tap zones */}
            <div className="absolute inset-0 flex">
              <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
              <div className="w-2/3 h-full cursor-pointer" onClick={nextStory} />
            </div>

            {/* Nav arrows */}
            <button onClick={prevStory} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1 text-white z-10">
              <HiChevronLeft size={22} />
            </button>
            <button onClick={nextStory} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1 text-white z-10">
              <HiChevronRight size={22} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
