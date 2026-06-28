import { useEffect, useState } from "react";
import { api } from "../lib/api";
import ProductReels from "../components/ProductReels";

export default function Reels() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products?limit=20")
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-40">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-40 text-white">
        <p>No products to show</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <ProductReels products={products} />
    </div>
  );
}
