import { useState } from "react";
import { HiX } from "react-icons/hi";
import { updateProfile } from "../services/api";

export default function EditProfileModal({ isOpen, onClose, onSave, user }) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [website, setWebsite] = useState(user.website || "");
  const [gender, setGender] = useState(user.gender || "Prefer not to say");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("website", website);
      formData.append("gender", gender);
      if (avatarFile) formData.append("avatar", avatarFile);
      await updateProfile(formData);
      await onSave();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes.");
    } finally { setSaving(false); }
  };

  const inputClass = "w-full mt-1 px-3 py-2 border border-theme rounded-lg bg-theme-input text-theme-primary outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-theme-card rounded-2xl shadow-xl border border-theme">
          <div className="flex items-center justify-between p-5 border-b border-theme">
            <h2 className="text-xl font-bold text-theme-primary">Edit profile</h2>
            <button onClick={onClose} className="p-2 bg-theme-hover rounded-full">
              <HiX className="w-5 h-5 text-theme-secondary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex items-center gap-4">
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${user.username}`}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover"
              />
              <label className="text-sm text-blue-500 cursor-pointer hover:underline">
                Change photo
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-theme-secondary">Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-theme-secondary">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-theme-secondary">Bio</label>
              <textarea rows={3} value={bio} maxLength={150} onChange={(e) => setBio(e.target.value)} className={inputClass} />
              <div className="text-xs text-right text-theme-muted">{bio.length} / 150</div>
            </div>
            <div>
              <label className="text-sm font-medium text-theme-secondary">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
                <option>Prefer not to say</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2.5 rounded-lg disabled:opacity-60">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
