import { useState, useEffect, useRef, useCallback } from "react";
import {
  getMyGroups, createGroup, getGroup,
  sendGroupMessage, getGroupMessages, joinGroupByCode, leaveGroup,
} from "../services/api";
import { getSocket } from "../utils/socket";
import { useAuth } from "../Context/AuthContext";
import {
  FaUsers, FaPlus, FaArrowLeft, FaPaperPlane,
  FaLink, FaSignOutAlt, FaImage, FaPhone, FaVideo,
  FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaTimes,
} from "react-icons/fa";
import { HiX } from "react-icons/hi";

// â”€â”€â”€ Group List Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GroupList({ groups, selectedId, onSelect, onGroupCreated }) {
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode,   setJoinCode]   = useState("");
  const [name,       setName]       = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await createGroup(name.trim());
      onGroupCreated(res.data);
      setShowCreate(false);
      setName("");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setError("");
    try {
      const res = await joinGroupByCode(joinCode.trim());
      onGroupCreated(res.data.group || res.data);
      setJoinCode("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid invite code");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme flex-shrink-0">
        <h2 className="text-base font-bold text-theme-primary flex items-center gap-2">
          <FaUsers className="text-blue-500" /> Groups
        </h2>
        <button
          onClick={() => { setShowCreate(s => !s); setError(""); }}
          className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
        >
          <FaPlus size={12} />
        </button>
      </div>

      {/* Create / Join panel */}
      {showCreate && (
        <div className="px-3 py-3 border-b border-theme space-y-2 bg-theme-card flex-shrink-0">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide">New Group</p>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="Group name"
            className="w-full bg-theme-input text-theme-primary rounded-lg px-3 py-2 text-sm outline-none border border-theme focus:border-blue-500 transition"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 h-px bg-theme" />
            <span className="text-xs text-theme-muted">or join</span>
            <div className="flex-1 h-px bg-theme" />
          </div>

          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              placeholder="Invite code"
              maxLength={10}
              className="flex-1 bg-theme-input text-theme-primary rounded-lg px-3 py-2 text-sm outline-none border border-theme focus:border-green-500 transition font-mono"
            />
            <button
              onClick={handleJoin}
              disabled={!joinCode.trim()}
              className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-green-700 transition"
            >
              Join
            </button>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}

      {/* Group list */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-theme-muted py-10 px-4 text-center">
            <FaUsers size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No groups yet</p>
            <p className="text-xs mt-1 opacity-70">Create one or join with an invite code</p>
          </div>
        ) : (
          groups.map(g => (
            <button
              key={g._id}
              onClick={() => onSelect(g)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition text-left border-b border-theme/30 ${
                selectedId === g._id ? "bg-blue-600/10 border-l-2 border-l-blue-500" : "hover:bg-theme-hover"
              }`}
            >
              <GroupAvatar group={g} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-theme-primary text-sm truncate">{g.name}</p>
                <p className="text-xs text-theme-muted">{g.members?.length || 0} members</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Group Avatar helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GroupAvatar({ group, size = "md" }) {
  const sz = size === "md" ? "w-11 h-11 text-lg" : "w-9 h-9 text-base";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden`}>
      {group.avatar
        ? <img src={group.avatar} className="w-full h-full object-cover" alt="" />
        : (group.name?.[0] || "G").toUpperCase()
      }
    </div>
  );
}

// ─── Group Call Modal ─────────────────────────────────────────
const ICE_CFG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function PeerVideo({ peer }) {
  const ref = useRef(null);

  // Set srcObject whenever stream changes or ref mounts
  const setRef = useCallback((el) => {
    ref.current = el;
    if (el && peer.stream) {
      el.srcObject = peer.stream;
      el.play().catch(() => {});
    }
  }, [peer.stream]);

  useEffect(() => {
    if (ref.current && peer.stream) {
      ref.current.srcObject = peer.stream;
      ref.current.play().catch(() => {});
    }
  }, [peer.stream]);

  return (
    <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
      <video ref={setRef} autoPlay playsInline className="w-full h-full object-cover" />
      <span className="absolute bottom-1 left-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
        {peer.username || "..."}
      </span>
    </div>
  );
}

function GroupCallModal({ group, currentUser, callType, onClose }) {
  const socket     = getSocket(currentUser._id);
  const [status,   setStatus]   = useState("connecting");
  const [muted,    setMuted]    = useState(false);
  const [camOff,   setCamOff]   = useState(false);
  const [peers,    setPeers]    = useState([]);
  const [mediaErr, setMediaErr] = useState(null);

  const myVideoRef  = useRef(null);
  const myStreamRef = useRef(null);
  const pcsRef      = useRef({});
  const peersRef    = useRef([]);   // mirror of peers state for use inside closures

  const updatePeer = (userId, username, stream) => {
    peersRef.current = (() => {
      const exists = peersRef.current.find(p => p.userId === userId);
      if (exists) {
        return peersRef.current.map(p =>
          p.userId === userId
            ? { ...p, stream: stream ?? p.stream, username: username ?? p.username }
            : p
        );
      }
      return [...peersRef.current, { userId, username, stream }];
    })();
    setPeers([...peersRef.current]);
    setStatus("connected");
  };

  const makePeer = (peerId, peerUsername, myStream) => {
    if (pcsRef.current[peerId]) return pcsRef.current[peerId];
    const pc = new RTCPeerConnection(ICE_CFG);
    pcsRef.current[peerId] = pc;

    myStream.getTracks().forEach(t => pc.addTrack(t, myStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("gcIce", { to: peerId, candidate: e.candidate });
    };

    pc.ontrack = (e) => {
      // e.streams[0] may be empty on first track — build stream manually
      const remoteStream = e.streams?.[0] || new MediaStream([e.track]);
      updatePeer(peerId, peerUsername, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        peersRef.current = peersRef.current.filter(p => p.userId !== peerId);
        setPeers([...peersRef.current]);
        delete pcsRef.current[peerId];
      }
    };
    return pc;
  };

  // Use a ref to track if we've fully initialized (survives Strict Mode double-invoke)
  const initializedRef = useRef(false);
  const unmountedRef   = useRef(false);

  useEffect(() => {
    // Strict Mode fires cleanup+reinit — skip if already running
    if (initializedRef.current) return;
    initializedRef.current = true;
    unmountedRef.current   = false;

    (async () => {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: callType === "video",
          audio: true,
        });
      } catch (e) {
        if (!unmountedRef.current)
          setMediaErr("Cannot access camera/mic. Allow permissions and use HTTPS or localhost.");
        return;
      }
      if (unmountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

      myStreamRef.current = stream;
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      socket.on("gcPeerJoined", async ({ userId, username }) => {
        console.log("[GroupCall] gcPeerJoined:", userId, username);
        if (userId === currentUser._id || !myStreamRef.current) return;
        updatePeer(userId, username, null);
        const pc = makePeer(userId, username, myStreamRef.current);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("gcOffer", { to: userId, signal: offer, username: currentUser.username });
      });

      socket.on("gcOffer", async ({ from, signal, username }) => {
        console.log("[GroupCall] gcOffer received from:", from);
        if (from === currentUser._id || !myStreamRef.current) return;
        const pc = makePeer(from, username, myStreamRef.current);
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("gcAnswer", { to: from, signal: answer });
      });

      socket.on("gcAnswer", async ({ from, signal }) => {
        try { await pcsRef.current[from]?.setRemoteDescription(new RTCSessionDescription(signal)); }
        catch (e) { console.error("gcAnswer err", e); }
      });

      socket.on("gcIce", ({ from, candidate }) => {
        pcsRef.current[from]?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      });

      // Remote ended the call
      socket.on("gcEnded", ({ groupId }) => {
        if (groupId === group._id) {
          stopMedia();
          setStatus("ended");
          setTimeout(onClose, 400);
        }
      });

      socket.on("gcPeerLeft", ({ userId }) => {
        pcsRef.current[userId]?.close();
        delete pcsRef.current[userId];
        peersRef.current = peersRef.current.filter(p => p.userId !== userId);
        setPeers([...peersRef.current]);
      });

      const memberIds = (group.members || [])
          .map(m => (m._id || m)?.toString())
          .filter(id => id && id !== currentUser._id?.toString());

      console.log("[GroupCall] members to notify:", memberIds);
      console.log("[GroupCall] currentUser._id:", currentUser._id);

      socket.emit("gcJoin", {
        groupId:      group._id,
        userId:       currentUser._id?.toString(),
        username:     currentUser.username,
        callType,
        callerName:   currentUser.username,
        callerAvatar: currentUser.avatar,
        members:      memberIds,
      });
      console.log("[GroupCall] Emitted gcJoin for group", group._id, "with", memberIds.length, "members");
    })();

    // Only stop media on true unmount — do NOT call onClose here
    return () => {
      unmountedRef.current = true;
      stopMedia();
    };
  }, []); // eslint-disable-line

  // Stop tracks + close peers — does NOT close the modal
  const stopMedia = () => {
    Object.values(pcsRef.current).forEach(pc => pc.close());
    pcsRef.current = {};
    myStreamRef.current?.getTracks().forEach(t => t.stop());
    myStreamRef.current = null;
    socket.off("gcPeerJoined");
    socket.off("gcOffer");
    socket.off("gcAnswer");
    socket.off("gcIce");
    socket.off("gcEnded");
    socket.off("gcPeerLeft");
  };

  const endCall = () => {
    socket.emit("gcEnd", { groupId: group._id });
    stopMedia();
    setStatus("ended");
    setTimeout(onClose, 400);
  };

  const toggleMute = () => {
    myStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = muted; });
    setMuted(m => !m);
  };
  const toggleCam = () => {
    myStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = camOff; });
    setCamOff(c => !c);
  };

  const av = (u) => u?.avatar || `https://ui-avatars.com/api/?name=${u?.username || "U"}&background=random`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="text-white font-bold text-sm">{group.name}</p>
            <p className="text-gray-400 text-xs">
              {status === "connecting" ? "Connecting..." : status === "connected" ? `${peers.length + 1} in call` : "Call ended"}
            </p>
          </div>
          <span className="text-xs px-2 py-1 bg-white/10 text-white rounded-full">
            {callType === "video" ? "📹 Video" : "📞 Voice"}
          </span>
        </div>

        {mediaErr ? (
          <div className="p-8 text-center">
            <p className="text-white font-semibold mb-2">🔒 Unavailable</p>
            <p className="text-gray-400 text-sm mb-4">{mediaErr}</p>
            <button onClick={onClose} className="px-5 py-2 bg-gray-700 text-white rounded-full text-sm">Close</button>
          </div>
        ) : (
          <>
            {callType === "video" ? (
              <div className={`grid gap-2 p-3 flex-1 overflow-auto ${peers.length === 0 ? "grid-cols-1" : "grid-cols-2"}`}>
                <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
                  <video ref={myVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${camOff ? "opacity-0" : ""}`} />
                  {camOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <img src={av(currentUser)} className="w-14 h-14 rounded-full" alt="" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">You</span>
                </div>
                {peers.map(peer => <PeerVideo key={peer.userId} peer={peer} />)}
                {peers.length === 0 && (
                  <div className="flex items-center justify-center bg-gray-800 rounded-xl aspect-video">
                    <p className="text-gray-500 text-sm animate-pulse">Waiting for others...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-5 p-6 flex-1 min-h-[160px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <img src={av(currentUser)} className="w-16 h-16 rounded-full border-2 border-green-500" alt="" />
                    {muted && <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5"><FaMicrophoneSlash size={10} className="text-white" /></div>}
                  </div>
                  <span className="text-white text-xs">{currentUser.username} (You)</span>
                </div>
                {peers.map(peer => (
                  <div key={peer.userId} className="flex flex-col items-center gap-2">
                    <img src={`https://ui-avatars.com/api/?name=${peer.username || "?"}&background=random`} className="w-16 h-16 rounded-full border-2 border-blue-500" alt="" />
                    <span className="text-white text-xs">{peer.username || "..."}</span>
                    <audio autoPlay ref={el => { if (el && peer.stream) el.srcObject = peer.stream; }} />
                  </div>
                ))}
                {peers.length === 0 && <p className="text-gray-500 text-sm w-full text-center mt-2">Waiting for others to join...</p>}
              </div>
            )}

            <div className="flex justify-center gap-5 px-6 py-4 border-t border-white/10 flex-shrink-0">
              <button onClick={toggleMute} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${muted ? "bg-red-500" : "bg-gray-700"}`}>
                  {muted ? <FaMicrophoneSlash className="text-white" size={18} /> : <FaMicrophone className="text-white" size={18} />}
                </div>
                <span className="text-xs text-gray-400">{muted ? "Unmute" : "Mute"}</span>
              </button>
              {callType === "video" && (
                <button onClick={toggleCam} className="flex flex-col items-center gap-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${camOff ? "bg-red-500" : "bg-gray-700"}`}>
                    {camOff ? <FaVideoSlash className="text-white" size={18} /> : <FaVideo className="text-white" size={18} />}
                  </div>
                  <span className="text-xs text-gray-400">{camOff ? "Start cam" : "Stop cam"}</span>
                </button>
              )}
              <button onClick={endCall} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <FaPhone className="text-white rotate-[135deg]" size={18} />
                </div>
                <span className="text-xs text-gray-400">End</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ─── Group Chat Window ────────────────────────────────────────
