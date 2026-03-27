import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProfileByUsername, updateBioLinks } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { FaLink, FaPlus, FaTrash, FaEdit, FaCheck, FaInstagram, FaTwitter, FaYoutube, FaGithub, FaGlobe, FaTelegram, FaDiscord } from "react-icons/fa";

const PLATFORM_ICONS = {
  instagram: { icon: <FaInstagram/>, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  twitter:   { icon: <FaTwitter/>,   color: "bg-blue-500" },
  youtube:   { icon: <FaYoutube/>,   color: "bg-red-600" },
  github:    { icon: <FaGithub/>,    color: "bg-gray-700" },
  telegram:  { icon: <FaTelegram/>,  color: "bg-blue-400" },
  discord:   { icon: <FaDiscord/>,   color: "bg-indigo-600" },
  website:   { icon: <FaGlobe/>,     color: "bg-green-600" },
  other:     { icon: <FaLink/>,      color: "bg-purple-600" },
};

export default function BioLinks() {
  const { username } = useParams();
  const { user: me, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [links, setLinks]     = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "other" });

  const isOwn = !username || username === me?.username;

  useEffect(() => {
    if (isOwn) {
      setProfile(me);
      setLinks(me?.bioLinks || []);
    } else {
      getProfileByUsername(username).then(r => {
        setProfile(r.data);
        setLinks(r.data.bioLinks || []);
      }).catch(() => {});
    }
  }, [username, me]);

  const addLink = () => {
    if (!newLink.title || !newLink.url) return;
    const url = newLink.url.startsWith("http") ? newLink.url : "https://" + newLink.url;
    setLinks(l => [...l, { ...newLink, url }]);
    setNewLink({ title: "", url: "", icon: "other" });
  };

  const removeLink = (i) => setLinks(l => l.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      await updateBioLinks(links);
      await refreshUser?.();
      setEditing(false);
    } catch (_) {}
    setSaving(false);
  };

  if (!profile) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Profile header */}
        <div className="text-center mb-6">
          <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=random`}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-purple-500"/>
          <h1 className="text-xl font-bold text-theme-primary">{profile.name || profile.username}</h1>
          <p className="text-sm text-theme-muted">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-theme-secondary mt-2">{profile.bio}</p>}
        </div>

        {/* Links */}
        <div className="space-y-3 mb-4">
          {links.map((link, i) => {
            const platform = PLATFORM_ICONS[link.icon] || PLATFORM_ICONS.other;
            return (
              <div key={i} className="relative">
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-theme-card border border-theme rounded-2xl p-4 hover:border-purple-500 transition-all hover:shadow-lg group">
                  <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {platform.icon}
                  </div>
                  <span className="font-semibold text-theme-primary flex-1">{link.title}</span>
                  <span className="text-theme-muted text-xs group-hover:text-purple-400 transition">→</span>
                </a>
                {editing && (
                  <button onClick={() => removeLink(i)}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition">
                    <FaTrash size={8}/>
                  </button>
                )}
              </div>
            );
          })}
          {links.length === 0 && !editing && (
            <div className="text-center py-8 text-theme-muted">
              <FaLink size={32} className="mx-auto mb-2 opacity-20"/>
              <p className="text-sm">No links added yet</p>
            </div>
          )}
        </div>

        {/* Edit controls */}
        {isOwn && (
          <>
            {editing ? (
              <div className="bg-theme-card rounded-2xl p-4 border border-theme space-y-3">
                <p className="text-sm font-bold text-theme-primary">Add New Link</p>
                <input value={newLink.title} onChange={e => setNewLink(l => ({ ...l, title: e.target.value }))}
                  placeholder="Title (e.g. My YouTube)" className="w-full bg-theme-input text-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none border border-theme focus:border-purple-500"/>
                <input value={newLink.url} onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
                  placeholder="URL (e.g. youtube.com/...)" className="w-full bg-theme-input text-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none border border-theme focus:border-purple-500"/>
                <select value={newLink.icon} onChange={e => setNewLink(l => ({ ...l, icon: e.target.value }))}
                  className="w-full bg-theme-input text-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none border border-theme">
                  {Object.keys(PLATFORM_ICONS).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                </select>
                <button onClick={addLink} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                  <FaPlus size={12}/> Add Link
                </button>
                <div className="flex gap-2">
                  <button onClick={save} disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <FaCheck size={12}/> {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditing(false)} className="flex-1 bg-theme-input text-theme-muted py-2.5 rounded-xl text-sm hover:bg-theme-hover transition">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)}
                className="w-full bg-theme-card border border-theme hover:border-purple-500 text-theme-primary py-3 rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-2">
                <FaEdit size={12}/> Edit Links
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
