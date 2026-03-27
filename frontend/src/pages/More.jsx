import { useNavigate } from "react-router-dom";
import {
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineBookmark,
  HiOutlineMoon,
  HiSun,
  HiOutlineExclamationCircle,
  HiOutlineSwitchHorizontal,
  HiOutlineLogout,
  HiOutlineChat,
  HiOutlineGlobe,
  HiCamera,
} from "react-icons/hi";
import { FaGamepad, FaUsers, FaTwitter, FaShoppingBag, FaCalendarAlt, FaVideo, FaHeadphones, FaUserCircle } from "react-icons/fa";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthContext";

const QUICK_LINKS = [
  { to: "/messages",    label: "Messages",    icon: HiOutlineChat },
  { to: "/camera",      label: "Camera",      icon: HiCamera },
  { to: "/explore",     label: "Explore",     icon: HiOutlineGlobe },
  { to: "/groups",      label: "Groups",      icon: FaUsers },
  { to: "/twitter",     label: "Twitter",     icon: FaTwitter },
  { to: "/gaming",      label: "Gaming",      icon: FaGamepad },
  { to: "/shop",        label: "Shop",        icon: FaShoppingBag },
  { to: "/booking",     label: "Booking",     icon: FaCalendarAlt },
  { to: "/video",       label: "Videos",      icon: FaVideo },
  { to: "/voice-rooms", label: "Voice Rooms", icon: FaHeadphones },
  { to: "/profile",     label: "Profile",     icon: FaUserCircle },
];

export default function MorePopup({ openMore, onClose }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  if (!openMore) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const go = (path) => { onClose(); navigate(path); };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="fixed bottom-16 left-0 right-0 md:bottom-24 md:left-20 md:right-auto md:w-72 bg-theme-card border border-theme text-theme-primary rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto">

        {/* Quick Nav Links - only visible on mobile */}
        <div className="md:hidden px-4 pt-4 pb-2">
          <p className="text-xs text-theme-secondary font-semibold uppercase tracking-wider mb-3">Quick Access</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <button key={link.to} onClick={() => go(link.to)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-theme-hover transition-colors">
                  <Icon size={20} className="text-purple-400" />
                  <span className="text-[10px] text-theme-secondary leading-tight text-center">{link.label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-px bg-theme-secondary mb-2" />
        </div>

        <button onClick={() => go("/settings")} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineCog size={22} />
          <span>Settings</span>
        </button>

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineChartBar size={22} />
          <span>Your activity</span>
        </button>

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineBookmark size={22} />
          <span>Saved</span>
        </button>

        <button onClick={toggleTheme} className="flex items-center justify-between w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <div className="flex items-center gap-3">
            {isDark ? <HiSun size={22} className="text-yellow-400" /> : <HiOutlineMoon size={22} />}
            <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
          </div>
          <div className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors duration-300 flex-shrink-0 pointer-events-none ${isDark ? "bg-blue-500 justify-end" : "bg-gray-400 justify-start"}`}>
            <div className="w-5 h-5 bg-white rounded-full shadow-md" />
          </div>
        </button>

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineExclamationCircle size={22} />
          <span>Report a problem</span>
        </button>

        <div className="h-[6px] bg-theme-secondary" />

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Threads_%28app%29_logo.svg" className="w-5 h-5" alt="Threads" />
          <span>Threads</span>
        </button>

        <div className="h-[6px] bg-theme-secondary" />

        <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
          <HiOutlineSwitchHorizontal size={22} />
          <span>Switch accounts</span>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-red-500">
          <HiOutlineLogout size={22} />
          <span>Log out</span>
        </button>
      </div>
    </>
  );
}
