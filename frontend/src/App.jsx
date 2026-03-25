import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SearchProvider } from "./Context/SearchContext";
import { ContentProvider } from "./Context/ContentContext";
import { AuthProvider } from "./Context/AuthContext";
import { ThemeProvider } from "./Context/ThemeContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Settings from "./components/Settings";
import Reels from "./pages/Reels";
import Camera from "./pages/Camera";
import Messages from "./pages/Messages";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Create from "./pages/Create";
import More from "./pages/More";
import Meta from "./pages/Meta";
import UserProfile from "./pages/UserProfile";
import IncomingCallListener from "./components/IncomingCallListener";
import ToastNotifications from "./components/ToastNotifications";
import LivePage from "./pages/Live";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SearchProvider>
          <AuthProvider>
            <ContentProvider>
              <div className="min-h-screen bg-theme-primary text-theme-primary transition-colors duration-300">
                <Routes>
                  <Route path="/login"    element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <IncomingCallListener />
                        <ToastNotifications />
                        {/* Sidebar fixed left, content offset by sidebar width */}
                        <Sidebar />
                        <div className="md:pl-16 w-full">
                          <Routes>
                            <Route path="/"                  element={<Home />} />
                            <Route path="/upload"            element={<Upload />} />
                            <Route path="/settings"          element={<Settings />} />
                            <Route path="/reels"             element={<Reels />} />
                            <Route path="/camera"            element={<Camera />} />
                            <Route path="/explore"           element={<Explore />} />
                            <Route path="/notifications"     element={<Notifications />} />
                            <Route path="/create"            element={<Create />} />
                            <Route path="/profile"           element={<Profile />} />
                            <Route path="/profile/:username" element={<UserProfile />} />
                            <Route path="/more"              element={<More />} />
                            <Route path="/meta"              element={<Meta />} />
                            <Route path="/live"              element={<LivePage />} />
                          </Routes>
                        </div>
                        {/* Messages outside wrapper — handles its own sidebar offset */}
                        <Routes>
                          <Route path="/messages" element={<Messages />} />
                        </Routes>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </ContentProvider>
          </AuthProvider>
        </SearchProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
