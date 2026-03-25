import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import { HiX, HiHeart, HiEye } from "react-icons/hi";

const LIVE_EMOJIS = ["❤️", "🔥", "😂", "😮", "👏", "🎉"];

// ── HOST VIEW ──────────────────────────────────────────────────
function LiveHost({ user, onEnd }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const peersRef   = useRef({}); // viewerId -> RTCPeerConnection
  const [viewers,  setViewers]  = useState(0);
  const [comments, setComments] = useState([]);
  const [muted,    setMuted]    = useState(false);
  const socket = getSocket(user._id);

  useEffect(() => {
    let stream;
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Notify followers
      const followers = (user.followers || []).map(f => f._id || f);
      socket.emit("startLive", { hostId: user._id, hostName: user.username, hostAvatar: user.avatar, followers });
    })();

    socket.on("viewerJoined", async ({ viewerId, viewerName, count }) => {
      setViewers(count);
      // Create peer for this viewer
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      peersRef.current[viewerId] = pc;

      streamRef.current?.getTracks().forEach(t => pc.addTrack(t, streamRef.current));

      pc.onicecandidate = e => {
        if (e.candidate) socket.emit("liveIce", { to: viewerId, candidate: e.candidate, isHost: true, hostId: user._id });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("liveAnswer", { viewerId, signal: offer });
    });

    socket.on("liveOffer", async ({ viewerId, signal }) => {
      const pc = peersRef.current[viewerId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("liveAnswer", { viewerId, signal: answer });
      }
    });

    socket.on("liveIce", ({ candidate, from }) => {
      const pc = peersRef.current[from];
      if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });

    socket.on("viewerLeft", ({ count }) => setViewers(count));
    socket.on("liveComment", ({ viewerName, text }) => {
      setComments(p => [...p.slice(-49), { viewerName, text, id: Date.now() }]);
    });
    socket.on("liveLike",  () => {});
    socket.on("liveEmoji", ({ emoji, viewerName }) => {
      setComments(p => [...p.slice(-49), { viewerName, text: emoji, id: Date.now() }]);
    });

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      Object.values(peersRef.current).forEach(pc => pc.close());
      socket.off("viewerJoined"); socket.off("liveOffer");
      socket.off("liveIce"); socket.off("viewerLeft"); socket.off("liveComment");
      socket.off("liveLike"); socket.off("liveEmoji");
    };
  }, []);

  const handleEnd = () => {
    const followers = (user.followers || []).map(f => f._id || f);
    socket.emit("endLive", { hostId: user._id, followers });
    streamRef.current?.getTracks().forEach(t => t.stop());
    onEnd();
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMuted(m => !m);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-10 pb-3 z-10">
        <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-bold">LIVE</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
          <HiEye size={14} className="text-white" />
          <span className="text-white text-xs">{viewers}</span>
        </div>
        <button onClick={handleEnd} className="bg-black/50 rounded-full p-2 text-white">
          <HiX size={20} />
        </button>
      </div>

      {/* Comments */}
      <div className="absolute bottom-24 left-4 right-16 flex flex-col gap-1 max-h-48 overflow-hidden justify-end">
        {comments.map(c => (
          <div key={c.id} className="bg-black/50 rounded-xl px-3 py-1.5 w-fit max-w-full">
            <span className="text-white text-xs font-semibold">{c.viewerName} </span>
            <span className="text-white/80 text-xs">{c.text}</span>
          </div>
        ))}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-10">
        <button onClick={toggleMute} className="bg-black/50 rounded-full px-4 py-2 text-white text-sm">
          {muted ? "Unmute" : "Mute"}
        </button>
        <button onClick={handleEnd} className="bg-red-500 rounded-full px-6 py-2 text-white text-sm font-semibold">
          End Live
        </button>
      </div>
    </div>
  );
}

