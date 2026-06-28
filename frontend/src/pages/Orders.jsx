import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice, formatDate } from "../lib/formatters";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { SkeletonList } from "../components/LoadingSkeleton";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        <SkeletonList count={3} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        linkTo="/products"
        linkLabel="Start Shopping"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="font-semibold text-gray-900 mt-1">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
