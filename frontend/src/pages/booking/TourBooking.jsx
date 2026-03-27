import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGlobe, FaArrowLeft, FaStar, FaClock, FaUsers, FaMapMarkerAlt, FaSearch } from "react-icons/fa";

const TOURS = [
  { id: 1, title: "Golden Triangle Tour", destinations: ["Delhi", "Agra", "Jaipur"], duration: "6 Days / 5 Nights", groupSize: "2-15", price: 18500, img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=250&fit=crop", rating: 4.8, reviews: 342, includes: ["Hotel", "Breakfast", "Guide", "Transport"], category: "Cultural", tag: "Bestseller" },
  { id: 2, title: "Kerala Backwaters", destinations: ["Kochi", "Alleppey", "Munnar"], duration: "5 Days / 4 Nights", groupSize: "2-10", price: 14999, img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=250&fit=crop", rating: 4.9, reviews: 218, includes: ["Houseboat", "All Meals", "Guide"], category: "Nature", tag: "Popular" },
  { id: 3, title: "Rajasthan Desert Safari", destinations: ["Jaisalmer", "Jodhpur", "Udaipur"], duration: "7 Days / 6 Nights", groupSize: "4-20", price: 22000, img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=250&fit=crop", rating: 4.7, reviews: 156, includes: ["Hotel", "Breakfast", "Camel Safari", "Guide"], category: "Adventure", tag: "" },
  { id: 4, title: "Himachal Adventure", destinations: ["Shimla", "Manali", "Kasol"], duration: "8 Days / 7 Nights", groupSize: "6-20", price: 16500, img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=250&fit=crop", rating: 4.6, reviews: 289, includes: ["Hotel", "Breakfast", "Trekking", "Guide"], category: "Adventure", tag: "Trending" },
  { id: 5, title: "Goa Beach Holiday", destinations: ["North Goa", "South Goa"], duration: "4 Days / 3 Nights", groupSize: "2-8", price: 9999, img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=250&fit=crop", rating: 4.5, reviews: 512, includes: ["Hotel", "Breakfast", "Water Sports"], category: "Beach", tag: "Budget" },
  { id: 6, title: "Andaman Island Escape", destinations: ["Port Blair", "Havelock", "Neil Island"], duration: "6 Days / 5 Nights", groupSize: "2-12", price: 28000, img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop", rating: 4.9, reviews: 178, includes: ["Hotel", "All Meals", "Snorkeling", "Ferry"], category: "Beach", tag: "Luxury" },
];

const CATEGORIES = ["All", "Cultural", "Nature", "Adventure", "Beach"];

export default function TourBooking() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [persons, setPersons] = useState(2);

  const filtered = TOURS.filter(t =>
    (category === "All" || t.category === category) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.destinations.some(d => d.toLowerCase().includes(search.toLowerCase())))
  );

  const handleBook = (tour) => {
    navigate("/booking/checkout", {
      state: {
        type: "tour",
        title: tour.title,
        subtitle: `${tour.destinations.join(" → ")} • ${tour.duration} • ${persons} Person${persons > 1 ? "s" : ""}`,
        price: tour.price * persons,
        details: { ...tour, persons },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div>
          <h1 className="font-bold text-white text-lg">Tour Packages</h1>
          <p className="text-white/80 text-xs">Guided tours & packages</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tours, destinations..."
            className="w-full pl-10 pr-4 py-3 bg-theme-secondary rounded-xl text-sm outline-none" />
        </div>

        {/* Persons */}
        <div className="flex items-center justify-between bg-theme-secondary rounded-xl px-4 py-3 mb-4">
          <span className="text-sm">Number of Persons</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setPersons(p => Math.max(1, p - 1))} className="w-8 h-8 bg-indigo-600 rounded-full text-white font-bold">-</button>
            <span className="font-bold w-6 text-center">{persons}</span>
            <button onClick={() => setPersons(p => p + 1)} className="w-8 h-8 bg-indigo-600 rounded-full text-white font-bold">+</button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${category === c ? "bg-indigo-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Tours */}
        <div className="space-y-4">
          {filtered.map(tour => (
            <div key={tour.id} className="bg-theme-secondary rounded-2xl overflow-hidden">
              <div className="relative">
                <img src={tour.img} alt={tour.title} className="w-full h-44 object-cover" />
                {tour.tag && <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{tour.tag}</span>}
                <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{tour.category}</span>
              </div>
              <div className="p-4">
                <p className="font-bold text-lg mb-1">{tour.title}</p>
                <p className="text-xs text-theme-secondary flex items-center gap-1 mb-2">
                  <FaMapMarkerAlt />{tour.destinations.join(" → ")}
                </p>
                <div className="flex items-center gap-4 text-xs text-theme-secondary mb-3">
                  <span className="flex items-center gap-1"><FaClock />{tour.duration}</span>
                  <span className="flex items-center gap-1"><FaUsers />{tour.groupSize} people</span>
                  <span className="flex items-center gap-1"><FaStar className="text-yellow-400" />{tour.rating} ({tour.reviews})</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tour.includes.map(inc => (
                    <span key={inc} className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">✓ {inc}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-indigo-400 text-lg">₹{(tour.price * persons).toLocaleString()}</p>
                    <p className="text-xs text-theme-secondary">₹{tour.price.toLocaleString()} × {persons} person{persons > 1 ? "s" : ""}</p>
                  </div>
                  <button onClick={() => handleBook(tour)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
                    Book Tour
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