// ── VIEWER VIEW ────────────────────────────────────────────────
function LiveViewer({ hostId, hostName, hostAvatar, user, onLeave }) {
  const videoRef  = useRef(null);
  const pcRef     = useRef(null);
  const [comments,     setComments]     = useState([]);
  const [commentText,  setCommentText]  = useState("");
  const [viewers,      setViewers]      = useState(0);
  const [ended,        setEnded]        = useState(false);
  const [liked,        setLiked]        = useState(false);
  const [likeCount,    setLikeCount]    = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const socket = getSocket(user._id);

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;

    pc.ontrack = e => {
      if (videoRef.current) videoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = e => {
      if (e.candidate) socket.emit("liveIce", { to: hostId, candidate: e.candidate, isHost: false, hostId });
    };

    socket.emit("joinLive", { hostId, viewerId: user._id, viewerName: user.username });

    socket.on("liveAnswer", async ({ signal }) => {
      if (pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        if (signal.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("liveOffer", { hostId, viewerId: user._id, signal: answer });
        }
      }
    });

    socket.on("liveIce", ({ candidate }) => {
      if (candidate) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });

    socket.on("liveViewerCount", ({ count }) => setViewers(count));
    socket.on("liveComment", ({ viewerName, text }) => {
      setComments(p => [...p.slice(-49), { viewerName, text, id: Date.now() }]);
    });
    socket.on("liveEnded", () => setEnded(true));
    socket.on("liveLike",  ({ count }) => setLikeCount(count));
    socket.on("liveEmoji", ({ emoji, viewerName }) => {
      const id = Date.now() + Math.random();
      setFloatingEmojis(p => [...p, { id, emoji, viewerName }]);
      setTimeout(() => setFloatingEmojis(p => p.filter(e => e.id !== id)), 2500);
    });

    return () => {
      socket.emit("leaveLive", { hostId, viewerId: user._id });
      pc.close();
      socket.off("liveAnswer"); socket.off("liveIce");
      socket.off("liveViewerCount"); socket.off("liveComment");
      socket.off("liveEnded"); socket.off("liveLike"); socket.off("liveEmoji");
    };
  }, []);

  const sendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    socket.emit("liveComment", { hostId, viewerName: user.username, text: commentText });
    setComments(p => [...p.slice(-49), { viewerName: user.username, text: commentText, id: Date.now() }]);
    setCommentText("");
  };

  const handleLike = () => {
    setLiked(true);
    socket.emit("liveLike", { hostId, viewerName: user.username });
    // floating heart
    const id = Date.now();
    setFloatingEmojis(p => [...p, { id, emoji: "❤️", viewerName: user.username }]);
    setTimeout(() => setFloatingEmojis(p => p.filter(e => e.id !== id)), 2500);
  };

  const sendEmoji = (emoji) => {
    socket.emit("liveEmoji", { hostId, emoji, viewerName: user.username });
    const id = Date.now() + Math.random();
    setFloatingEmojis(p => [...p, { id, emoji, viewerName: user.username }]);
    setTimeout(() => setFloatingEmojis(p => p.filter(e => e.id !== id)), 2500);
  };

  if (ended) return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center gap-4">
      <p className="text-white text-lg font-semibold">Live has ended</p>
      <button onClick={onLeave} className="bg-white text-black px-6 py-2 rounded-full font-semibold">Go back</button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />

      {/* Top */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-10 pb-3 z-10">
        <div className="flex items-center gap-2">
          <img src={hostAvatar || "https://ui-avatars.com/api/?name=" + hostName} className="w-8 h-8 rounded-full object-cover" alt="" />
          <span className="text-white text-sm font-semibold drop-shadow">{hostName}</span>
          <div className="flex items-center gap-1 bg-red-500 px-2 py-0.5 rounded-full ml-1">
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
            <HiEye size={13} className="text-white" />
            <span className="text-white text-xs">{viewers}</span>
          </div>
          <button onClick={onLeave} className="bg-black/50 rounded-full p-2 text-white"><HiX size={18} /></button>
        </div>
      </div>

      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map(e => (
          <span key={e.id} className="absolute text-3xl animate-bounce"
            style={{ bottom: "120px", right: `${20 + Math.random() * 60}px`, animation: "floatUp 2.5s ease-out forwards" }}>
            {e.emoji}
          </span>
        ))}
      </div>

      {/* Comments */}
      <div className="absolute bottom-28 left-4 right-20 flex flex-col gap-1 max-h-48 overflow-hidden justify-end">
        {comments.map(c => (
          <div key={c.id} className="bg-black/50 rounded-xl px-3 py-1.5 w-fit max-w-full">
            <span className="text-white text-xs font-semibold">{c.viewerName} </span>
            <span className="text-white/80 text-xs">{c.text}</span>
          </div>
        ))}
      </div>

      {/* Right side actions */}
      <div className="absolute right-4 bottom-28 flex flex-col items-center gap-3 z-10">
        <button onClick={handleLike}
          className={"flex flex-col items-center gap-0.5 " + (liked ? "text-red-500" : "text-white")}>
          <HiHeart size={28} />
          <span className="text-xs">{likeCount}</span>
        </button>
        {LIVE_EMOJIS.map(em => (
          <button key={em} onClick={() => sendEmoji(em)}
            className="text-2xl hover:scale-125 transition-transform active:scale-150">
            {em}
          </button>
        ))}
      </div>

      {/* Comment input */}
      <form onSubmit={sendComment} className="absolute bottom-6 left-4 right-4 flex gap-2 z-10">
        <input value={commentText} onChange={e => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full px-4 py-2 outline-none placeholder:text-white/50 border border-white/20" />
        <button type="submit" className="bg-white/20 rounded-full px-4 py-2 text-white text-sm font-semibold">Send</button>
      </form>
    </div>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────────────
export default function LivePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, hostId, hostName, hostAvatar } = location.state || {};

  if (!user) return null;

  if (mode === "host") {
    return <LiveHost user={user} onEnd={() => navigate(-1)} />;
  }

  if (mode === "viewer" && hostId) {
    return <LiveViewer hostId={hostId} hostName={hostName} hostAvatar={hostAvatar} user={user} onLeave={() => navigate(-1)} />;
  }

  return null;
}
