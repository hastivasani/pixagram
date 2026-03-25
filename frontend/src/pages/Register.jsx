import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiCamera } from "react-icons/hi";
import { registerUser } from "../services/api";
import { useAuth } from "../Context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ email: "", password: "", name: "", username: "", month: "", day: "", year: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.name || !form.username) {
      setError("Please fill all required fields"); return;
    }
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("name", form.name);
      formData.append("username", form.username);
      if (avatarFile) formData.append("avatar", avatarFile);
      const res = await registerUser(formData);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-theme-input text-theme-primary border border-theme rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition placeholder:text-theme-muted";
  const selectClass = "bg-theme-input text-theme-primary border border-theme rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary text-theme-primary px-4 py-8">
      <div className="w-full max-w-md bg-theme-card rounded-2xl shadow-theme border border-theme p-6">
        <button onClick={() => navigate("/login")} className="mb-3 text-theme-secondary hover:text-theme-primary transition-colors">
          <HiArrowLeft size={20} />
        </button>

        <p className="text-theme-muted text-sm mb-2">∞ Meta</p>
        <h1 className="text-2xl font-semibold mb-1 text-theme-primary">Get started on Pixagram</h1>
        <p className="text-theme-muted text-sm mb-5">Sign up to see photos and videos from your friends.</p>

        {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile preview" className="w-16 h-16 rounded-full object-cover border-4 border-theme shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-theme-input border-4 border-theme flex items-center justify-center">
                  <HiCamera className="text-theme-muted text-xl" />
                </div>
              )}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition-colors">
                <HiCamera className="text-white text-xs" />
                <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
          </div>

          <label className="text-sm mb-1 block text-theme-primary">Mobile number or email</label>
          <input type="text" name="email" value={form.email} onChange={handleChange} placeholder="Mobile number or email" className={`${inputClass} mb-2`} />
          <p className="text-xs text-theme-muted mb-3">
            You may receive notifications from us.{" "}
            <span className="text-blue-400 cursor-pointer hover:underline">Learn why we ask for your contact information</span>
          </p>

          <label className="text-sm mb-1 block text-theme-primary">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" className={`${inputClass} mb-5`} />

          <label className="text-sm mb-2 block text-theme-primary">Birthday</label>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <select name="month" value={form.month} onChange={handleChange} className={selectClass}>
              <option value="">Month</option>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => <option key={m}>{m}</option>)}
            </select>
            <select name="day" value={form.day} onChange={handleChange} className={selectClass}>
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => <option key={i+1}>{i+1}</option>)}
            </select>
            <select name="year" value={form.year} onChange={handleChange} className={selectClass}>
              <option value="">Year</option>
              {Array.from({ length: 50 }, (_, i) => <option key={2000-i}>{2000-i}</option>)}
            </select>
          </div>

          <label className="text-sm mb-1 block text-theme-primary">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full name" className={`${inputClass} mb-4`} />

          <label className="text-sm mb-1 block text-theme-primary">Username</label>
          <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Username" className={`${inputClass} mb-5`} />

          <p className="text-xs text-theme-muted mb-3">
            People who use our service may have uploaded your contact information to Instagram.{" "}
            <span className="text-blue-400 cursor-pointer hover:underline">Learn more.</span>
          </p>
          <p className="text-xs text-theme-muted mb-4">
            By tapping Submit, you agree to Instagram's{" "}
            <span className="text-blue-400 cursor-pointer hover:underline">Terms</span>,{" "}
            <span className="text-blue-400 cursor-pointer hover:underline">Privacy Policy</span> and{" "}
            <span className="text-blue-400 cursor-pointer hover:underline">Cookies Policy</span>.
          </p>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white transition py-3 rounded-full font-semibold mb-3 disabled:opacity-50">
            {loading ? "Creating account..." : "Submit"}
          </button>
          <button type="button" onClick={() => navigate("/login")} className="w-full border border-theme text-theme-secondary py-3 rounded-full bg-theme-hover transition">
            I already have an account
          </button>
        </form>
      </div>
    </div>
  );
}
