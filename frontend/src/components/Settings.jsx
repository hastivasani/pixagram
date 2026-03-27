import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronRight, HiArrowLeft } from "react-icons/hi";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthContext";
import {
  updateProfile, changePassword, deleteAccount, togglePrivacy,
  getBlockedUsers, blockUser, updateNotificationSettings, updateMediaSettings,
  updateBioLinks, updateProfileMusic, updateProfileTheme, updateWordFilter,
  getLoginActivity,
} from "../services/api";

/* ── Reusable sub-components ─────────────────────────────────── */
const inputCls = "w-full px-3 py-2.5 border border-theme rounded-xl bg-theme-input text-theme-primary focus:ring-2 focus:ring-blue-500 outline-none text-sm";

const Toggle = ({ value, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${value ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${value ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

const Row = ({ label, desc, right, onClick, danger }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3.5 border-b border-theme last:border-0 transition-colors ${onClick ? "cursor-pointer hover:bg-theme-hover active:bg-theme-hover" : ""}`}
  >
    <div className="flex-1 min-w-0 pr-3">
      <p className={`text-[14px] font-medium ${danger ? "text-red-500" : "text-theme-primary"}`}>{label}</p>
      {desc && <p className="text-[12px] text-theme-muted mt-0.5 leading-snug">{desc}</p>}
    </div>
    {right !== undefined ? right : onClick ? <HiChevronRight size={18} className="text-theme-muted flex-shrink-0" /> : null}
  </div>
);

export default function Settings() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, refreshUser } = useAuth();

  // Mobile: null = list view, string = detail view
  const [activeSection, setActiveSection] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [msgText, setMsgText] = useState("");
  const [msgErr,  setMsgErr]  = useState(false);

  const [name,    setName]    = useState(user?.name    || "");
  const [bio,     setBio]     = useState(user?.bio     || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [gender,  setGender]  = useState(user?.gender  || "");
  const [avatar,  setAvatar]  = useState(null);
  const [curPwd,  setCurPwd]  = useState("");
  const [newPwd,  setNewPwd]  = useState("");
  const [cnfPwd,  setCnfPwd]  = useState("");
  const [isPrivate,  setIsPrivate]  = useState(user?.isPrivate || false);
  const [blocked,    setBlocked]    = useState([]);
  const [delPwd,     setDelPwd]     = useState("");
  const [delConfirm, setDelConfirm] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    postLikes:      user?.notificationSettings?.postLikes      ?? true,
    comments:       user?.notificationSettings?.comments       ?? true,
    followRequests: user?.notificationSettings?.followRequests ?? true,
    messages:       user?.notificationSettings?.messages       ?? true,
    streakReminder: user?.notificationSettings?.streakReminder ?? true,
    dailyChallenge: user?.notificationSettings?.dailyChallenge ?? true,
  });
  const [mediaSettings, setMediaSettings] = useState({
    autoplayVideos: user?.mediaSettings?.autoplayVideos ?? true,
    hdUploads:      user?.mediaSettings?.hdUploads      ?? true,
  });

  // New state for new features
  const [profileColor,  setProfileColor]  = useState(user?.profileColor  || "#a855f7");
  const [profileTheme,  setProfileTheme]  = useState(user?.profileTheme  || "default");
  const [profileMusic,  setProfileMusic]  = useState(user?.profileMusic  || "");
  const [profileMusicName, setProfileMusicName] = useState(user?.profileMusicName || "");
  const [wordFilter,    setWordFilter]    = useState((user?.wordFilter || []).join(", "));
  const [loginActivity, setLoginActivity] = useState([]);
  const [bioLinks,      setBioLinks]      = useState(user?.bioLinks || []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setWebsite(user.website || "");
      setGender(user.gender || "");
      setIsPrivate(user.isPrivate || false);
    }
  }, [user]);

  useEffect(() => {
    if (activeSection === "blocked") {
      getBlockedUsers().then(r => setBlocked(r.data)).catch(() => {});
    }
    if (activeSection === "login-activity") {
      getLoginActivity().then(r => setLoginActivity(r.data)).catch(() => {});
    }
  }, [activeSection]);

  const showMsg = (text, err = false) => {
    setMsgText(text); setMsgErr(err);
    setTimeout(() => setMsgText(""), 3000);
  };

  const MsgBanner = () => msgText ? (
    <div className={`px-4 py-2.5 rounded-xl text-sm mb-4 ${msgErr ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
      {msgText}
    </div>
  ) : null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name); fd.append("bio", bio);
      fd.append("website", website); fd.append("gender", gender);
      if (avatar) fd.append("avatar", avatar);
      await updateProfile(fd);
      await refreshUser();
      showMsg("Profile updated");
    } catch (e) { showMsg(e?.response?.data?.message || "Update failed", true); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPwd !== cnfPwd) return showMsg("Passwords don't match", true);
    if (newPwd.length < 6) return showMsg("Min 6 characters", true);
    setSaving(true);
    try {
      await changePassword({ currentPassword: curPwd, newPassword: newPwd });
      setCurPwd(""); setNewPwd(""); setCnfPwd("");
      showMsg("Password changed");
    } catch (e) { showMsg(e?.response?.data?.message || "Failed", true); }
    finally { setSaving(false); }
  };

  const handleTogglePrivacy = async () => {
    try { const r = await togglePrivacy(); setIsPrivate(r.data.isPrivate); await refreshUser(); }
    catch (_) {}
  };

  const handleNotifToggle = async (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    try { await updateNotificationSettings(updated); }
    catch (_) { setNotifSettings(notifSettings); }
  };

  const handleMediaToggle = async (key) => {
    const updated = { ...mediaSettings, [key]: !mediaSettings[key] };
    setMediaSettings(updated);
    try { await updateMediaSettings(updated); }
    catch (_) { setMediaSettings(mediaSettings); }
  };

  const handleUnblock = async (id) => {
    try { await blockUser(id); setBlocked(p => p.filter(u => u._id !== id)); }
    catch (_) {}
  };

  const handleDeleteAccount = async () => {
    if (!delPwd) return showMsg("Enter your password", true);
    setSaving(true);
    try { await deleteAccount({ password: delPwd }); logout(); navigate("/login"); }
    catch (e) { showMsg(e?.response?.data?.message || "Failed", true); }
    finally { setSaving(false); }
  };

  /* ── Section definitions ─────────────────────────────────── */
  const sections = [
    {
      group: "Account",
      items: [
        { key: "edit-profile",    label: "Edit profile" },
        { key: "change-password", label: "Change password" },
        { key: "account-privacy", label: "Account privacy" },
        { key: "close-friends",   label: "Close Friends" },
        { key: "blocked",         label: "Blocked accounts" },
        { key: "notifications",   label: "Notifications" },
        { key: "login-activity",  label: "Login Activity" },
        { key: "word-filter",     label: "Word Filter" },
      ],
    },
    {
      group: "Profile",
      items: [
        { key: "profile-theme",   label: "Profile Theme & Color" },
        { key: "profile-music",   label: "Profile Music" },
        { key: "bio-links",       label: "Bio Links", action: () => navigate("/bio-links") },
        { key: "analytics",       label: "Creator Analytics", action: () => navigate("/analytics") },
      ],
    },
    {
      group: "Preferences",
      items: [
        { key: "theme",           label: isDark ? "Switch to Light Mode" : "Switch to Dark Mode", action: toggleTheme },
        { key: "your-app-and-media", label: "App and media" },
        { key: "tags-and-mentions",  label: "Tags and mentions" },
        { key: "comments",           label: "Comments" },
      ],
    },
    {
      group: "Support",
      items: [
        { key: "more-info", label: "Help", action: () => window.open("https://help.instagram.com", "_blank") },
        { key: "privacy",   label: "Privacy Center", action: () => window.open("https://privacycenter.instagram.com", "_blank") },
      ],
    },
    {
      group: "Account actions",
      items: [
        { key: "logout",         label: "Log out",        danger: true, action: () => { logout(); navigate("/login"); } },
        { key: "delete-account", label: "Delete account", danger: true },
      ],
    },
  ];

  /* ── Detail content per section ─────────────────────────── */
  const renderDetail = (key) => {
    switch (key) {
      case "edit-profile": return (
        <div className="space-y-4 px-4 py-4">
          <MsgBanner />
          <div className="flex items-center gap-4 pb-2">
            <img
              src={avatar ? URL.createObjectURL(avatar) : (user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || "U"}`)}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              alt=""
            />
            <div>
              <p className="font-semibold text-theme-primary text-sm">{user?.username}</p>
              <label className="text-sm text-blue-500 cursor-pointer font-medium">
                Change photo
                <input type="file" accept="image/*" hidden onChange={e => setAvatar(e.target.files[0])} />
              </label>
            </div>
          </div>
          {[["Name", name, setName, "text"], ["Website", website, setWebsite, "url"]].map(([lbl, val, set, type]) => (
            <div key={lbl}>
              <label className="block text-xs font-semibold text-theme-muted mb-1 uppercase tracking-wide">{lbl}</label>
              <input type={type} value={val} onChange={e => set(e.target.value)} className={inputCls} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1 uppercase tracking-wide">Bio</label>
            <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} maxLength={150} className={inputCls + " resize-none"} />
            <p className="text-right text-xs text-theme-muted">{bio.length}/150</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1 uppercase tracking-wide">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className={inputCls}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      );

      case "change-password": return (
        <div className="space-y-4 px-4 py-4">
          <MsgBanner />
          {[["Current password", curPwd, setCurPwd], ["New password", newPwd, setNewPwd], ["Confirm new password", cnfPwd, setCnfPwd]].map(([lbl, val, set]) => (
            <div key={lbl}>
              <label className="block text-xs font-semibold text-theme-muted mb-1 uppercase tracking-wide">{lbl}</label>
              <input type="password" value={val} onChange={e => set(e.target.value)} className={inputCls} />
            </div>
          ))}
          <button onClick={handleChangePassword} disabled={saving}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition">
            {saving ? "Changing..." : "Change password"}
          </button>
        </div>
      );

      case "account-privacy": return (
        <div>
          <Row
            label="Private account"
            desc="When private, only approved followers can see your posts."
            right={<Toggle value={isPrivate} onChange={handleTogglePrivacy} />}
          />
          <p className="px-4 py-3 text-xs text-theme-muted">
            Status: <span className="font-semibold">{isPrivate ? "Private" : "Public"}</span>
          </p>
        </div>
      );

      case "blocked": return (
        <div>
          {blocked.length === 0
            ? <p className="px-4 py-6 text-sm text-theme-muted text-center">No blocked accounts.</p>
            : blocked.map(u => (
              <div key={u._id} className="flex items-center gap-3 px-4 py-3 border-b border-theme last:border-0">
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-theme-primary truncate">{u.username}</p>
                  {u.name && <p className="text-xs text-theme-muted truncate">{u.name}</p>}
                </div>
                <button onClick={() => handleUnblock(u._id)}
                  className="text-xs text-blue-500 font-semibold border border-blue-400 px-3 py-1.5 rounded-lg flex-shrink-0">
                  Unblock
                </button>
              </div>
            ))
          }
        </div>
      );

      case "notifications": return (
        <div>
          {[
            ["postLikes",      "Post likes",       "When someone likes your post"],
            ["comments",       "Comments",         "When someone comments on your post"],
            ["followRequests", "Follow requests",  "When someone sends a follow request"],
            ["messages",       "Messages",         "When you receive a new message"],
            ["streakReminder", "Streak Reminder",  "Daily reminder to keep your streak"],
            ["dailyChallenge", "Daily Challenge",  "Reminder for gaming daily challenge"],
          ].map(([key, lbl, desc]) => (
            <Row key={key} label={lbl} desc={desc} right={<Toggle value={notifSettings[key]} onChange={() => handleNotifToggle(key)} />} />
          ))}
        </div>
      );

      case "your-app-and-media": return (
        <div>
          <Row label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"} right={<Toggle value={isDark} onChange={toggleTheme} />} />
          <Row label="Autoplay videos" desc="Automatically play videos as you scroll" right={<Toggle value={mediaSettings.autoplayVideos} onChange={() => handleMediaToggle("autoplayVideos")} />} />
          <Row label="Upload in HD" desc="Upload photos and videos in higher quality" right={<Toggle value={mediaSettings.hdUploads} onChange={() => handleMediaToggle("hdUploads")} />} />
        </div>
      );

      case "tags-and-mentions": return (
        <div>
          {["Tags", "Mentions"].map(l => <Row key={l} label={l} onClick={() => {}} />)}
        </div>
      );

      case "comments": return (
        <div>
          {["Allow comments from", "Filter offensive comments"].map(l => <Row key={l} label={l} onClick={() => {}} />)}
        </div>
      );

      case "delete-account": return (
        <div className="px-4 py-4 space-y-4">
          <MsgBanner />
          <p className="text-sm text-theme-secondary leading-relaxed">
            This action is <strong>permanent</strong> and cannot be undone. All your posts, stories, reels, and data will be deleted.
          </p>
          {!delConfirm ? (
            <button onClick={() => setDelConfirm(true)}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition">
              I want to delete my account
            </button>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-theme-muted mb-1 uppercase tracking-wide">Enter password to confirm</label>
                <input type="password" value={delPwd} onChange={e => setDelPwd(e.target.value)} className={inputCls} />
              </div>
              <button onClick={handleDeleteAccount} disabled={saving}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition">
                {saving ? "Deleting..." : "Permanently delete account"}
              </button>
              <button onClick={() => setDelConfirm(false)} className="w-full py-2 text-sm text-theme-muted">Cancel</button>
            </>
          )}
        </div>
      );

      case "login-activity": return (
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs text-theme-muted">Recent login sessions (last 20)</p>
          {loginActivity.length === 0 && <p className="text-sm text-theme-muted text-center py-6">No activity recorded</p>}
          {loginActivity.map((a, i) => (
            <div key={i} className={`bg-theme-card rounded-xl p-3 border ${a.success ? "border-theme" : "border-red-500/30"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${a.success ? "text-green-400" : "text-red-400"}`}>{a.success ? "✓ Success" : "✗ Failed"}</span>
                <span className="text-xs text-theme-muted">{new Date(a.loginAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-theme-secondary truncate">{a.device || "Unknown device"}</p>
              <p className="text-xs text-theme-muted">{a.ip || "Unknown IP"}</p>
            </div>
          ))}
        </div>
      );

      case "word-filter": return (
        <div className="px-4 py-4 space-y-3">
          <p className="text-xs text-theme-muted">Comments containing these words will be hidden. Separate with commas.</p>
          <textarea rows={4} value={wordFilter} onChange={e => setWordFilter(e.target.value)}
            placeholder="spam, hate, offensive..."
            className={inputCls + " resize-none"}/>
          <button onClick={async () => {
            const words = wordFilter.split(",").map(w => w.trim()).filter(Boolean);
            try { await updateWordFilter(words); showMsg("Word filter updated"); } catch (_) { showMsg("Failed", true); }
          }} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition">
            Save Filter
          </button>
        </div>
      );

      case "close-friends": return (
        <div className="px-4 py-4">
          <p className="text-xs text-theme-muted mb-3">Close friends can see your exclusive stories. Manage from your profile page.</p>
          <button onClick={() => navigate("/profile")} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition">
            Go to Profile
          </button>
        </div>
      );

      case "profile-theme": return (
        <div className="px-4 py-4 space-y-4">
          <MsgBanner/>
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-2 uppercase tracking-wide">Profile Color</label>
            <div className="flex gap-2 flex-wrap">
              {["#a855f7","#3b82f6","#ef4444","#22c55e","#f59e0b","#ec4899","#14b8a6","#f97316"].map(c => (
                <button key={c} onClick={() => setProfileColor(c)}
                  className={`w-10 h-10 rounded-full border-4 transition ${profileColor === c ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}/>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-2 uppercase tracking-wide">Profile Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {["default","minimal","gradient","neon","retro","glass"].map(t => (
                <button key={t} onClick={() => setProfileTheme(t)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize transition border-2 ${profileTheme === t ? "border-purple-500 bg-purple-500/20 text-purple-400" : "border-theme bg-theme-input text-theme-muted"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={async () => {
            try { await updateProfileTheme({ profileTheme, profileColor }); await refreshUser(); showMsg("Theme updated"); }
            catch (_) { showMsg("Failed", true); }
          }} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition">
            Save Theme
          </button>
        </div>
      );

      case "profile-music": return (
        <div className="px-4 py-4 space-y-3">
          <MsgBanner/>
          <p className="text-xs text-theme-muted">Add a music URL that plays on your profile (MP3/audio link).</p>
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1 uppercase tracking-wide">Song Name</label>
            <input value={profileMusicName} onChange={e => setProfileMusicName(e.target.value)} placeholder="e.g. Blinding Lights" className={inputCls}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1 uppercase tracking-wide">Audio URL</label>
            <input value={profileMusic} onChange={e => setProfileMusic(e.target.value)} placeholder="https://..." className={inputCls}/>
          </div>
          {profileMusic && (
            <audio controls src={profileMusic} className="w-full rounded-xl"/>
          )}
          <button onClick={async () => {
            try { await updateProfileMusic({ profileMusic, profileMusicName }); await refreshUser(); showMsg("Music updated"); }
            catch (_) { showMsg("Failed", true); }
          }} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition">
            Save Music
          </button>
          {profileMusic && (
            <button onClick={async () => {
              try { await updateProfileMusic({ profileMusic: "", profileMusicName: "" }); setProfileMusic(""); setProfileMusicName(""); await refreshUser(); showMsg("Music removed"); }
              catch (_) {}
            }} className="w-full py-2 text-sm text-red-400 hover:text-red-300 transition">Remove Music</button>
          )}
        </div>
      );
    }
  };

  const getSectionTitle = (key) => {
    const all = sections.flatMap(g => g.items);
    return all.find(i => i.key === key)?.label || key;
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="bg-theme-primary min-h-screen pb-[68px] md:pb-0 overflow-x-hidden">

      {/* ── MOBILE: show detail page when section selected ── */}
      {activeSection && (
        <div className="md:hidden flex flex-col min-h-screen bg-theme-primary">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-theme bg-theme-card flex-shrink-0 sticky top-0 z-10">
            <button onClick={() => setActiveSection(null)} className="p-1.5 -ml-1 text-theme-primary">
              <HiArrowLeft size={22} />
            </button>
            <h2 className="text-base font-semibold text-theme-primary">{getSectionTitle(activeSection)}</h2>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {renderDetail(activeSection)}
          </div>
        </div>
      )}

      {/* ── MOBILE: list view (hidden when detail open) ── */}
      <div className={`md:hidden ${activeSection ? "hidden" : "block"}`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-theme bg-theme-card sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 text-theme-primary">
            <HiArrowLeft size={22} />
          </button>
          <h1 className="text-base font-semibold text-theme-primary">Settings</h1>
        </div>

        {/* Section groups */}
        <div className="pb-4">
          {sections.map((group) => (
            <div key={group.group} className="mt-4">
              <p className="px-4 pb-1 text-[11px] font-semibold text-theme-muted uppercase tracking-wider">
                {group.group}
              </p>
              <div className="bg-theme-card border-y border-theme">
                {group.items.map((item) => (
                  <Row
                    key={item.key}
                    label={item.label}
                    danger={item.danger}
                    onClick={item.action || (() => setActiveSection(item.key))}
                    right={item.action && !item.danger ? null : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP: two-column layout ── */}
      <div className="hidden md:flex h-screen">
        {/* Left nav */}
        <div className="w-64 xl:w-72 border-r border-theme bg-theme-card overflow-y-auto flex-shrink-0">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-theme">
            <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 text-theme-primary hover:bg-theme-hover rounded-full transition">
              <HiArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-theme-primary">Settings</h1>
          </div>
          <div className="py-2">
            {sections.map((group) => (
              <div key={group.group} className="mb-1">
                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-theme-muted uppercase tracking-wider">
                  {group.group}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={item.action || (() => setActiveSection(item.key))}
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-lg mx-1 transition-colors ${
                      activeSection === item.key
                        ? "bg-theme-hover font-semibold text-theme-primary"
                        : item.danger
                        ? "text-red-500 hover:bg-theme-hover"
                        : "text-theme-secondary hover:bg-theme-hover hover:text-theme-primary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 overflow-y-auto">
          {activeSection ? (
            <>
              <div className="px-6 py-5 border-b border-theme">
                <h2 className="text-xl font-bold text-theme-primary">{getSectionTitle(activeSection)}</h2>
              </div>
              <div className="max-w-xl px-2 py-2">
                {renderDetail(activeSection)}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-theme-muted text-sm">
              Select a setting from the left
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
