import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaArrowLeft, FaSearch, FaGasPump, FaUsers, FaCog, FaStar, FaMapMarkerAlt } from "react-icons/fa";

const CARS = [
  { id: 1, name: "Maruti Swift", type: "Hatchback", img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=250&fit=crop", seats: 5, fuel: "Petrol", transmission: "Manual", price: 1200, rating: 4.3, reviews: 234, features: ["AC", "Music System", "GPS"] },
  { id: 2, name: "Honda City", type: "Sedan", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop", seats: 5, fuel: "Petrol", transmission: "Automatic", price: 1800, rating: 4.5, reviews: 189, features: ["AC", "Music System", "GPS", "Sunroof"] },
  { id: 3, name: "Toyota Innova", type: "SUV", img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=250&fit=crop", seats: 7, fuel: "Diesel", transmission: "Manual", price: 2500, rating: 4.7, reviews: 412, features: ["AC", "Music System", "GPS", "7 Seats"] },
  { id: 4, name: "BMW 3 Series", type: "Luxury", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop", seats: 5, fuel: "Petrol", transmission: "Automatic", price: 5500, rating: 4.9, reviews: 98, features: ["AC", "Premium Audio", "GPS", "Leather Seats"] },
  { id: 5, name: "Mahindra Thar", type: "4x4", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=250&fit=crop", seats: 4, fuel: "Diesel", transmission: "Manual", price: 3200, rating: 4.6, reviews: 156, features: ["4WD", "AC", "Music System"] },
  { id: 6, name: "Kia Seltos", type: "SUV", img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop", seats: 5, fuel: "Petrol", transmission: "Automatic", price: 2200, rating: 4.4, reviews: 267, features: ["AC", "Panoramic Roof", "GPS", "ADAS"] },
];

export default function CarBooking() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [searched, setSearched] = useState(false);
  const [filterType, setFilterType] = useState("All");

  const types = ["All", "Hatchback", "Sedan", "SUV", "Luxury", "4x4"];
  const days = pickupDate && returnDate ? Math.max(1, Math.ceil((new Date(returnDate) - new Date(pickupDate)) / 86400000)) : 1;

  const filtered = CARS.filter(c => filterType === "All" || c.type === filterType);

  const handleBook = (car) => {
    navigate("/booking/checkout", {
      state: {
        type: "car",
        title: `${car.name} - ${car.type}`,
        subtitle: `${pickup || "Pickup"} → ${dropoff || "Dropoff"} • ${days} Day${days > 1 ? "s" : ""} • ${car.transmission}`,
        price: car.price * days,
        details: { ...car, pickup, dropoff, pickupDate, returnDate, days },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-green-600 to-teal-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div>
          <h1 className="font-bold text-white text-lg">Car Rental</h1>
          <p className="text-white/80 text-xs">Self-drive & chauffeur cars</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-theme-secondary rounded-2xl p-4 space-y-3 mb-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Pickup Location</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                <input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="City or Airport"
                  className="w-full pl-9 pr-4 py-2.5 bg-theme-primary rounded-xl text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Drop-off Location</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                <input value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="Same as pickup or different"
                  className="w-full pl-9 pr-4 py-2.5 bg-theme-primary rounded-xl text-sm outline-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Pickup Date</label>
              <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Return Date</label>
              <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} min={pickupDate}
                className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
          </div>
          <button onClick={() => setSearched(true)} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <FaSearch /> Search Cars
          </button>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {types.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filterType === t ? "bg-green-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(car => (
            <div key={car.id} className="bg-theme-secondary rounded-2xl overflow-hidden">
              <img src={car.img} alt={car.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{car.name}</p>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{car.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">₹{car.price.toLocaleString()}</p>
                    <p className="text-xs text-theme-secondary">/day</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-theme-secondary mb-3">
                  <span className="flex items-center gap-1"><FaUsers />{car.seats} seats</span>
                  <span className="flex items-center gap-1"><FaGasPump />{car.fuel}</span>
                  <span className="flex items-center gap-1"><FaCog />{car.transmission}</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-sm font-medium">{car.rating}</span>
                  <span className="text-xs text-theme-secondary">({car.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  {days > 1 && <p className="text-sm font-semibold text-green-400">₹{(car.price * days).toLocaleString()} total</p>}
                  <button onClick={() => handleBook(car)} className="ml-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
                    Rent Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
