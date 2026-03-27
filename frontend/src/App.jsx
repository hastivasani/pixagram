import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SearchProvider } from "./Context/SearchContext";
import { ContentProvider } from "./Context/ContentContext";
import { AuthProvider } from "./Context/AuthContext";
import { ThemeProvider } from "./Context/ThemeContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Eager load auth pages
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Notifications from "./pages/Notifications";
import Create        from "./pages/Create";
import More          from "./pages/More";

// Lazy load all other pages
const Home          = lazy(() => import("./pages/Home"));
const Profile       = lazy(() => import("./pages/Profile"));
const Upload        = lazy(() => import("./pages/Upload"));
const Settings      = lazy(() => import("./components/Settings"));
const Reels         = lazy(() => import("./pages/Reels"));
const Camera        = lazy(() => import("./pages/Camera"));
const Messages      = lazy(() => import("./pages/Messages"));
const Explore       = lazy(() => import("./pages/Explore"));
const Meta          = lazy(() => import("./pages/Meta"));
const UserProfile   = lazy(() => import("./pages/UserProfile"));
const LivePage      = lazy(() => import("./pages/Live"));
const Gaming        = lazy(() => import("./pages/Gaming"));
const Groups        = lazy(() => import("./pages/Groups"));
const VoiceRooms    = lazy(() => import("./pages/VoiceRooms"));
const BioLinks      = lazy(() => import("./pages/BioLinks"));
const Twitter       = lazy(() => import("./pages/Twitter"));
const Shop          = lazy(() => import("./pages/Shop"));
const Checkout      = lazy(() => import("./pages/Checkout"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const BookingHome        = lazy(() => import("./pages/booking/BookingHome"));
const FlightBooking      = lazy(() => import("./pages/booking/FlightBooking"));
const HotelBooking       = lazy(() => import("./pages/booking/HotelBooking"));
const CarBooking         = lazy(() => import("./pages/booking/CarBooking"));
const BusBooking         = lazy(() => import("./pages/booking/BusBooking"));
const TrainBooking       = lazy(() => import("./pages/booking/TrainBooking"));
const TourBooking        = lazy(() => import("./pages/booking/TourBooking"));
const RestaurantBooking  = lazy(() => import("./pages/booking/RestaurantBooking"));
const HolidayBooking     = lazy(() => import("./pages/booking/HolidayBooking"));
const ActivitiesBooking  = lazy(() => import("./pages/booking/ActivitiesBooking"));
const RideBooking        = lazy(() => import("./pages/booking/RideBooking"));
const BookingCheckout    = lazy(() => import("./pages/booking/BookingCheckout"));
const MyBookings         = lazy(() => import("./pages/booking/MyBookings"));
const VideoHub           = lazy(() => import("./pages/VideoHub"));
const ForgotPassword     = lazy(() => import("./pages/ForgotPassword"));
const AdminPanel         = lazy(() => import("./pages/AdminPanel"));

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
                  <Route path="/login"           element={<Login />} />
                  <Route path="/register"        element={<Register />} />
                  <Route path="/forgot-password" element={<Suspense fallback={null}><ForgotPassword /></Suspense>} />
                  <Route path="/reset-password"  element={<Suspense fallback={null}><ForgotPassword /></Suspense>} />

                  {/* Admin — full screen, no sidebar */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AdminPanel />
                      </Suspense>
                    </ProtectedRoute>
                  } />

                  {/* Main app with sidebar */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <Suspense fallback={null}>
                        <IncomingCallListener />
                        <ToastNotifications />
                      </Suspense>
                      <Sidebar />
                      <div className="md:pl-16 w-full">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/"                      element={<Home />} />
                            <Route path="/upload"                element={<Upload />} />
                            <Route path="/settings"              element={<Settings />} />
                            <Route path="/reels"                 element={<Reels />} />
                            <Route path="/camera"                element={<Camera />} />
                            <Route path="/explore"               element={<Explore />} />
                            <Route path="/notifications"         element={<Notifications />} />
                            <Route path="/create"                element={<Create />} />
                            <Route path="/profile"               element={<Profile />} />
                            <Route path="/profile/:username"     element={<UserProfile />} />
                            <Route path="/more"                  element={<More />} />
                            <Route path="/meta"                  element={<Meta />} />
                            <Route path="/live"                  element={<LivePage />} />
                            <Route path="/gaming"                element={<Gaming />} />
                            <Route path="/groups"                element={<Groups />} />
                            <Route path="/voice-rooms"           element={<VoiceRooms />} />
                            <Route path="/bio-links"             element={<BioLinks />} />
                            <Route path="/bio-links/:username"   element={<BioLinks />} />
                            <Route path="/twitter"               element={<Twitter />} />
                            <Route path="/shop"                  element={<Shop />} />
                            <Route path="/shop/product/:id"      element={<ProductDetail />} />
                            <Route path="/shop/checkout"         element={<Checkout />} />
                            <Route path="/booking"               element={<BookingHome />} />
                            <Route path="/booking/flights"       element={<FlightBooking />} />
                            <Route path="/booking/hotels"        element={<HotelBooking />} />
                            <Route path="/booking/cars"          element={<CarBooking />} />
                            <Route path="/booking/buses"         element={<BusBooking />} />
                            <Route path="/booking/trains"        element={<TrainBooking />} />
                            <Route path="/booking/tours"         element={<TourBooking />} />
                            <Route path="/booking/restaurants"   element={<RestaurantBooking />} />
                            <Route path="/booking/holidays"      element={<HolidayBooking />} />
                            <Route path="/booking/activities"    element={<ActivitiesBooking />} />
                            <Route path="/booking/rides"         element={<RideBooking />} />
                            <Route path="/booking/checkout"      element={<BookingCheckout />} />
                            <Route path="/booking/my-bookings"   element={<MyBookings />} />
                            <Route path="/video"                 element={<VideoHub />} />
                          </Routes>
                        </Suspense>
                      </div>
                      <Suspense fallback={null}>
                        <Routes>
                          <Route path="/messages" element={<Messages />} />
                        </Routes>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </ContentProvider>
          </AuthProvider>
        </SearchProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
