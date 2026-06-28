import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/formatters";
import toast from "react-hot-toast";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shippingCost = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shippingCost;

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center pb-24 sm:pb-16">
        <ShoppingBag size={64} className="mx-auto text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Your cart is empty</h2>
        <Link
          to="/products"
          className="inline-block mt-4 px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, hsl(${(item.name?.charCodeAt(0) || 0) * 5 % 360}, 30%, 85%), hsl(${(item.name?.charCodeAt(0) || 0) * 5 % 360}, 40%, 75%))` }}
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`} className="font-medium text-gray-900 hover:underline truncate block">
                  {item.name}
                </Link>
                <p className="text-gray-600 text-sm">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100">-</button>
                <span className="px-3 py-1.5 text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100">+</button>
              </div>
              <p className="font-medium text-gray-900 w-24 text-right">{formatPrice(Number(item.price) * item.quantity)}</p>
              <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full mt-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Proceed to Checkout
          </button>

          {subtotal < 1000 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Free shipping on orders over {formatPrice(1000)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
