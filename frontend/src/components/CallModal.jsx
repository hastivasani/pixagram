import { useEffect, useRef, useState } from "react";
import { getSocket } from "../utils/socket";
import { HiPhone, HiVideoCamera, HiMicrophone, HiX } from "react-icons/hi";

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }] };

export default function CallModal({ callType, remoteUser, myUser, mode, incomingSignal, onClose }) {
  const [status,   setStatus]   = useState(mode === "callee" ? "incoming" : "calling");
  const [muted,    setMuted]    = useState(false);
  const [camOff,   setCamOff]   = useState(false);
  const [mediaErr, setMediaErr] = useState(null); // ← replaces alert()

  const myVideoRef     = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef          = useRef(null);
  const myStreamRef    = useRef(null);
  const socket         = getSocket(myUser._id);

  const av = (u) => (u && u.avatar) ? u.avatar : ("https://ui-avatars.com/api/?name=" + ((u && u.username) || "U"));

  const getStream = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMediaErr("Camera/mic requires HTTPS or localhost.\nOpen the app via https:// or use localhost.");
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      myStreamRef.current = stream;
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error("Media error:", err);
      if (err.name === "NotAllowedError") {
        setMediaErr("Permission denied. Allow camera/microphone access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setMediaErr("No camera or microphone found on this device.");
      } else {
        setMediaErr("Could not access camera/microphone. Try using HTTPS or localhost.");
      }
      return null;
    }
  };

  const createPC = (stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Use a persistent MediaStream ref so tracks accumulate correctly
    const remoteStream = new MediaStream();

    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
      // Set srcObject every time — ref is always mounted now
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0] || remoteStream;
        remoteVideoRef.current.play().catch(() => {});
      }
      setStatus("connected");
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("iceCandidate", { to: remoteUser._id, candidate: e.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] state:", pc.connectionState);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        cleanup();
      }
    };

    return pc;
  };

  const startCall = async () => {
    const stream = await getStream();
    if (!stream) return;
    const pc = createPC(stream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("callUser", {
      to: remoteUser._id,
      signal: offer,
      from: myUser._id,
      callerName: myUser.username,
      callerAvatar: myUser.avatar,
      callType,
    });

    // Listen for answer
    socket.on("callAccepted", async ({ signal }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(signal));
    });
  };

  const answerCall = async () => {
    setStatus("connecting");
    const stream = await getStream();
    if (!stream) return;
    const pc = createPC(stream);

    await pc.setRemoteDescription(new RTCSessionDescription(incomingSignal));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answerCall", { to: remoteUser._id, signal: answer });
  };

  const endCall = () => {
    socket.emit("endCall", { to: remoteUser._id });
    cleanup();
  };

  const rejectCall = () => {
    socket.emit("endCall", { to: remoteUser._id });
    cleanup();
  };

  const cleanup = () => {
    pcRef.current?.close();
    myStreamRef.current?.getTracks().forEach((t) => t.stop());
    socket.off("callAccepted");
    socket.off("callEnded");
    socket.off("iceCandidate");
    setStatus("ended");
    setTimeout(onClose, 800);
  };

  const toggleMute = () => {
    if (!myStreamRef.current) return;
    myStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = muted; });
    setMuted((p) => !p);
  };

  const toggleCam = () => {
    if (!myStreamRef.current) return;
    myStreamRef.current.getVideoTracks().forEach((t) => { t.enabled = camOff; });
    setCamOff((p) => !p);
  };

  useEffect(() => {
    if (mode === "caller") startCall();

    // Receive ICE candidates from remote
    const onIce = async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) { console.error(e); }
    };

    socket.on("iceCandidate", onIce);
    socket.on("callEnded", cleanup);

    return () => {
      socket.off("iceCandidate", onIce);
      socket.off("callEnded", cleanup);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center">
      <div className="relative w-full max-w-md bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">

        <div className="relative w-full h-[420px] bg-gray-800 flex items-center justify-center">
          {mediaErr ? (
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-3xl">🔒</div>
              <p className="text-white font-semibold text-sm">Camera unavailable</p>
              <p className="text-gray-400 text-xs leading-relaxed">{mediaErr}</p>
              <button onClick={onClose} className="mt-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-full transition">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Remote video — always mounted so ref is ready when ontrack fires */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${status === "connected" && callType === "video" ? "block" : "hidden"}`}
              />

              {/* Avatar / status — shown when not yet connected */}
              {status !== "connected" && (
                <div className="flex flex-col items-center gap-4">
                  <img src={av(remoteUser)} className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20" alt="" />
                  <p className="text-white text-xl font-semibold">{remoteUser?.username}</p>
                  <p className="text-gray-400 text-sm animate-pulse">
                    {status === "calling"      ? `Calling${callType === "video" ? " (video)" : ""}...`
                     : status === "incoming"   ? `Incoming ${callType} call`
                     : status === "connecting" ? "Connecting..."
                     : "Call ended"}
                  </p>
                </div>
              )}

              {/* My video pip — always mounted too */}
              {callType === "video" && (status === "connected" || status === "calling" || status === "connecting") && (
                <video
                  ref={myVideoRef}
                  autoPlay playsInline muted
                  className="absolute bottom-3 right-3 w-28 h-20 rounded-xl object-cover border-2 border-white/30 z-10"
                />
              )}
            </>
          )}
        </div>

        <div className="bg-gray-900 px-6 py-5">
          {/* Hide all controls when media error */}
          {!mediaErr && status === "incoming" && (
            <div className="flex justify-center gap-10">
              <button onClick={rejectCall} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                  <HiX size={26} className="text-white" />
                </div>
                <span className="text-xs text-gray-400">Decline</span>
              </button>
              <button onClick={answerCall} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  {callType === "video" ? <HiVideoCamera size={24} className="text-white" /> : <HiPhone size={24} className="text-white" />}
                </div>
                <span className="text-xs text-gray-400">Accept</span>
              </button>
            </div>
          )}

          {!mediaErr && (status === "calling" || status === "connecting" || status === "connected") && (
            <div className="flex justify-center gap-6">
              <button onClick={toggleMute} className="flex flex-col items-center gap-1">
                <div className={"w-12 h-12 rounded-full flex items-center justify-center " + (muted ? "bg-red-500" : "bg-gray-700")}>
                  <HiMicrophone size={20} className="text-white" />
                </div>
                <span className="text-xs text-gray-400">{muted ? "Unmute" : "Mute"}</span>
              </button>

              {callType === "video" && (
                <button onClick={toggleCam} className="flex flex-col items-center gap-1">
                  <div className={"w-12 h-12 rounded-full flex items-center justify-center " + (camOff ? "bg-red-500" : "bg-gray-700")}>
                    <HiVideoCamera size={20} className={"text-white " + (camOff ? "opacity-40" : "")} />
                  </div>
                  <span className="text-xs text-gray-400">{camOff ? "Start cam" : "Stop cam"}</span>
                </button>
              )}

              <button onClick={endCall} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <HiPhone size={20} className="text-white rotate-[135deg]" />
                </div>
                <span className="text-xs text-gray-400">End</span>
              </button>
            </div>
          )}

          {!mediaErr && status === "ended" && (
            <p className="text-center text-gray-400 text-sm">Call ended</p>
          )}
        </div>
      </div>
    </div>
  );
}
