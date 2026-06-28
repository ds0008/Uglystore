export function trackEvent(eventName, data = {}) {
  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, data);
  }
  if (typeof window.ttq?.track === "function") {
    window.ttq.track(eventName, data);
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, data);
  }
}

export function trackViewContent(product) {
  trackEvent("ViewContent", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    value: Number(product.price),
    currency: "BDT",
  });
}

export function trackAddToCart(product, quantity = 1) {
  trackEvent("AddToCart", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    value: Number(product.price) * quantity,
    currency: "BDT",
  });
}

export function trackPurchase(order) {
  trackEvent("Purchase", {
    value: Number(order.totalAmount),
    currency: "BDT",
    content_type: "product",
    num_items: order.items?.length || 0,
  });
}

export function trackViewCategory(category) {
  trackEvent("ViewCategory", { content_category: category });
}

export function trackSearch(query) {
  trackEvent("Search", { search_string: query });
}

export function trackInitiateCheckout(items, value) {
  trackEvent("InitiateCheckout", {
    num_items: items.length,
    value,
    currency: "BDT",
  });
}
