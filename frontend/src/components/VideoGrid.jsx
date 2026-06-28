import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatters";
import toast from "react-hot-toast";

function GridCard({ product, onQuickView }) {
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const gradient = `hsl(${(product.name.length * 37) % 360}, 20%, 25%)`;

  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer bg-gray-900 aspect-[3/4]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
        style={{ background: `linear-gradient(135deg, ${gradient}, #1a1a2e)`, transform: hovered ? "scale(1.05)" : "scale(1)" }}
      >
        <span className="text-8xl opacity-30 select-none">👕</span>
      </div>

      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`} />

      <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition"
        >
          <Heart size={18} className={liked ? "text-red-500 fill-red-500" : "text-white"} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onQuickView(product); }}
          className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition"
        >
          <Eye size={18} className="text-white" />
        </button>
      </div>

      <Link to={`/products/${product.slug}`} className="absolute inset-0 z-10" />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 pointer-events-none">
        <h3 className="text-white font-semibold truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-white text-lg font-bold">{formatPrice(product.price)}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product);
              toast.success(`${product.name} added`);
            }}
            disabled={product.stock === 0}
            className="pointer-events-auto p-2 bg-white text-black rounded-full hover:bg-gray-200 transition disabled:opacity-50"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
        {product.stock === 0 && <span className="text-red-400 text-xs">Out of stock</span>}
      </div>
    </div>
  );
}

export default function VideoGrid({ products, onQuickView }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <GridCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  );
}
