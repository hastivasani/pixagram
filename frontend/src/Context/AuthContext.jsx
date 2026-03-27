import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../services/api";
import { getSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => { localStorage.removeItem("token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Connect socket when user is available, disconnect only on logout/unmount
  useEffect(() => {
    if (user?._id) {
      getSocket(user._id);
    }
  }, [user?._id]);

  // Disconnect socket only when component unmounts (app closes)
  useEffect(() => {
    return () => { disconnectSocket(); };
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    setUser(null);
  };

  // Refresh user data from server (call after profile update)
  const refreshUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
