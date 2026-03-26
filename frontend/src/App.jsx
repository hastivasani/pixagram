import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SearchProvider } from "./Context/SearchContext";
import { ContentProvider } from "./Context/ContentContext";
import { AuthProvider } from "./Context/AuthContext";
import { ThemeProvider } from "./Context/ThemeContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Eager load auth pages (small, needed immediately)
import Login from "./pages/Login";
import Register from "./pages/Register";

// Lazy load all other pages
const Home          = lazy(() => import("./pages/Home"));
const Profile       = lazy(() => import("./pages/Profile"));
const Upload        = lazy(() => import("./pages/Upload"));
const Settings      = lazy(() => import("./components/Settings"));
const Reels         = lazy(() => import("./pages/Reels"));
const Camera        = lazy(() => import("./pages/Camera"));
const Messages      = lazy(() => import("./pages/Messages"));
const Explore       = lazy(() => import("./pages/Explore"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Create        = lazy(() => import("./pages/Create"));
const More          = lazy(() => import("./pages/More"));
const Meta          = lazy(() => import("./pages/Meta"));
const UserProfile   = lazy(() => import("./pages/UserProfile"));
const LivePage      = lazy(() => import("./pages/Live"));
const IncomingCallListener = lazy(() => import("./components/IncomingCallListener"));
const ToastNotifications   = lazy(() => import("./components/ToastNotifications"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-primary">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
                        <Suspense fallback={null}>
                          <IncomingCallListener />
                          <ToastNotifications />
                        </Suspense>
                        <Sidebar />
                        <div className="md:pl-16 w-full">
                          <Suspense fallback={<PageLoader />}>
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
                          </Suspense>
                        </div>
                        <Suspense fallback={null}>
                          <Routes>
                            <Route path="/messages" element={<Messages />} />
                          </Routes>
                        </Suspense>
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
