declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export function trackPageView(): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
}

export function trackViewContent(product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
}): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.category,
      value: product.price,
      currency: 'ARS',
    });
  }
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * (product.quantity || 1),
      currency: 'ARS',
    });
  }
}

export function trackInitiateCheckout(cart: {
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
}): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      num_items: cart.items.length,
      value: cart.total,
      currency: 'ARS',
    });
  }
}

export function trackPurchase(order: {
  id: string;
  total: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: order.items.map(i => i.id),
      content_type: 'product',
      value: order.total,
      num_items: order.items.length,
      currency: 'ARS',
    });
  }
}
