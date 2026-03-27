import { useState, useEffect } from "react";
import { getCart, createOrder, clearCart } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaMapMarkerAlt, FaCreditCard, FaCheck } from "react-icons/fa";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart]       = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [step, setStep]       = useState(1); // 1=address, 2=payment, 3=confirm
  const [form, setForm]       = useState({
    fullName: "", address: "", city: "", state: "", zip: "", country: "US", phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderPlaced, setOrderPlaced]     = useState(null);

  useEffect(() => {
    getCart().then(r => { setCart(r.data || { items: [] }); setLoading(false); });
  }, []);

  const subtotal = cart.items?.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0) || 0;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await createOrder({
        shippingAddress: form,
        paymentMethod,
      });
      setOrderPlaced(res.data);
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (step === 3 && orderPlaced) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-theme-secondary mb-6">Your order #{orderPlaced._id?.slice(-8).toUpperCase()} has been placed successfully.</p>
          <div className="bg-theme-secondary rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm text-theme-secondary mb-1">Total</p>
            <p className="font-bold text-xl text-purple-400">${orderPlaced.total?.toFixed(2)}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/shop/orders")} className="flex-1 py-3 bg-purple-600 rounded-xl text-white font-medium">View Orders</button>
            <button onClick={() => navigate("/shop")} className="flex-1 py-3 bg-theme-secondary rounded-xl font-medium">Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-purple-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}>{s}</div>
            {s < 2 && <div className={`flex-1 h-0.5 w-12 ${step > s ? "bg-purple-600" : "bg-theme-secondary"}`} />}
          </div>
        ))}
        <span className="text-sm text-theme-secondary ml-2">{step === 1 ? "Shipping" : "Payment"}</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><FaMapMarkerAlt className="text-purple-400" /> Shipping Address</h2>
          {[
            { key: "fullName", label: "Full Name", placeholder: "John Doe" },
            { key: "address", label: "Address", placeholder: "123 Main St" },
            { key: "city", label: "City", placeholder: "New York" },
            { key: "state", label: "State", placeholder: "NY" },
            { key: "zip", label: "ZIP Code", placeholder: "10001" },
            { key: "phone", label: "Phone", placeholder: "+1 555 000 0000" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-sm text-theme-secondary mb-1 block">{label}</label>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm"
              />
            </div>
          ))}
          <button
            onClick={() => setStep(2)}
            disabled={!form.fullName || !form.address || !form.city}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-medium mt-4 transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><FaCreditCard className="text-purple-400" /> Payment Method</h2>
          {[
            { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
            { value: "wallet", label: "Wallet Balance", desc: "Use your in-app wallet" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPaymentMethod(opt.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors text-left ${paymentMethod === opt.value ? "border-purple-500 bg-purple-500/10" : "border-theme bg-theme-secondary"}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === opt.value ? "border-purple-500" : "border-gray-500"}`}>
                {paymentMethod === opt.value && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
              </div>
              <div>
                <p className="font-medium">{opt.label}</p>
                <p className="text-sm text-theme-secondary">{opt.desc}</p>
              </div>
            </button>
          ))}

          {/* Order Summary */}
          <div className="bg-theme-secondary rounded-2xl p-4 mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><FaShoppingBag /> Order Summary</h3>
            {cart.items?.map(item => (
              <div key={item.product?._id} className="flex justify-between text-sm py-1">
                <span className="text-theme-secondary">{item.product?.name} × {item.quantity}</span>
                <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-theme mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-purple-400">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 bg-theme-secondary rounded-xl font-medium">Back</button>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
            >
              {placing ? "Placing..." : `Place Order • $${subtotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
