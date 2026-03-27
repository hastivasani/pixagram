import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaSearch, FaMapMarkerAlt, FaDotCircle,
  FaStar, FaUsers, FaClock, FaExchangeAlt, FaMotorcycle,
  FaCar, FaShuttleVan, FaTaxi, FaBolt
} from "react-icons/fa";

const RIDE_TYPES = [
  {
    id: "auto",
    name: "Auto",
    icon: FaMotorcycle,
    desc: "Affordable 3-wheeler",
    basePrice: 30,
    perKm: 12,
    capacity: 3,
    eta: "3 min",
    color: "from-yellow-500 to-orange-500",
    badge: null,
  },
  {
    id: "mini",
    name: "Mini",
    icon: FaCar,
    desc: "Compact & budget-friendly",
    basePrice: 50,
    perKm: 14,
    capacity: 4,
    eta: "4 min",
    color: "from-blue-500 to-cyan-500",
    badge: null,
  },
  {
    id: "sedan",
    name: "Sedan",
    icon: FaTaxi,
    desc: "Comfortable sedan ride",
    basePrice: 70,
    perKm: 18,
    capacity: 4,
    eta: "5 min",
    color: "from-purple-500 to-indigo-500",
    badge: "Popular",
  },
  {
    id: "suv",
    name: "SUV",
    icon: FaShuttleVan,
    desc: "Spacious for groups",
    basePrice: 100,
    perKm: 24,
    capacity: 6,
    eta: "7 min",
    color: "from-green-500 to-teal-500",
    badge: null,
  },
  {
    id: "xl",
    name: "XL",
    icon: FaShuttleVan,
    desc: "Large vehicle, max comfort",
    basePrice: 130,
    perKm: 30,
    capacity: 7,
    eta: "10 min",
    color: "from-pink-500 to-rose-500",
    badge: "Premium",
  },
  {
    id: "electric",
    name: "Electric",
    icon: FaBolt,
    desc: "Eco-friendly EV ride",
    basePrice: 60,
    perKm: 15,
    capacity: 4,
    eta: "6 min",
    color: "from-emerald-500 to-green-400",
    badge: "Eco",
  },
];

const POPULAR_PLACES = [
  "Airport", "Railway Station", "Bus Stand", "City Mall",
  "Hospital", "IT Park", "University", "Metro Station",
];

const RECENT_RIDES = [
  { from: "Home", to: "Airport", dist: "18 km" },
  { from: "Office", to: "City Mall", dist: "6 km" },
  { from: "Hotel", to: "Railway Station", dist: "9 km" },
];

