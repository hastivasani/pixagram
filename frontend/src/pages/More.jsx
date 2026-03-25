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
} from "react-icons/hi";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthContext";

export default function MorePopup({ openMore, onClose }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  if (!openMore) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="fixed bottom-24 left-20 w-72 bg-theme-card border border-theme text-theme-primary rounded-xl shadow-2xl overflow-hidden z-50">

      <button onClick={() => { onClose(); navigate("/settings"); }} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
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

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary"
      >
        <div className="flex items-center gap-3">
          {isDark ? <HiSun size={22} className="text-yellow-400" /> : <HiOutlineMoon size={22} />}
          <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
        </div>

        {/* Toggle pill */}
        <div
          className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors duration-300 flex-shrink-0 pointer-events-none ${
            isDark ? "bg-blue-500 justify-end" : "bg-gray-400 justify-start"
          }`}
        >
          <div className="w-5 h-5 bg-white rounded-full shadow-md" />
        </div>
      </button>

      <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
        <HiOutlineExclamationCircle size={22} />
        <span>Report a problem</span>
      </button>

      <div className="h-[6px] bg-theme-secondary" />

      <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/01/Threads_%28app%29_logo.svg"
          className="w-5 h-5"
          alt="Threads"
        />
        <span>Threads</span>
      </button>

      <div className="h-[6px] bg-theme-secondary" />

      <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-theme-primary">
        <HiOutlineSwitchHorizontal size={22} />
        <span>Switch accounts</span>
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-hover transition-colors text-red-500"
      >
        <HiOutlineLogout size={22} />
        <span>Log out</span>
      </button>
    </div>
    </>
  );
}
