export function formatPrice(value) {
  return `৳${Number(value).toFixed(2)}`;
}

export function formatPriceRounded(value) {
  return `৳${Number(value).toFixed(0)}`;
}

export function formatDate(dateString, options) {
  return new Date(dateString).toLocaleDateString(
    "en-US",
    options || { year: "numeric", month: "short", day: "numeric" },
  );
}

export function formatDateShort(dateString) {
  return new Date(dateString).toLocaleDateString();
}
