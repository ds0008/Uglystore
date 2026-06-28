import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatPrice } from "../lib/formatters";
import { PAYMENT_METHODS } from "../lib/constants";
import { trackPurchase, trackInitiateCheckout } from "../lib/pixel";
import AddressForm from "../components/AddressForm";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Confirm", icon: ShoppingBag },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            step.id === current
              ? "bg-black text-white"
              : step.id < current
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-400"
          }`}>
            {step.id < current ? (
              <Check className="w-4 h-4" />
            ) : (
              <step.icon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{step.label}</span>
            <span className="sm:hidden">{step.id}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-8 h-0.5 mx-1 ${step.id < current ? "bg-green-300" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart, subtotal } = useCart();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [address, setAddress] = useState({
    fullName: user?.fullName || "",
    phone: "",
    division: "",
    district: "",
    upazila: "",
    thana: "",
    addressLine: "",
  });

  const shippingCost = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const validateAddress = () => {
    if (!address.fullName || !address.phone || !address.division || !address.district || !address.addressLine) {
      toast.error("Please fill in all required address fields");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateAddress()) return;
    if (step === 1) trackInitiateCheckout(items, total);
    setStep(step + 1);
  };

  const handlePlace = async () => {
    setPlacing(true);
    try {
      const res = await api.post("/orders", {
        paymentMethod,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: address,
      });
      trackPurchase(res.data || { totalAmount: total, items });
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
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-8">
      <button onClick={() => step > 1 ? setStep(step - 1) : navigate("/cart")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" />
        {step > 1 ? "Back" : "Back to cart"}
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
      <StepIndicator current={step} />

      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h2>
          <AddressForm address={address} onChange={setAddress} />
          <button
            onClick={handleNext}
            className="w-full mt-6 py-3 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            Continue to Payment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                  paymentMethod === m.value ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={m.value}
                  checked={paymentMethod === m.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-black"
                />
                <span className="font-medium text-gray-900">{m.label}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleNext}
            className="w-full mt-6 py-3 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            Review Order <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Order</h2>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery to</h3>
            <p className="font-medium text-gray-900">{address.fullName}</p>
            <p className="text-sm text-gray-600">{address.phone}</p>
            <p className="text-sm text-gray-600">
              {[address.addressLine, address.thana, address.upazila, address.district, address.division].filter(Boolean).join(", ")}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Payment</h3>
            <p className="font-medium text-gray-900">
              {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Items ({items.length})</h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(Number(item.price) * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={handlePlace}
            disabled={placing}
            className="w-full mt-6 py-3.5 bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {placing ? "Placing Order..." : `Place Order - ${formatPrice(total)}`}
          </button>
        </div>
      )}
    </div>
  );
}
