import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import CallModal from "./CallModal";

/**
 * Mounted globally — listens for incoming calls from ANY user,
 * not just the currently open chat.
 */
export default function IncomingCallListener() {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  // { signal, from, callerName, callerAvatar, callType }

  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);

    const handle = (data) => {
      setIncomingCall(data);
    };

    socket.on("incomingCall", handle);
    return () => socket.off("incomingCall", handle);
  }, [user?._id]);

  if (!incomingCall) return null;

  const remoteUser = {
    _id:    incomingCall.from,
    username: incomingCall.callerName,
    avatar:   incomingCall.callerAvatar,
  };

  return (
    <CallModal
      callType={incomingCall.callType}
      mode="callee"
      remoteUser={remoteUser}
      myUser={user}
      incomingSignal={incomingCall.signal}
      onClose={() => setIncomingCall(null)}
    />
  );
}
