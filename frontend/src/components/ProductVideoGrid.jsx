import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatters";
import { trackAddToCart, trackViewContent } from "../lib/pixel";
import toast from "react-hot-toast";

function GridCard({ product, onQuickView }) {
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const gradientBg = `linear-gradient(135deg, hsl(${(product.name?.charCodeAt(0) || 0) * 5 % 360}, 35%, 30%), hsl(${(product.name?.charCodeAt(1) || 0) * 7 % 360}, 45%, 20%))`;

  const handleBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    trackAddToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[3/4]"
      style={{ background: gradientBg }}
      onMouseEnter={() => { setHovered(true); trackViewContent(product); }}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="absolute inset-0 z-10" />

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8rem] opacity-15 select-none" />
      </div>

      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/80 to-transparent pt-16">
        <h3 className="text-white font-bold text-base leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white text-lg font-bold">{formatPrice(product.price)}</span>
          {product.stock === 0 && <span className="text-red-400 text-xs">Out of stock</span>}
        </div>
      </div>

      <div
        className={`absolute top-3 right-3 z-20 flex flex-col gap-2 transition-all duration-300 ${
          hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}
      >
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Heart className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : "text-white"}`} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Eye className="w-5 h-5 text-white" />
        </button>
      </div>

      <div
        className={`absolute bottom-4 right-4 z-20 transition-all duration-300 ${
          hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <button
          onClick={handleBuy}
          disabled={product.stock === 0}
          className="px-5 py-2.5 bg-white text-black rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4" />
          Quick Buy
        </button>
      </div>
    </div>
  );
}

export default function ProductVideoGrid({ products, onQuickView }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <GridCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  );
}