function GroupChat({ group, currentUser, onBack, onLeave }) {
  const [messages,    setMessages]    = useState([]);
  const [text,        setText]        = useState("");
  const [sending,     setSending]     = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [imageFile,   setImageFile]   = useState(null);
  const [imagePreview,setImagePreview]= useState(null);
  const [activeCall,  setActiveCall]  = useState(null);
  const [incomingCall,setIncomingCall]= useState(null);
  const [activeTab,   setActiveTab]   = useState("chat"); // chat | roles | events | polls | pinned
  const bottomRef  = useRef(null);
  const fileRef    = useRef(null);
  const socket     = getSocket(currentUser?._id);
  const sentIdsRef = useRef(new Set());

  // Load messages
  useEffect(() => {
    setLoadingMsgs(true);
    setMessages([]);
    getGroupMessages(group._id)
      .then(r => setMessages(r.data || []))
      .catch(err => console.error("getGroupMessages error:", err))
      .finally(() => setLoadingMsgs(false));

    // Pick up pending group call from global listener
    if (window.__pendingGroupCall?.groupId === group._id) {
      setIncomingCall(window.__pendingGroupCall);
      window.__pendingGroupCall = null;
    }
  }, [group._id]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.emit("joinGroup", { groupId: group._id });

    const onMsg = (msg) => {
      setMessages(prev => {
        if (sentIdsRef.current.has(msg._id)) return prev;
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on("groupMessage", onMsg);

    const onGroupCall = (data) => {
      if (data.groupId === group._id && data.callerId !== currentUser._id) {
        setIncomingCall(data);
      }
    };
    socket.on("incomingGroupCall", onGroupCall);

    const onCallEnded = ({ groupId }) => {
      if (groupId === group._id) { setActiveCall(null); setIncomingCall(null); }
    };
    socket.on("gcEnded", onCallEnded);

    return () => {
      socket.off("groupMessage", onMsg);
      socket.off("incomingGroupCall", onGroupCall);
      socket.off("gcEnded", onCallEnded);
      socket.emit("leaveGroup", { groupId: group._id });
    };
  }, [socket, group._id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !imageFile) return;
    setSending(true);

    const tempId = "temp_" + Date.now();
    const optimistic = {
      _id: tempId,
      sender: { _id: currentUser._id, username: currentUser.username, avatar: currentUser.avatar },
      text: trimmed,
      mediaUrl: imagePreview || "",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setText("");
    setImageFile(null);
    setImagePreview(null);

    try {
      const res = await sendGroupMessage(group._id, trimmed, imageFile || null);
      sentIdsRef.current.add(res.data._id);
      setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
    } catch (err) {
      console.error("sendGroupMessage error:", err);
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLeave = async () => {
    if (!window.confirm(`Leave "${group.name}"?`)) return;
    try {
      await leaveGroup(group._id);
      onLeave(group._id);
    } catch (_) {}
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode || "");
    alert(`Invite code copied: ${group.inviteCode}`);
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Active call modal */}
      {activeCall && (
        <GroupCallModal
          group={group}
          currentUser={currentUser}
          callType={activeCall.callType}
          onClose={() => setActiveCall(null)}
        />
      )}

      {/* Incoming call banner */}
      {incomingCall && !activeCall && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              {incomingCall.callType === "video" ? <FaVideo size={16} /> : <FaPhone size={16} />}
            </div>
            <div>
              <p className="text-sm font-bold">{incomingCall.callerName} is calling</p>
              <p className="text-xs opacity-80">{incomingCall.callType === "video" ? "Video" : "Voice"} call · {group.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveCall({ callType: incomingCall.callType }); setIncomingCall(null); }}
              className="bg-white text-green-600 px-3 py-1.5 rounded-full text-xs font-bold"
            >Accept</button>
            <button onClick={() => setIncomingCall(null)} className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-theme bg-theme-sidebar flex-shrink-0">
        <button onClick={onBack} className="text-theme-muted hover:text-theme-primary transition md:hidden">
          <FaArrowLeft size={16} />
        </button>
        <GroupAvatar group={group} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-theme-primary text-sm truncate">{group.name}</p>
          <p className="text-xs text-theme-muted">{group.members?.length || 0} members</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setActiveCall({ callType: "audio" })} className="text-theme-muted hover:text-green-400 transition p-1.5 rounded-lg hover:bg-theme-hover" title="Voice call">
            <FaPhone size={13} />
          </button>
          <button onClick={() => setActiveCall({ callType: "video" })} className="text-theme-muted hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-theme-hover" title="Video call">
            <FaVideo size={13} />
          </button>
          <button onClick={copyInviteCode} className="text-theme-muted hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-theme-hover" title={`Invite code: ${group.inviteCode}`}>
            <FaLink size={13} />
          </button>
          <button onClick={handleLeave} className="text-theme-muted hover:text-red-400 transition p-1.5 rounded-lg hover:bg-theme-hover" title="Leave group">
            <FaSignOutAlt size={13} />
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-theme bg-theme-sidebar flex-shrink-0 overflow-x-auto scrollbar-hide">
        {[
          { id: "chat",   label: "💬 Chat" },
          { id: "roles",  label: "👑 Roles" },
          { id: "events", label: "📅 Events" },
          { id: "polls",  label: "📊 Polls" },
          { id: "pinned", label: "📌 Pinned" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 text-xs font-semibold transition border-b-2 ${activeTab === t.id ? "border-blue-500 text-blue-400" : "border-transparent text-theme-muted hover:text-theme-primary"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide mb-3">Member Roles</p>
          {(group.members || []).map((m, i) => {
            const u = m.user || m;
            const role = m.role || "member";
            const roleColors = { owner: "text-yellow-400 bg-yellow-400/10", admin: "text-red-400 bg-red-400/10", moderator: "text-blue-400 bg-blue-400/10", member: "text-theme-muted bg-theme-input" };
            return (
              <div key={u._id || i} className="flex items-center gap-3 p-2 rounded-xl bg-theme-card border border-theme">
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username || "?"}&background=random`}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-theme-primary truncate">{u.username || "Unknown"}</p>
                  {m.nickname && <p className="text-xs text-theme-muted">{m.nickname}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${roleColors[role] || roleColors.member}`}>
                  {role}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide">Upcoming Events</p>
          {!group.events?.length ? (
            <div className="text-center py-10 text-theme-muted">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm">No events scheduled</p>
            </div>
          ) : group.events.map((ev, i) => (
            <div key={i} className="bg-theme-card border border-theme rounded-xl p-3">
              <p className="font-semibold text-theme-primary text-sm">{ev.title}</p>
              {ev.description && <p className="text-xs text-theme-secondary mt-0.5">{ev.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-theme-muted">
                {ev.startAt && <span>📅 {new Date(ev.startAt).toLocaleDateString()}</span>}
                <span>👥 {ev.rsvp?.filter(r => r.status === "going").length || 0} going</span>
              </div>
              <div className="flex gap-2 mt-2">
                {["going", "maybe", "not_going"].map(s => (
                  <button key={s} className="text-xs px-2 py-1 rounded-lg bg-theme-input text-theme-secondary hover:bg-theme-hover transition capitalize">
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Polls Tab */}
      {activeTab === "polls" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide">Group Polls</p>
          {!group.polls?.length ? (
            <div className="text-center py-10 text-theme-muted">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">No polls yet</p>
            </div>
          ) : group.polls.map((poll, i) => {
            const total = poll.options?.reduce((s, o) => s + (o.votes?.length || 0), 0) || 0;
            return (
              <div key={i} className="bg-theme-card border border-theme rounded-xl p-3">
                <p className="font-semibold text-theme-primary text-sm mb-2">{poll.question}</p>
                {poll.options?.map((opt, j) => {
                  const pct = total ? Math.round((opt.votes?.length || 0) / total * 100) : 0;
                  return (
                    <div key={j} className="mb-1.5">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-theme-primary">{opt.text}</span>
                        <span className="text-theme-muted">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-theme-input rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-theme-muted mt-1">{total} votes</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Pinned Tab */}
      {activeTab === "pinned" && (
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide mb-3">Pinned Message</p>
          {group.announcement && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-3">
              <p className="text-xs font-bold text-yellow-400 mb-1">📢 Announcement</p>
              <p className="text-sm text-theme-primary">{group.announcement}</p>
            </div>
          )}
          {!group.pinnedMessage && !group.announcement ? (
            <div className="text-center py-10 text-theme-muted">
              <p className="text-3xl mb-2">📌</p>
              <p className="text-sm">No pinned messages</p>
            </div>
          ) : group.pinnedMessage && (
            <div className="bg-theme-card border-l-4 border-blue-500 rounded-xl p-3">
              <p className="text-xs text-blue-400 font-semibold mb-1">📌 Pinned</p>
              <p className="text-sm text-theme-primary">{group.pinnedMessage.text || "Media message"}</p>
            </div>
          )}
        </div>
      )}

      {/* Messages area */}
      {activeTab === "chat" && (
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {loadingMsgs ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-theme-muted">
            <FaUsers size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender?._id === currentUser._id || msg.sender?._id?.toString() === currentUser._id?.toString();
            const prevMsg = messages[idx - 1];
            const sameAsPrev = prevMsg?.sender?._id === msg.sender?._id;

            return (
              <div key={msg._id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""} ${sameAsPrev ? "mt-0.5" : "mt-3"}`}>
                {!isMe && (
                  <div className="w-7 flex-shrink-0">
                    {!sameAsPrev && (
                      <img
                        src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.username || "?"}&background=random`}
                        className="w-7 h-7 rounded-full object-cover"
                        alt=""
                      />
                    )}
                  </div>
                )}
                <div className={`max-w-[72%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && !sameAsPrev && (
                    <p className="text-[11px] text-theme-muted mb-0.5 ml-1 font-medium">{msg.sender?.username}</p>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm break-words ${
                    isMe
                      ? `bg-blue-600 text-white rounded-br-sm ${msg.isOptimistic ? "opacity-70" : ""}`
                      : "bg-theme-card text-theme-primary border border-theme rounded-bl-sm"
                  }`}>
                    {msg.isDeleted
                      ? <span className="italic opacity-50 text-xs">Message deleted</span>
                      : msg.text
                    }
                    {msg.mediaUrl && !msg.isDeleted && (
                      <img src={msg.mediaUrl} className="max-w-full rounded-lg mt-1.5 max-h-48 object-cover" alt="" />
                    )}
                  </div>
                  <span className="text-[10px] text-theme-muted mt-0.5 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      )}

      {/* Image preview — only in chat tab */}
      {activeTab === "chat" && imagePreview && (
        <div className="px-4 pb-2 flex items-center gap-2 flex-shrink-0">
          <img src={imagePreview} className="w-14 h-14 rounded-lg object-cover border border-theme" alt="" />
          <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-xs text-red-400 hover:text-red-500">
            Remove
          </button>
        </div>
      )}

      {/* Input bar — only in chat tab */}
      {activeTab === "chat" && (
      <div className="px-4 py-3 border-t border-theme flex items-center gap-2 bg-theme-sidebar flex-shrink-0">
        <button onClick={() => fileRef.current?.click()} className="text-theme-muted hover:text-blue-400 transition flex-shrink-0">
          <FaImage size={16} />
        </button>
        <input type="file" ref={fileRef} hidden accept="image/*" onChange={pickImage} />
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${group.name}...`}
          className="flex-1 bg-theme-input text-theme-primary rounded-full px-4 py-2 text-sm outline-none border border-theme focus:border-blue-500 transition"
        />
        <button
          onClick={handleSend}
          disabled={sending || (!text.trim() && !imageFile)}
          className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition flex-shrink-0"
        >
          <FaPaperPlane size={13} />
        </button>
      </div>
      )}
    </div>
  );
}

// ─── Main Groups Page ─────────────────────────────────────────
export default function Groups() {
  const { user } = useAuth();
  const [groups,        setGroups]        = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    setLoadingGroups(true);
    getMyGroups()
      .then(r => setGroups(r.data || []))
      .catch(err => console.error("getMyGroups error:", err))
      .finally(() => setLoadingGroups(false));
  }, []);

  const handleGroupCreated = useCallback((group) => {
    if (!group?._id) return;
    setGroups(prev => [group, ...prev.filter(g => g._id !== group._id)]);
    setSelectedGroup(group);
  }, []);

  const handleSelectGroup = useCallback(async (g) => {
    setSelectedGroup(g);
    try {
      const res = await getGroup(g._id);
      setSelectedGroup(res.data);
    } catch (_) {}
  }, []);

  const handleLeaveGroup = useCallback((groupId) => {
    setGroups(prev => prev.filter(g => g._id !== groupId));
    setSelectedGroup(null);
  }, []);

  return (
    <div className="flex bg-theme-primary overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>
      <div className={`flex-shrink-0 flex flex-col border-r border-theme bg-theme-sidebar w-full md:w-[320px] lg:w-[360px] ${selectedGroup ? "hidden md:flex" : "flex"}`}>
        {loadingGroups ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <GroupList
            groups={groups}
            selectedId={selectedGroup?._id}
            onSelect={handleSelectGroup}
            onGroupCreated={handleGroupCreated}
          />
        )}
      </div>

      <div className={`flex-1 min-w-0 flex flex-col ${selectedGroup ? "flex" : "hidden md:flex"}`}>
        {selectedGroup ? (
          <GroupChat
            key={selectedGroup._id}
            group={selectedGroup}
            currentUser={user}
            onBack={() => setSelectedGroup(null)}
            onLeave={handleLeaveGroup}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-theme-muted gap-3">
            <FaUsers size={52} className="opacity-20" />
            <p className="text-sm font-medium">Select a group to chat</p>
            <p className="text-xs opacity-60">or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