export default function RideBooking() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [distKm] = useState(Math.floor(Math.random() * 15) + 3);

  const swap = () => {
    const t = pickup;
    setPickup(drop);
    setDrop(t);
  };

  const getFare = (ride) => Math.round(ride.basePrice + ride.perKm * distKm);

  const handleSearch = () => {
    if (!pickup.trim() || !drop.trim()) return alert("Enter pickup and drop locations");
    setSearched(true);
    setSelectedRide(RIDE_TYPES[2]);
  };

  const handleBook = () => {
    if (!selectedRide) return;
    navigate("/booking/checkout", {
      state: {
        type: "ride",
        title: `${selectedRide.name} Ride`,
        subtitle: `${pickup} → ${drop} • ${distKm} km • ETA ${selectedRide.eta}`,
        price: getFare(selectedRide),
        details: { ...selectedRide, pickup, drop, distKm },
      },
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="font-bold text-white text-lg">Ride Booking</h1>
          <p className="text-white/80 text-xs">Auto, Cab &amp; more</p>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Location Input Card */}
        <div className="bg-theme-secondary rounded-2xl p-4 mb-4">
          <div className="flex items-stretch gap-3">
            <div className="flex flex-col items-center pt-3 pb-3 gap-1">
              <FaDotCircle className="text-indigo-500 text-sm flex-shrink-0" />
              <div className="flex-1 w-px bg-theme-primary min-h-[24px]" />
              <FaMapMarkerAlt className="text-red-500 text-sm flex-shrink-0" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-xs text-theme-secondary mb-1 block">Pickup Location</label>
                <input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup point"
                  className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1 block">Drop Location</label>
                <input
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  placeholder="Where to?"
                  className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={swap}
              className="self-center p-2 bg-indigo-500/20 rounded-full text-indigo-400 hover:bg-indigo-500/30 transition-colors"
            >
              <FaExchangeAlt className="rotate-90" />
            </button>
          </div>

          <button
            onClick={handleSearch}
            className="w-full mt-3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <FaSearch /> Find Rides
          </button>
        </div>

        {/* Quick Suggestions */}
        {!searched && (
          <>
            <p className="text-sm font-semibold mb-2">Popular Places</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {POPULAR_PLACES.map((place) => (
                <button
                  key={place}
                  onClick={() => setDrop(place)}
                  className="px-3 py-1.5 bg-theme-secondary rounded-full text-sm text-theme-secondary hover:text-indigo-400 transition-colors"
                >
                  {place}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold mb-2">Recent Rides</p>
            <div className="space-y-2">
              {RECENT_RIDES.map((r, i) => (
                <button
                  key={i}
                  onClick={() => { setPickup(r.from); setDrop(r.to); }}
                  className="w-full flex items-center gap-3 bg-theme-secondary rounded-xl p-3 hover:bg-theme-secondary/80 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-indigo-400 text-sm" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{r.from} → {r.to}</p>
                    <p className="text-xs text-theme-secondary">{r.dist}</p>
                  </div>
                  <FaMapMarkerAlt className="text-theme-secondary text-sm" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* Ride Options */}
        {searched && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Available Rides</p>
              <span className="text-xs text-theme-secondary bg-theme-secondary px-2 py-1 rounded-full">
                ~{distKm} km route
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {RIDE_TYPES.map((ride) => {
                const Icon = ride.icon;
                const fare = getFare(ride);
                const isSelected = selectedRide?.id === ride.id;
                return (
                  <button
                    key={ride.id}
                    onClick={() => setSelectedRide(ride)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-transparent bg-theme-secondary"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ride.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon className="text-white text-xl" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{ride.name}</p>
                        {ride.badge && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            ride.badge === "Popular" ? "bg-purple-500/20 text-purple-400" :
                            ride.badge === "Premium" ? "bg-pink-500/20 text-pink-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {ride.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-theme-secondary">{ride.desc}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-theme-secondary">
                          <FaUsers className="text-xs" /> {ride.capacity}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-theme-secondary">
                          <FaClock className="text-xs" /> {ride.eta}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-indigo-400 text-lg">₹{fare}</p>
                      <p className="text-xs text-theme-secondary">₹{ride.perKm}/km</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Fare Breakdown */}
            {selectedRide && (
              <div className="bg-theme-secondary rounded-2xl p-4 mb-4">
                <p className="font-semibold text-sm mb-3">Fare Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Base Fare</span>
                    <span>₹{selectedRide.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-secondary">Distance ({distKm} km × ₹{selectedRide.perKm})</span>
                    <span>₹{selectedRide.perKm * distKm}</span>
                  </div>
                  <div className="flex justify-between text-xs text-theme-secondary">
                    <span>Taxes &amp; Fees</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-theme">
                    <span>Total</span>
                    <span className="text-indigo-400">₹{getFare(selectedRide)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Driver Preview */}
            <div className="bg-theme-secondary rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                R
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Rajesh Kumar</p>
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-xs">4.8 • 1,240 trips</span>
                </div>
                <p className="text-xs text-theme-secondary">MH 12 AB 3456 • White Swift</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-green-400 font-medium">Nearby</p>
                <p className="text-xs text-theme-secondary">{selectedRide?.eta || "5 min"}</p>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBook}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/30"
            >
              <FaTaxi />
              Book {selectedRide?.name} — ₹{selectedRide ? getFare(selectedRide) : 0}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
