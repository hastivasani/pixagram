import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaHotel, FaArrowLeft, FaSearch, FaStar, FaWifi, FaSwimmingPool, FaParking, FaUtensils, FaMapMarkerAlt, FaFilter } from "react-icons/fa";

const MOCK_HOTELS = [
  { id: 1, name: "The Grand Palace Hotel", location: "Colaba, Mumbai", stars: 5, rating: 4.8, reviews: 1240, price: 8500, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop", amenities: ["wifi", "pool", "parking", "restaurant"], tag: "Bestseller" },
  { id: 2, name: "Comfort Inn Express", location: "Andheri, Mumbai", stars: 3, rating: 4.2, reviews: 856, price: 2800, img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop", amenities: ["wifi", "parking"], tag: "Budget Pick" },
  { id: 3, name: "Seaside Resort & Spa", location: "Juhu Beach, Mumbai", stars: 5, rating: 4.9, reviews: 2100, price: 12000, img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop", amenities: ["wifi", "pool", "restaurant"], tag: "Luxury" },
  { id: 4, name: "City Center Suites", location: "BKC, Mumbai", stars: 4, rating: 4.5, reviews: 634, price: 5200, img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=250&fit=crop", amenities: ["wifi", "parking", "restaurant"], tag: "" },
  { id: 5, name: "Heritage Haveli", location: "Old City, Jaipur", stars: 4, rating: 4.7, reviews: 980, price: 4500, img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=250&fit=crop", amenities: ["wifi", "pool", "restaurant"], tag: "Unique Stay" },
  { id: 6, name: "Mountain View Lodge", location: "Mall Road, Manali", stars: 3, rating: 4.3, reviews: 445, price: 3200, img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop", amenities: ["wifi", "parking"], tag: "" },
];

const AMENITY_ICONS = { wifi: { icon: FaWifi, label: "WiFi" }, pool: { icon: FaSwimmingPool, label: "Pool" }, parking: { icon: FaParking, label: "Parking" }, restaurant: { icon: FaUtensils, label: "Restaurant" } };

export default function HotelBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [city, setCity] = useState(searchParams.get("search") || "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [searched, setSearched] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [sortBy, setSortBy] = useState("rating");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minStars, setMinStars] = useState(0);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (searchParams.get("search")) { setHotels(MOCK_HOTELS); setSearched(true); }
  }, []);

  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 1;

  const handleSearch = () => {
    if (!city) return alert("Please enter a city");
    setHotels(MOCK_HOTELS);
    setSearched(true);
  };

  const filtered = hotels
    .filter(h => h.price <= maxPrice && h.stars >= minStars)
    .sort((a, b) => sortBy === "price" ? a.price - b.price : sortBy === "rating" ? b.rating - a.rating : b.stars - a.stars);

  const handleBook = (hotel) => {
    navigate("/booking/checkout", {
      state: {
        type: "hotel",
        title: hotel.name,
        subtitle: `${hotel.location} • ${nights} Night${nights > 1 ? "s" : ""} • ${rooms} Room${rooms > 1 ? "s" : ""} • ${guests} Guest${guests > 1 ? "s" : ""}`,
        price: hotel.price * nights * rooms,
        details: { ...hotel, checkIn, checkOut, rooms, guests, nights },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="font-bold text-white text-lg">Hotel Search</h1>
          <p className="text-white/80 text-xs">Find & book hotels</p>
        </div>
        <button onClick={() => setShowFilter(!showFilter)} className="p-2 rounded-xl bg-white/20 text-white"><FaFilter /></button>
      </div>

      <div className="px-4 py-4">
        {/* Search Form */}
        <div className="bg-theme-secondary rounded-2xl p-4 space-y-3 mb-4">
          <div>
            <label className="text-xs text-theme-secondary mb-1 block">City / Destination</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai, Goa, Delhi..."
                className="w-full pl-9 pr-4 py-2.5 bg-theme-primary rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Check-in</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]}
                className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Check-out</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split("T")[0]}
                className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Rooms</label>
              <select value={rooms} onChange={e => setRooms(Number(e.target.value))} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Room{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Guests</label>
              <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleSearch} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <FaSearch /> Search Hotels
          </button>
        </div>

        {/* Filters */}
        {showFilter && (
          <div className="bg-theme-secondary rounded-2xl p-4 mb-4 space-y-3">
            <p className="font-semibold">Filters</p>
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Max Price: ₹{maxPrice.toLocaleString()}/night</label>
              <input type="range" min={1000} max={20000} step={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-purple-600" />
            </div>
            <div>
              <label className="text-xs text-theme-secondary mb-2 block">Min Stars</label>
              <div className="flex gap-2">
                {[0,1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setMinStars(s)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${minStars === s ? "bg-purple-600 text-white" : "bg-theme-primary text-theme-secondary"}`}>
                    {s === 0 ? "All" : `${s}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {searched && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-theme-secondary">{filtered.length} hotels found {checkIn && checkOut ? `• ${nights} night${nights > 1 ? "s" : ""}` : ""}</p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-theme-secondary rounded-xl px-3 py-1.5 text-sm outline-none">
                <option value="rating">Top Rated</option>
                <option value="price">Cheapest</option>
                <option value="stars">Stars</option>
              </select>
            </div>
            <div className="space-y-4">
              {filtered.map(hotel => (
                <div key={hotel.id} className="bg-theme-secondary rounded-2xl overflow-hidden">
                  <div className="relative">
                    <img src={hotel.img} alt={hotel.name} className="w-full h-44 object-cover" />
                    {hotel.tag && <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{hotel.tag}</span>}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{hotel.name}</p>
                        <p className="text-xs text-theme-secondary flex items-center gap-1 mt-0.5"><FaMapMarkerAlt />{hotel.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-400 text-lg">₹{hotel.price.toLocaleString()}</p>
                        <p className="text-xs text-theme-secondary">per night</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(hotel.stars)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-xs" />)}
                      </div>
                      <span className="text-sm font-medium">{hotel.rating}</span>
                      <span className="text-xs text-theme-secondary">({hotel.reviews} reviews)</span>
                    </div>
                    <div className="flex gap-3 mb-3">
                      {hotel.amenities.map(a => {
                        const A = AMENITY_ICONS[a];
                        return A ? <span key={a} className="flex items-center gap-1 text-xs text-theme-secondary"><A.icon />{A.label}</span> : null;
                      })}
                    </div>
                    <div className="flex items-center justify-between">
                      {checkIn && checkOut && (
                        <p className="text-sm font-semibold text-green-400">Total: ₹{(hotel.price * nights * rooms).toLocaleString()}</p>
                      )}
                      <button onClick={() => handleBook(hotel)} className="ml-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
