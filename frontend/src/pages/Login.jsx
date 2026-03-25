import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../Context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await loginUser({ email, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-theme-primary text-theme-primary">
      {/* Left */}
      <div className="hidden lg:flex w-1/2 items-center justify-center">
        <div className="max-w-md text-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" className="w-20 mx-auto mb-6" />
          <h1 className="text-3xl font-semibold leading-relaxed text-theme-primary">
            See everyday moments from <span className="text-pink-500">your close friends.</span>
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex w-full lg:w-1/2 items-center justify-center">
        <div className="w-full max-w-md px-6">
          <h2 className="text-2xl font-semibold mb-6 text-center text-theme-primary">Log into Pixagram</h2>

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <input
            type="text"
            placeholder="Email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-theme-input text-theme-primary border border-theme rounded-lg px-4 py-3 mb-4 outline-none placeholder:text-theme-muted"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-theme-input text-theme-primary border border-theme rounded-lg px-4 py-3 mb-4 outline-none placeholder:text-theme-muted"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition py-3 rounded-full font-semibold mb-4 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full border border-blue-500 text-blue-400 py-3 rounded-full hover:bg-blue-500 hover:text-white transition"
          >
            Create new account
          </button>
        </div>
      </div>
    </div>
  );
}
