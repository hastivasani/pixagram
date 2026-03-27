import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import CallModal from "./CallModal";

/**
 * Globally mounted — listens for 1-on-1 AND group incoming calls.
 */
export default function IncomingCallListener() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incomingCall,  setIncomingCall]  = useState(null); // 1-on-1
  const [incomingGroup, setIncomingGroup] = useState(null); // group call

  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);

    // 1-on-1 call
    socket.on("incomingCall", (data) => setIncomingCall(data));

    // Group call — show a banner anywhere in the app
    socket.on("incomingGroupCall", (data) => {
      console.log("[IncomingCallListener] incomingGroupCall received:", data);
      // Don't show if already in a call
      setIncomingGroup(prev => prev ? prev : data);
    });

    return () => {
      socket.off("incomingCall");
      socket.off("incomingGroupCall");
    };
  }, [user?._id]);

  return (
    <>
      {/* 1-on-1 incoming call */}
      {incomingCall && (
        <CallModal
          callType={incomingCall.callType}
          mode="callee"
          remoteUser={{
            _id:      incomingCall.from,
            username: incomingCall.callerName,
            avatar:   incomingCall.callerAvatar,
          }}
          myUser={user}
          incomingSignal={incomingCall.signal}
          onClose={() => setIncomingCall(null)}
        />
      )}

      {/* Group call banner — shown globally */}
      {incomingGroup && !incomingCall && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-green-600 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 min-w-[320px] max-w-sm">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xl">
            {incomingGroup.callType === "video" ? "📹" : "📞"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{incomingGroup.callerName} is calling</p>
            <p className="text-xs opacity-80 truncate">
              {incomingGroup.callType === "video" ? "Video" : "Voice"} call · Group
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => {
                // Navigate to groups page — GroupChat will show the modal
                navigate("/groups");
                // Store pending call so GroupChat can pick it up
                window.__pendingGroupCall = incomingGroup;
                setIncomingGroup(null);
              }}
              className="bg-white text-green-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-50 transition"
            >
              Join
            </button>
            <button
              onClick={() => setIncomingGroup(null)}
              className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/30 transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
