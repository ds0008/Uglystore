import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, CreditCard, CheckCircle, ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { PAYMENT_METHODS } from "../lib/constants";
import { formatPrice } from "../lib/formatters";
import AddressForm from "../components/AddressForm";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Confirm", icon: CheckCircle },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${active ? "bg-black text-white" : done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
              <Icon size={16} />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-8 h-0.5 mx-1 ${done ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const { items, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [address, setAddress] = useState({
    name: user?.fullName || "",
    phone: "",
    division: "",
    district: "",
    upazila: "",
    detail: "",
  });

  const shippingCost = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Cart is empty</h2>
        <Link to="/products" className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const isAddressValid = address.name && address.phone && address.division && address.district && address.upazila && address.detail;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await api.post("/orders", {
        paymentMethod,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: `${address.name}, ${address.phone}, ${address.detail}, ${address.upazila}, ${address.district}, ${address.division}`,
      });
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-4">
        <ArrowLeft size={16} /> Back to cart
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
      <StepIndicator current={step} />

      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <AddressForm address={address} onChange={setAddress} />
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!isAddressValid}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setPaymentMethod(m.value)}
                className={`p-4 border-2 rounded-xl text-left transition ${paymentMethod === m.value ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <span className="text-2xl block mb-1">
                  {m.value === "CASH_ON_DELIVERY" ? "💵" : m.value === "BKASH" ? "📱" : m.value === "NAGAD" ? "📲" : "💳"}
                </span>
                <span className="font-medium text-sm text-gray-900">{m.label}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="px-6 py-2.5 text-gray-600 hover:text-black transition font-medium">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping To</h3>
            <p className="text-sm text-gray-900 font-medium">{address.name}</p>
            <p className="text-sm text-gray-600">{address.phone}</p>
            <p className="text-sm text-gray-600">{address.detail}</p>
            <p className="text-sm text-gray-600">{address.upazila}, {address.district}, {address.division}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Payment</h3>
            <p className="text-sm text-gray-900 font-medium">
              {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Items ({items.length})</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.name} x{item.quantity}</span>
                  <span className="text-gray-900 font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="px-6 py-2.5 text-gray-600 hover:text-black transition font-medium">
              Back
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="px-8 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {placing ? "Placing Order..." : `Pay ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
