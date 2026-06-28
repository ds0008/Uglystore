import { ORDER_STATUS_COLORS } from "../lib/constants";

export default function StatusBadge({ status, className = "" }) {
  const colorClass = ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClass} ${className}`}>
      {status}
    </span>
  );
}
