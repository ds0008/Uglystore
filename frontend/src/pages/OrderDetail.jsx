import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice, formatDateShort } from "../lib/formatters";
import StatusBadge from "../components/StatusBadge";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-100 h-8 rounded w-1/3" />
          <div className="bg-gray-100 h-40 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
        <Link to="/orders" className="text-sm text-gray-600 mt-4 inline-block hover:underline">
          &larr; Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <StatusBadge status={order.status} className="px-3 py-1 text-sm" />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium text-gray-900">
              {formatDateShort(order.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Payment</p>
            <p className="font-medium text-gray-900">{order.paymentMethod.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-gray-500">Payment Status</p>
            <p className="font-medium text-gray-900">{order.paymentStatus}</p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Price</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-900">{item.product.name}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatPrice(item.unitPrice)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPrice(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200">
            <tr>
              <td colSpan="3" className="px-4 py-2 text-right text-gray-600">Subtotal</td>
              <td className="px-4 py-2 text-right">{formatPrice(order.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan="3" className="px-4 py-2 text-right text-gray-600">Shipping</td>
              <td className="px-4 py-2 text-right">
                {Number(order.shippingCost) === 0 ? "Free" : formatPrice(order.shippingCost)}
              </td>
            </tr>
            <tr className="font-semibold">
              <td colSpan="3" className="px-4 py-3 text-right">Total</td>
              <td className="px-4 py-3 text-right">{formatPrice(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
