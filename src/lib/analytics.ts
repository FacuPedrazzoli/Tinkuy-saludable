declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function pageView(url: string, title: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_location: url,
      page_title: title,
    });
  }
}

export function trackViewItem(product: {
  id: string;
  name: string;
  category: string;
  price: number;
  currency?: string;
}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: product.currency || 'ARS',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      }],
    });
  }
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}, cartValue?: number): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'ARS',
      value: cartValue || product.price * (product.quantity || 1),
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
      }],
    });
  }
}

export function trackRemoveFromCart(product: { id: string; name: string; price: number }): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'ARS',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
      }],
    });
  }
}

export function trackBeginCheckout(cart: {
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'ARS',
      value: cart.total,
      items: cart.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}

export function trackPurchase(order: {
  id: string;
  total: number;
  shipping_cost?: number;
  tax?: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: order.id,
      currency: 'ARS',
      value: order.total,
      shipping: order.shipping_cost || 0,
      tax: order.tax || 0,
      items: order.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}
