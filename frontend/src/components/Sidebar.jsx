import React, { useState, useEffect } from "react";
import Notifications from "../pages/Notifications";
import SearchPanel from "../pages/Search";
import CreatePopup from "../pages/Create";
import MorePopup from "../pages/More";
import { NavLink } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import { getUnreadCount } from "../services/api";
import {
  HiOutlineHome, HiHome,
  HiOutlineSearch, HiSearch,
  HiOutlineGlobe, HiGlobe,
  HiOutlineChat, HiChat,
  HiOutlineBell, HiBell,
  HiOutlinePlusCircle, HiPlusCircle,
  HiOutlineUserCircle, HiUserCircle,
  HiOutlineVideoCamera, HiVideoCamera,
  HiOutlineDotsHorizontal, HiDotsHorizontal,
  HiOutlineStar, HiStar,
  HiCamera,
} from "react-icons/hi";

// Desktop sidebar shows all items
const ALL_NAV = [
  { to: "/",              label: "Home",           icon: HiOutlineHome,           activeIcon: HiHome },
  { to: "/reels",         label: "Reels",          icon: HiOutlineVideoCamera,    activeIcon: HiVideoCamera },
  { to: "/camera",        label: "Camera",         icon: HiCamera,                activeIcon: HiCamera },
  { to: "/messages",      label: "Messages",       icon: HiOutlineChat,           activeIcon: HiChat },
  { to: "/search",        label: "Search",         icon: HiOutlineSearch,         activeIcon: HiSearch },
  { to: "/explore",       label: "Explore",        icon: HiOutlineGlobe,          activeIcon: HiGlobe },
  { to: "/notifications", label: "Notifications",  icon: HiOutlineBell,           activeIcon: HiBell },
  { to: "/create",        label: "Create",         icon: HiOutlinePlusCircle,     activeIcon: HiPlusCircle },
  { to: "/profile",       label: "Profile",        icon: HiOutlineUserCircle,     activeIcon: HiUserCircle },
  { to: "/more",          label: "More",           icon: HiOutlineDotsHorizontal, activeIcon: HiDotsHorizontal },
  { to: "/meta",          label: "Also from Meta", icon: HiOutlineStar,           activeIcon: HiStar },
];

export default function Sidebar() {
  const { user: authUser } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openSearch,        setOpenSearch]        = useState(false);
  const [openCreate,        setOpenCreate]        = useState(false);
  const [openMore,          setOpenMore]          = useState(false);
  const [unreadCount,       setUnreadCount]       = useState(0);

  const user = { username: authUser?.username || "user", avatar: authUser?.avatar || null };

  useEffect(() => {
    if (!authUser?._id) return;
    getUnreadCount().then((r) => setUnreadCount(r.data.count)).catch(() => {});
  }, [authUser?._id]);

  useEffect(() => {
    if (!authUser?._id) return;
    const socket = getSocket(authUser._id);
    const h = () => setUnreadCount((c) => c + 1);
    socket.on("newNotification", h);
    return () => socket.off("newNotification", h);
  }, [authUser?._id]);

  const handleClick = (e, label) => {
    if (label === "Search")        { e.preventDefault(); setOpenSearch(true); }
    if (label === "Notifications") { e.preventDefault(); setUnreadCount(0); setOpenNotifications(true); }
    if (label === "Create")        { e.preventDefault(); setOpenCreate((s) => !s); }
    if (label === "More")          { e.preventDefault(); setOpenMore((s) => !s); }
  };

  return (
    <>
      {/* ── Desktop sidebar (md+) ─────────────────────────────── */}
      <div className="hidden md:flex w-16 h-screen border-r border-theme bg-theme-sidebar fixed left-0 top-0 flex-col items-center py-4 z-40 overflow-y-auto scrollbar-hide pb-6">
        {/* Logo */}
        <a href="/" className="mb-6 w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
          P
        </a>

        <nav className="flex-1 w-full flex flex-col items-center gap-0.5">
          {ALL_NAV.map((item, idx) => (
            <React.Fragment key={item.to}>
              {idx === ALL_NAV.length - 1 && <hr className="border-theme my-1 w-8" />}
              <div className="relative group w-full flex justify-center">
                <NavLink
                  to={item.to}
                  onClick={(e) => handleClick(e, item.label)}
                  className={({ isActive }) =>
                    `relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-theme-secondary text-purple-500"
                        : "text-theme-secondary hover:bg-theme-hover hover:text-theme-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? <item.activeIcon size={22} /> : <item.icon size={22} />}
                      {item.label === "Notifications" && unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </nav>

        {/* Avatar */}
        <div className="relative group mt-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-full ring-2 ring-purple-400 overflow-hidden cursor-pointer">
            {user.avatar
              ? <img src={user.avatar} alt="me" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
            }
          </div>
          <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {user.username}
          </span>
        </div>
      </div>

      {/* ── Mobile bottom nav (< md) ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-theme-sidebar border-t border-theme z-40 md:hidden safe-bottom">
        <div className="flex items-center overflow-x-auto scrollbar-hide px-1 py-1 gap-0">
          {ALL_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={(e) => handleClick(e, item.label)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-shrink-0 w-[14.28%] min-w-[52px] py-1.5 transition-colors ${
                  isActive ? "text-purple-500" : "text-theme-secondary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive ? <item.activeIcon size={20} /> : <item.icon size={20} />}
                    {item.label === "Notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] mt-0.5 leading-none truncate w-full text-center px-0.5">
                    {item.label === "Also from Meta" ? "Meta" : item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <CreatePopup openCreate={openCreate} onClose={() => setOpenCreate(false)} />
      <MorePopup   openMore={openMore}     onClose={() => setOpenMore(false)} />
      <Notifications open={openNotifications} setOpen={setOpenNotifications} />
      <SearchPanel   open={openSearch}        setOpen={setOpenSearch} />
    </>
  );
}
