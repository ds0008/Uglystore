import { useEffect, useState } from "react";
import { api } from "../lib/api";
import ProductReel from "../components/ProductReel";

export default function Reels() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products?limit=20")
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-black flex items-center justify-center text-white/60">
        No products to show
      </div>
    );
  }

  return <ProductReel products={products} />;
}
