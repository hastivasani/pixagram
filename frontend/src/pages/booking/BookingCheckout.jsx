import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaCreditCard, FaMobileAlt, FaUniversity, FaLock, FaTicketAlt } from "react-icons/fa";

const TYPE_ICONS = {
  flight: "✈️", hotel: "🏨", car: "🚗", bus: "🚌",
  train: "🚂", tour: "🗺️", restaurant: "🍽️", holiday: "🏖️", activity: "⚡", ride: "🚕",
};

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: FaCreditCard },
  { id: "upi", label: "UPI Payment", icon: FaMobileAlt },
  { id: "netbanking", label: "Net Banking", icon: FaUniversity },
];

export default function BookingCheckout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [step, setStep] = useState(1); // 1: details, 2: payment, 3: confirmed
  const [payMethod, setPayMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [bookingId] = useState("BK" + Math.random().toString(36).substr(2, 8).toUpperCase());

  // Traveler details
  const [traveler, setTraveler] = useState({ name: "", email: "", phone: "", age: "" });
  const set = (k, v) => setTraveler(p => ({ ...p, [k]: v }));

  // Card details
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const setC = (k, v) => setCard(p => ({ ...p, [k]: v }));

  // UPI
  const [upi, setUpi] = useState("");

  if (!state) return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center">
      <div className="text-center">
        <p className="text-theme-secondary mb-4">No booking data found</p>
        <button onClick={() => navigate("/booking")} className="px-6 py-3 bg-purple-600 text-white rounded-xl">Go to Booking</button>
      </div>
    </div>
  );

  const { type, title, subtitle, price, details } = state;
  const taxes = Math.round(price * 0.05);
  const convenience = price > 0 ? 99 : 0;
  const total = price + taxes + convenience;

  const handlePayment = async () => {
    if (payMethod === "card" && (!card.number || !card.expiry || !card.cvv || !card.name)) return alert("Please fill card details");
    if (payMethod === "upi" && !upi) return alert("Please enter UPI ID");
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setStep(3);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-theme-primary text-theme-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <FaCheck className="text-4xl text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-theme-secondary mb-6">Your booking has been successfully confirmed.</p>

          <div className="bg-theme-secondary rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{TYPE_ICONS[type] || "📋"}</span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-xs text-theme-secondary">{subtitle}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-theme-secondary">Booking ID</span>
                <span className="font-bold text-purple-400">{bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-secondary">Amount Paid</span>
                <span className="font-bold text-green-400">{price > 0 ? `₹${total.toLocaleString()}` : "FREE"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-secondary">Status</span>
                <span className="font-bold text-green-400">Confirmed ✓</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/booking/my-bookings")}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <FaTicketAlt /> My Bookings
            </button>
            <button onClick={() => navigate("/booking")}
              className="flex-1 py-3 bg-theme-secondary rounded-xl font-medium transition-colors">
              Book More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-theme-primary/90 backdrop-blur border-b border-theme px-4 py-3 flex items-center gap-3">
        <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="p-2 rounded-xl hover:bg-theme-secondary"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="font-bold">{step === 1 ? "Traveler Details" : "Payment"}</h1>
          <p className="text-xs text-theme-secondary">Step {step} of 2</p>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-8 h-1.5 rounded-full ${step >= 1 ? "bg-purple-600" : "bg-theme-secondary"}`} />
          <div className={`w-8 h-1.5 rounded-full ${step >= 2 ? "bg-purple-600" : "bg-theme-secondary"}`} />
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Booking Summary */}
        <div className="bg-theme-secondary rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{TYPE_ICONS[type] || "📋"}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold line-clamp-1">{title}</p>
              <p className="text-xs text-theme-secondary line-clamp-2">{subtitle}</p>
            </div>
          </div>
          {price > 0 && (
            <div className="mt-3 pt-3 border-t border-theme space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-theme-secondary">Base Price</span><span>₹{price.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-theme-secondary">Taxes (5%)</span><span>₹{taxes.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-theme-secondary">Convenience Fee</span><span>₹{convenience}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-theme">
                <span>Total</span><span className="text-purple-400">₹{total.toLocaleString()}</span>
              </div>
            </div>
          )}
          {price === 0 && <p className="text-center text-green-400 font-bold mt-2">Free Reservation</p>}
        </div>

        {/* Step 1: Traveler Details */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="font-semibold">Primary Traveler</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-theme-secondary mb-1 block">Full Name *</label>
                <input value={traveler.name} onChange={e => set("name", e.target.value)} placeholder="As per ID proof"
                  className="w-full bg-theme-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1 block">Email *</label>
                <input type="email" value={traveler.email} onChange={e => set("email", e.target.value)} placeholder="Booking confirmation will be sent here"
                  className="w-full bg-theme-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-xs text-theme-secondary mb-1 block">Phone Number *</label>
                <input type="tel" value={traveler.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-theme-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              {(type === "flight" || type === "bus" || type === "train") && (
                <div>
                  <label className="text-xs text-theme-secondary mb-1 block">Age</label>
                  <input type="number" value={traveler.age} onChange={e => set("age", e.target.value)} placeholder="Age"
                    className="w-full bg-theme-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              )}
            </div>
            <button
              onClick={() => { if (!traveler.name || !traveler.email || !traveler.phone) return alert("Please fill required fields"); setStep(2); }}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors">
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="font-semibold">Select Payment Method</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(pm => {
                const Icon = pm.icon;
                return (
                  <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${payMethod === pm.id ? "border-purple-600 bg-purple-600/10" : "border-theme bg-theme-secondary"}`}>
                    <Icon className={payMethod === pm.id ? "text-purple-400" : "text-theme-secondary"} />
                    <span className="font-medium text-sm">{pm.label}</span>
                    {payMethod === pm.id && <FaCheck className="ml-auto text-purple-400" />}
                  </button>
                );
              })}
            </div>

            {/* Card Form */}
            {payMethod === "card" && (
              <div className="bg-theme-secondary rounded-2xl p-4 space-y-3">
                <div>
                  <label className="text-xs text-theme-secondary mb-1 block">Card Number</label>
                  <input value={card.number} onChange={e => setC("number", e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="1234 5678 9012 3456" className="w-full bg-theme-primary rounded-xl px-4 py-3 text-sm outline-none font-mono" />
                </div>
                <div>
                  <label className="text-xs text-theme-secondary mb-1 block">Cardholder Name</label>
                  <input value={card.name} onChange={e => setC("name", e.target.value)} placeholder="Name on card"
                    className="w-full bg-theme-primary rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-theme-secondary mb-1 block">Expiry (MM/YY)</label>
                    <input value={card.expiry} onChange={e => setC("expiry", e.target.value)} placeholder="MM/YY"
                      className="w-full bg-theme-primary rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-theme-secondary mb-1 block">CVV</label>
                    <input type="password" value={card.cvv} onChange={e => setC("cvv", e.target.value.slice(0, 3))} placeholder="•••"
                      className="w-full bg-theme-primary rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Form */}
            {payMethod === "upi" && (
              <div className="bg-theme-secondary rounded-2xl p-4">
                <label className="text-xs text-theme-secondary mb-1 block">UPI ID</label>
                <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi"
                  className="w-full bg-theme-primary rounded-xl px-4 py-3 text-sm outline-none" />
                <p className="text-xs text-theme-secondary mt-2">e.g. 9876543210@paytm, name@gpay</p>
              </div>
            )}

            {/* Net Banking */}
            {payMethod === "netbanking" && (
              <div className="bg-theme-secondary rounded-2xl p-4">
                <label className="text-xs text-theme-secondary mb-2 block">Select Bank</label>
                <select className="w-full bg-theme-primary rounded-xl px-4 py-3 text-sm outline-none">
                  {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "PNB", "Bank of Baroda"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-theme-secondary bg-theme-secondary rounded-xl p-3">
              <FaLock className="text-green-400 flex-shrink-0" />
              <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>

            <button onClick={handlePayment} disabled={processing}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              {processing ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <><FaLock /> Pay {price > 0 ? `₹${total.toLocaleString()}` : "& Confirm"}</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
