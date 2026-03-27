import { useState } from "react";
import { requestPasswordReset, resetPassword, verifyResetToken } from "../services/api";
import { Link, useSearchParams } from "react-router-dom";
import { FaLock, FaEnvelope, FaCheck } from "react-icons/fa";

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords don't match");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-theme-primary">
            {token ? "Reset Password" : "Forgot Password"}
          </h1>
          <p className="text-theme-secondary text-sm mt-1">
            {token ? "Enter your new password" : "We'll send you a reset link"}
          </p>
        </div>

        <div className="bg-theme-secondary rounded-2xl p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaCheck className="text-white" />
              </div>
              <p className="font-semibold mb-1">Password Reset!</p>
              <p className="text-sm text-theme-secondary mb-4">You can now log in with your new password.</p>
              <Link to="/login" className="block w-full py-3 bg-purple-600 rounded-xl text-white text-center font-medium">Go to Login</Link>
            </div>
          ) : sent && !token ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaEnvelope className="text-white" />
              </div>
              <p className="font-semibold mb-1">Check your email</p>
              <p className="text-sm text-theme-secondary mb-4">If an account exists for {email}, we sent a reset link.</p>
              <button onClick={() => setSent(false)} className="text-sm text-purple-400 hover:text-purple-300">Try again</button>
            </div>
          ) : token ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-sm text-theme-secondary mb-1 block">New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full bg-theme-primary rounded-xl px-4 py-3 outline-none text-sm" required />
              </div>
              <div>
                <label className="text-sm text-theme-secondary mb-1 block">Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" className="w-full bg-theme-primary rounded-xl px-4 py-3 outline-none text-sm" required />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="text-sm text-theme-secondary mb-1 block">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-theme-primary rounded-xl px-4 py-3 outline-none text-sm" required />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-theme-secondary mt-4">
          Remember your password?{" "}
          <Link to="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
