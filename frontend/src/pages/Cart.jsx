import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatters";
import EmptyState from "../components/EmptyState";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  const shippingCost = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        linkTo="/products"
        linkLabel="Start Shopping"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-2xl">👕</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`} className="font-medium text-gray-900 hover:underline truncate block text-sm">
                  {item.name}
                </Link>
                <p className="text-gray-600 text-sm">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-l-lg">
                  <Minus size={14} />
                </button>
                <span className="px-3 py-1 text-sm font-medium tabular-nums">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-r-lg">
                  <Plus size={14} />
                </button>
              </div>
              <p className="font-semibold text-gray-900 w-20 text-right text-sm">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
              <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="block text-center w-full mt-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Proceed to Checkout
          </Link>

          {subtotal < 1000 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Free shipping on orders over ৳1,000
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
