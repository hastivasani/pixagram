import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlane, FaHotel, FaCar, FaBus, FaTrain, FaUmbrellaBeach,
  FaUtensils, FaGlobe, FaBolt, FaCalendarCheck, FaSearch,
  FaMapMarkerAlt, FaFire, FaStar, FaTaxi
} from "react-icons/fa";

const CATEGORIES = [
  { id: "flights",     label: "Flights",     icon: FaPlane,         color: "from-blue-500 to-cyan-500",    path: "/booking/flights",     desc: "Search & book flights" },
  { id: "hotels",      label: "Hotels",      icon: FaHotel,         color: "from-purple-500 to-pink-500",  path: "/booking/hotels",      desc: "Find perfect stays" },
  { id: "cars",        label: "Car Rental",  icon: FaCar,           color: "from-green-500 to-teal-500",   path: "/booking/cars",        desc: "Rent a car anywhere" },
  { id: "buses",       label: "Buses",       icon: FaBus,           color: "from-orange-500 to-yellow-500",path: "/booking/buses",       desc: "Intercity bus travel" },
  { id: "trains",      label: "Trains",      icon: FaTrain,         color: "from-red-500 to-rose-500",     path: "/booking/trains",      desc: "Rail journeys" },
  { id: "tours",       label: "Tours",       icon: FaGlobe,         color: "from-indigo-500 to-blue-500",  path: "/booking/tours",       desc: "Guided tour packages" },
  { id: "restaurants", label: "Restaurants", icon: FaUtensils,      color: "from-pink-500 to-red-500",     path: "/booking/restaurants", desc: "Reserve a table" },
  { id: "holidays",    label: "Holidays",    icon: FaUmbrellaBeach, color: "from-yellow-500 to-orange-500",path: "/booking/holidays",    desc: "Holiday packages" },
  { id: "activities",  label: "Activities",  icon: FaBolt,          color: "from-teal-500 to-green-500",   path: "/booking/activities",  desc: "Experiences & adventures" },
  { id: "rides",       label: "Rides",       icon: FaTaxi,          color: "from-indigo-500 to-purple-500",path: "/booking/rides",       desc: "Auto, Cab & more" },
];

const DEALS = [
  { title: "Goa Beach Holiday", subtitle: "5 Nights • All Inclusive", price: "₹24,999", oldPrice: "₹39,999", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=250&fit=crop", tag: "38% OFF" },
  { title: "Dubai City Tour", subtitle: "3 Days • Guided", price: "₹18,500", oldPrice: "₹28,000", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop", tag: "HOT DEAL" },
  { title: "Manali Adventure", subtitle: "4 Nights • Adventure Pack", price: "₹12,999", oldPrice: "₹19,999", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=250&fit=crop", tag: "POPULAR" },
];

const POPULAR_DESTINATIONS = [
  { name: "Goa", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=200&h=200&fit=crop", trips: "2.4k trips" },
  { name: "Dubai", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&h=200&fit=crop", trips: "1.8k trips" },
  { name: "Paris", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&h=200&fit=crop", trips: "3.1k trips" },
  { name: "Bali", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&h=200&fit=crop", trips: "2.9k trips" },
  { name: "Manali", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=200&h=200&fit=crop", trips: "1.2k trips" },
  { name: "Singapore", img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=200&h=200&fit=crop", trips: "1.5k trips" },
];

export default function BookingHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/booking/hotels?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 px-4 pt-8 pb-8 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Travel & Booking</h1>
            <p className="text-white/80 text-sm">Flights, Hotels, Tours & more</p>
          </div>
          <button onClick={() => navigate("/booking/my-bookings")} className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur rounded-xl text-white text-sm">
            <FaCalendarCheck /> My Trips
          </button>
        </div>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search destinations, hotels, flights..."
            className="w-full pl-11 pr-28 py-4 rounded-2xl bg-white text-gray-800 outline-none text-sm shadow-lg"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium">
            Search
          </button>
        </form>

        {/* Categories Grid - inside hero */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(cat.path)}
                className="flex flex-col items-center gap-2 p-3 bg-white/15 backdrop-blur rounded-2xl hover:bg-white/25 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white text-xl" />
                </div>
                <span className="text-xs font-medium text-center leading-tight text-white">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 md:px-6 pt-6">

        {/* Hot Deals */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FaFire className="text-orange-500" />
            <h2 className="font-bold text-lg">Hot Deals</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {DEALS.map((deal, i) => (
              <div key={i} className="min-w-[260px] bg-theme-secondary rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => navigate("/booking/holidays")}>
                <div className="relative">
                  <img src={deal.img} alt={deal.title} className="w-full h-36 object-cover" />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{deal.tag}</span>
                </div>
                <div className="p-3">
                  <p className="font-semibold">{deal.title}</p>
                  <p className="text-xs text-theme-secondary mb-2">{deal.subtitle}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-400">{deal.price}</span>
                    <span className="text-xs text-theme-secondary line-through">{deal.oldPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FaMapMarkerAlt className="text-purple-500" />
            <h2 className="font-bold text-lg">Popular Destinations</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <button key={i} onClick={() => navigate(`/booking/hotels?search=${dest.name}`)}
                className="flex flex-col items-center gap-1 group">
                <div className="w-full aspect-square rounded-2xl overflow-hidden">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-sm font-medium">{dest.name}</p>
                <p className="text-xs text-theme-secondary">{dest.trips}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Why Book With Us */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "🔒", title: "Secure Booking", desc: "100% safe payments" },
            { icon: "💰", title: "Best Prices", desc: "Price match guarantee" },
            { icon: "🎧", title: "24/7 Support", desc: "Always here to help" },
            { icon: "⚡", title: "Instant Confirm", desc: "Instant confirmation" },
          ].map((item, i) => (
            <div key={i} className="bg-theme-secondary rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-theme-secondary mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
