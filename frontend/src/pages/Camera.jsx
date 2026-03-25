import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiX, HiMusicNote, HiPhotograph,
  HiOutlineSwitchHorizontal, HiCog, HiChevronDown,
} from "react-icons/hi";
import { createStory, createPost, createReel } from "../services/api";
import { useContent } from "../Context/ContentContext";
import MusicBox from "../components/MusicBox";
import CameraEffects, { EFFECTS } from "../components/CameraEffects";

const FILTERS = [
  { name: "Normal",    css: "none" },
  { name: "Clarendon", css: "brightness(1.2) contrast(1.2) saturate(1.35)" },
  { name: "Gingham",   css: "sepia(0.2) brightness(1.1) contrast(0.9)" },
  { name: "Moon",      css: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { name: "Lark",      css: "brightness(1.1) contrast(0.9) hue-rotate(10deg) saturate(1.1)" },
  { name: "Reyes",     css: "sepia(0.4) brightness(1.1) contrast(0.85) saturate(0.75)" },
  { name: "Juno",      css: "saturate(1.4) contrast(1.1) brightness(1.05)" },
  { name: "Slumber",   css: "saturate(0.66) brightness(1.05) sepia(0.3)" },
  { name: "Crema",     css: "sepia(0.15) contrast(0.9) brightness(1.1) saturate(0.85)" },
  { name: "Ludwig",    css: "brightness(1.05) contrast(1.05) saturate(1.1)" },
];

const MODES = ["POST", "STORY", "REELS", "LIVE"];

export default function Camera() {
  const navigate = useNavigate();
  const { prependPost, setStories, setReels } = useContent();

  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const effectsRef  = useRef(null);
  const fileRef     = useRef(null);
  const mediaRecRef = useRef(null);
  const chunksRef   = useRef([]);
  const streamRef   = useRef(null);

  const [mode,          setMode]          = useState("STORY");
  const [facingMode,    setFacingMode]    = useState("user");
  const [filterIdx,     setFilterIdx]     = useState(0);
  const [effectId,      setEffectId]      = useState("none");
  const [activePanel,   setActivePanel]   = useState(null);
  const [captured,      setCaptured]      = useState(null);
  const [recording,     setRecording]     = useState(false);
  const [recSeconds,    setRecSeconds]    = useState(0);
  const [showMenu,      setShowMenu]      = useState(false);
  const [showMusicBox,  setShowMusicBox]  = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [caption,       setCaption]       = useState("");
  const [uploading,     setUploading]     = useState(false);
  const [timer,         setTimer]         = useState(0);
  const [countdown,     setCountdown]     = useState(null);
  const [camError,      setCamError]      = useState(null);
  const [vidSize,       setVidSize]       = useState({ w: 640, h: 480 });

  const startCamera = useCallback(async () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    setCamError(null);

    // getUserMedia requires HTTPS or localhost
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamError("insecure");
      return;
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => {
          const v = videoRef.current;
          if (v) setVidSize({ w: v.videoWidth || 640, h: v.videoHeight || 480 });
        };
      }
    } catch (e) {
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setCamError("permission");
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        setCamError("notfound");
      } else if (e.name === "NotReadableError") {
        setCamError("inuse");
      } else {
        setCamError("insecure");
      }
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [startCamera]);

  useEffect(() => {
    if (!recording) { setRecSeconds(0); return; }
    const t = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const capturePhoto = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    ctx.filter = FILTERS[filterIdx].css;
    if (facingMode === "user") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0);
    ctx.filter = "none";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const ec = effectsRef.current?.canvas;
    if (ec && effectId !== "none") ctx.drawImage(ec, 0, 0, c.width, c.height);
    c.toBlob((blob) => {
      setCaptured({ url: URL.createObjectURL(blob), blob, type: "image" });
    }, "image/jpeg", 0.92);
  };

  const handleShutter = () => {
    if (mode === "REELS" || mode === "LIVE") { toggleRecord(); return; }
    if (timer === 0) { capturePhoto(); return; }
    let t = timer;
    setCountdown(t);
    const iv = setInterval(() => {
      t--;
      if (t <= 0) { clearInterval(iv); setCountdown(null); capturePhoto(); }
      else setCountdown(t);
    }, 1000);
  };

  const toggleRecord = () => {
    if (recording) {
      mediaRecRef.current?.stop();
      setRecording(false);
    } else {
      if (!streamRef.current) return;
      chunksRef.current = [];
      const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setCaptured({ url: URL.createObjectURL(blob), blob, type: "video" });
      };
      mr.start();
      mediaRecRef.current = mr;
      setRecording(true);
    }
  };

  const handleGallery = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = file.type.startsWith("video") ? "video" : "image";
    setCaptured({ url: URL.createObjectURL(file), blob: file, type });
    e.target.value = "";
  };

  const handleShare = async () => {
    if (!captured) return;
    setUploading(true);
    try {
      const fd = new FormData();
      if (mode === "STORY") {
        fd.append("media", captured.blob, captured.type === "video" ? "story.webm" : "story.jpg");
        const res = await createStory(fd);
        setStories((p) => [res.data, ...p]);
      } else if (mode === "POST") {
        fd.append("media", captured.blob, captured.type === "video" ? "post.webm" : "post.jpg");
        fd.append("caption", caption);
        const res = await createPost(fd);
        prependPost(Array.isArray(res.data) ? res.data[0] : res.data);
      } else if (mode === "REELS") {
        fd.append("video", captured.blob, "reel.webm");
        fd.append("caption", caption);
        const res = await createReel(fd);
        setReels((p) => [res.data, ...p]);
      }
      navigate(-1);
    } catch (e) {
      alert(e?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isVideo = mode === "REELS" || mode === "LIVE";
  const filterStyle = {
    filter: FILTERS[filterIdx].css,
    ...(facingMode === "user" ? { transform: "scaleX(-1)" } : {}),
  };

  /* ── PREVIEW ── */
  if (captured) {
    return (
      <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
        {captured.type === "video"
          ? <video src={captured.url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: FILTERS[filterIdx].css }} />
          : <img src={captured.url} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: FILTERS[filterIdx].css }} />
        }
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-10 z-10">
          <button onClick={() => setCaptured(null)} className="bg-black/40 rounded-full p-2 text-white">
            <HiX size={20} />
          </button>
          <button onClick={() => setShowMusicBox(true)} className="bg-black/40 rounded-full p-2 text-white">
            <HiMusicNote size={18} />
          </button>
        </div>
        {selectedMusic && (
          <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 z-10">
            <HiMusicNote size={12} /> {selectedMusic.title}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm px-4 pb-10 pt-3">
          {(mode === "POST" || mode === "REELS") && (
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/40 mb-3 border-b border-white/20 pb-2"
            />
          )}
          <button
            onClick={handleShare}
            disabled={uploading}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold rounded-2xl text-base disabled:opacity-50"
          >
            {uploading ? "Sharing..." : `Share to ${mode.charAt(0) + mode.slice(1).toLowerCase()}`}
          </button>
        </div>
        {showMusicBox && (
          <MusicBox
            onClose={() => setShowMusicBox(false)}
            onSelect={(m) => { setSelectedMusic(m); setShowMusicBox(false); }}
          />
        )}
      </div>
    );
  }

  /* ── CAMERA ── */
  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 9999, width: "100vw", height: "100dvh", overflow: "hidden" }}>
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleGallery} />

      {/* Camera feed */}
      {camError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gray-950 px-8 text-center">
          <span className="text-5xl">
            {camError === "permission" ? "🔒" : camError === "notfound" ? "📷" : camError === "inuse" ? "⚠️" : "🔐"}
          </span>
          <div>
            <p className="text-white font-semibold text-base mb-1">
              {camError === "permission" && "Camera permission denied"}
              {camError === "notfound"   && "No camera found"}
              {camError === "inuse"      && "Camera is in use"}
              {camError === "insecure"   && "Camera requires HTTPS"}
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              {camError === "permission" && "Go to your browser settings and allow camera access for this site, then try again."}
              {camError === "notfound"   && "No camera device was detected on this device."}
              {camError === "inuse"      && "Your camera is being used by another app. Close it and try again."}
              {camError === "insecure"   && "Camera only works on localhost or a secure HTTPS connection. Open the app via https:// or use localhost."}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={startCamera}
              className="w-full bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm"
            >
              Try again
            </button>
            <button
              onClick={() => fileRef.current.click()}
              className="w-full border border-white/30 text-white px-6 py-2.5 rounded-full font-semibold text-sm"
            >
              Pick from gallery instead
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={filterStyle}
        />
      )}

      {/* Grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
        {[...Array(9)].map((_, i) => <div key={i} className="border border-white/10" />)}
      </div>

      {/* AR Effects */}
      {!camError && (
        <CameraEffects ref={effectsRef} videoRef={videoRef} effectId={effectId} width={vidSize.w} height={vidSize.h} />
      )}

      {/* Countdown */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <span className="text-white text-9xl font-bold drop-shadow-lg">{countdown}</span>
        </div>
      )}

      {/* Recording badge */}
      {recording && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full z-20">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-sm font-mono">
            {String(Math.floor(recSeconds / 60)).padStart(2, "0")}:{String(recSeconds % 60).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-10 pb-3 z-20">
        <button onClick={() => navigate(-1)} className="text-white drop-shadow-lg">
          <HiX size={26} />
        </button>
        <button onClick={() => setShowMenu((s) => !s)} className="text-white drop-shadow-lg">
          <HiCog size={24} />
        </button>
      </div>

      {/* Side menu */}
      {showMenu && (
        <div className="absolute left-4 top-24 bg-black/80 rounded-2xl p-3 flex flex-col gap-3 z-30 min-w-[160px]">
          {[
            { label: "Timer", icon: "⏱", action: () => setTimer((t) => t === 0 ? 3 : t === 3 ? 10 : 0), extra: timer > 0 ? ` ${timer}s` : "" },
            { label: "Music", icon: "♪", action: () => { setShowMenu(false); setShowMusicBox(true); } },
            { label: "Flip",  icon: "↔", action: () => setFacingMode((f) => f === "user" ? "environment" : "user") },
          ].map(({ label, icon, action, extra = "" }) => (
            <button key={label} onClick={action} className="flex items-center gap-3 text-white py-1">
              <span className="text-lg w-6 text-center">{icon}</span>
              <span className="text-sm">{label}{extra}</span>
            </button>
          ))}
          <button onClick={() => setShowMenu(false)} className="flex items-center gap-2 text-white/50 text-xs pt-1">
            <HiChevronDown size={14} /> Close
          </button>
        </div>
      )}

      {/* Right tools */}
      <div className="absolute right-4 top-1/3 flex flex-col gap-4 z-20">
        <button onClick={() => setFacingMode((f) => f === "user" ? "environment" : "user")} className="bg-black/50 rounded-full p-2.5 text-white">
          <HiOutlineSwitchHorizontal size={18} />
        </button>
        <button onClick={() => setShowMusicBox(true)} className={`bg-black/50 rounded-full p-2.5 ${selectedMusic ? "text-green-400" : "text-white"}`}>
          <HiMusicNote size={18} />
        </button>
        <button onClick={() => setActivePanel((p) => p === "effects" ? null : "effects")} className={`bg-black/50 rounded-full p-2.5 text-xs font-bold ${effectId !== "none" ? "text-yellow-400" : "text-white"}`}>
          AR
        </button>
        <button onClick={() => setActivePanel((p) => p === "filters" ? null : "filters")} className={`bg-black/50 rounded-full p-2.5 text-xs font-bold ${filterIdx !== 0 ? "text-blue-400" : "text-white"}`}>
          FX
        </button>
      </div>

      {/* Music badge */}
      {selectedMusic && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-1.5 rounded-full flex items-center gap-2 z-20">
          <HiMusicNote size={11} /> {selectedMusic.title}
        </div>
      )}

      {/* Effects panel */}
      {activePanel === "effects" && (
        <div className="absolute bottom-36 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm py-3">
          <p className="text-white/50 text-[10px] text-center uppercase tracking-widest mb-2">Effects</p>
          <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide pb-1">
            {EFFECTS.map((ef) => (
              <button key={ef.id} onClick={() => setEffectId(ef.id)} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl bg-white/10 ${effectId === ef.id ? "border-yellow-400 scale-105" : "border-white/20"} transition-transform`}>
                  {ef.icon}
                </div>
                <span className={`text-[10px] ${effectId === ef.id ? "text-yellow-400" : "text-white/60"}`}>{ef.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters panel */}
      {activePanel === "filters" && (
        <div className="absolute bottom-36 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm py-3">
          <p className="text-white/50 text-[10px] text-center uppercase tracking-widest mb-2">Filters</p>
          <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide pb-1">
            {FILTERS.map((f, i) => (
              <button key={f.name} onClick={() => setFilterIdx(i)} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${filterIdx === i ? "border-white scale-105" : "border-white/20"} transition-transform`}>
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300" style={{ filter: f.css }} />
                </div>
                <span className={`text-[10px] ${filterIdx === i ? "text-white" : "text-white/60"}`}>{f.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-10 pt-3">
        <div className="flex justify-center gap-6 mb-5">
          {MODES.map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`text-sm font-semibold tracking-wide drop-shadow transition-all ${mode === m ? "text-white border-b-2 border-white pb-0.5" : "text-white/60"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => fileRef.current.click()} className="w-12 h-12 rounded-xl border-2 border-white/40 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <HiPhotograph size={22} className="text-white" />
          </button>
          <button onClick={handleShutter} className="relative w-20 h-20 flex items-center justify-center active:scale-95 transition-transform">
            <div className={`absolute inset-0 rounded-full border-4 ${recording ? "border-red-500" : "border-white"}`} />
            <div className={`rounded-full transition-all duration-200 ${
              recording ? "w-8 h-8 bg-red-500 rounded-lg"
              : isVideo  ? "w-14 h-14 bg-red-500"
              : "w-14 h-14 bg-white"
            }`} />
            {timer > 0 && !isVideo && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {timer}
              </span>
            )}
          </button>
          <button onClick={() => setFacingMode((f) => f === "user" ? "environment" : "user")} className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
            <HiOutlineSwitchHorizontal size={20} className="text-white" />
          </button>
        </div>
      </div>

      {showMusicBox && (
        <MusicBox
          onClose={() => setShowMusicBox(false)}
          onSelect={(m) => { setSelectedMusic(m); setShowMusicBox(false); }}
        />
      )}
    </div>
  );
}
