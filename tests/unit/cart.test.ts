import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore, useWishlistStore, WEIGHTS, calculatePrice, Weight } from '@/lib/store';
import { Product } from '@/types';

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod_1',
  name: 'Proteína Whey',
  slug: 'proteina-whey',
  description: 'Descripción del producto',
  shortDescription: 'Proteína de suero',
  price: 5000,
  category: 'Suplementos',
  tags: ['whey', 'protein'],
  images: ['/img.jpg'],
  stock: 10,
  rating: 4.5,
  reviews: 100,
  featured: true,
  organic: false,
  glutenFree: true,
  vegan: false,
  keto: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('CartStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('agrega item nuevo al carrito', async () => {
    const { result } = renderHook(() => useCartStore());

    const product = createMockProduct();

    await act(async () => {
      result.current.addItem(product, 1, 250);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod_1');
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.items[0].weight).toBe(250);
  });

  it('incrementa cantidad si el mismo producto y peso ya existe', async () => {
    const { result } = renderHook(() => useCartStore());

    const product = createMockProduct();

    await act(async () => {
      result.current.addItem(product, 2, 250);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);

    await act(async () => {
      result.current.addItem(product, 3, 250);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
  });

  it('agrega mismo producto con diferente peso como item separado', async () => {
    const { result } = renderHook(() => useCartStore());

    const product = createMockProduct();

    await act(async () => {
      result.current.addItem(product, 1, 250);
    });

    await act(async () => {
      result.current.addItem(product, 1, 500);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].weight).toBe(250);
    expect(result.current.items[1].weight).toBe(500);
  });

  it('calcula total correctamente con calculatePrice', () => {
    const basePrice = 5000;

    expect(calculatePrice(basePrice, 100)).toBe(5000);
    expect(calculatePrice(basePrice, 250)).toBe(12500);
    expect(calculatePrice(basePrice, 500)).toBe(25000);
    expect(calculatePrice(basePrice, 1000)).toBe(50000);
  });

  it('calcula total del carrito correctamente', async () => {
    const { result } = renderHook(() => useCartStore());

    const product1 = createMockProduct({ id: 'prod_1', price: 5000 });
    const product2 = createMockProduct({ id: 'prod_2', price: 3000 });

    await act(async () => {
      result.current.addItem(product1, 2, 250);
      result.current.addItem(product2, 1, 500);
    });

    const total = result.current.getTotal();

    expect(total).toBe(25000 + 15000);
    expect(total).toBe(40000);
  });

  it('calcula total con descuento del carrito', async () => {
    const { result } = renderHook(() => useCartStore());

    const product = createMockProduct({ price: 10000 });

    await act(async () => {
      result.current.addItem(product, 1, 1000);
    });

    const subtotal = result.current.getTotal();
    expect(subtotal).toBe(10000);

    result.current.applyCoupon?.('BIENVENIDO10');

    const discountedTotal = result.current.getTotal();
    expect(discountedTotal).toBe(9000);
  });

  it('removeItem elimina el producto correcto', async () => {
    const { result } = renderHook(() => useCartStore());

    const product1 = createMockProduct({ id: 'prod_1' });
    const product2 = createMockProduct({ id: 'prod_2' });

    await act(async () => {
      result.current.addItem(product1, 1, 250);
      result.current.addItem(product2, 1, 250);
    });

    expect(result.current.items).toHaveLength(2);

    await act(async () => {
      result.current.removeItem('prod_1', 250);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod_2');
  });

  it('updateQuantity modifica la cantidad correctamente', async () => {
    const { result } = renderHook(() => useCartStore());

    const product = createMockProduct();

    await act(async () => {
      result.current.addItem(product, 1, 250);
    });

    expect(result.current.items[0].quantity).toBe(1);

    await act(async () => {
      result.current.updateQuantity('prod_1', 5, 250);
    });

    expect(result.current.items[0].quantity).toBe(5);
  });

  it('updateQuantity con cantidad 0 elimina el item', async () => {
    const { result } = renderHook(() => useCartStore());

    const product = createMockProduct();

    await act(async () => {
      result.current.addItem(product, 3, 250);
    });

    expect(result.current.items).toHaveLength(1);

    await act(async () => {
      result.current.updateQuantity('prod_1', 0, 250);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('clearCart elimina todos los items', async () => {
    const { result } = renderHook(() => useCartStore());

    const product1 = createMockProduct({ id: 'prod_1' });
    const product2 = createMockProduct({ id: 'prod_2' });

    await act(async () => {
      result.current.addItem(product1, 1, 250);
      result.current.addItem(product2, 2, 500);
    });

    expect(result.current.items).toHaveLength(2);

    await act(async () => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('getItemCount retorna la suma de cantidades', async () => {
    const { result } = renderHook(() => useCartStore());

    const product1 = createMockProduct({ id: 'prod_1' });
    const product2 = createMockProduct({ id: 'prod_2' });

    await act(async () => {
      result.current.addItem(product1, 3, 250);
      result.current.addItem(product2, 2, 500);
    });

    expect(result.current.getItemCount()).toBe(5);
  });

  it('toggleCart abre y cierra el carrito', async () => {
    const { result } = renderHook(() => useCartStore());

    expect(result.current.isOpen).toBe(false);

    await act(async () => {
      result.current.toggleCart();
    });

    expect(result.current.isOpen).toBe(true);

    await act(async () => {
      result.current.toggleCart();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('setCartOpen establece el estado correctamente', async () => {
    const { result } = renderHook(() => useCartStore());

    await act(async () => {
      result.current.setCartOpen(true);
    });

    expect(result.current.isOpen).toBe(true);

    await act(async () => {
      result.current.setCartOpen(false);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('setLoading establece el estado de loading', async () => {
    const { result } = renderHook(() => useCartStore());

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('persiste items en localStorage', async () => {
    const { result: result1 } = renderHook(() => useCartStore());

    const product = createMockProduct();

    await act(async () => {
      result1.current.addItem(product, 2, 500);
    });

    expect(result1.current.items).toHaveLength(1);

    const { result: result2 } = renderHook(() => useCartStore());

    expect(result2.current.items).toHaveLength(1);
    expect(result2.current.items[0].product.id).toBe('prod_1');
    expect(result2.current.items[0].quantity).toBe(2);
  });

  it('merge de carrito guest con session existente', async () => {
    const { result: result1 } = renderHook(() => useCartStore());

    const product1 = createMockProduct({ id: 'prod_1' });
    const product2 = createMockProduct({ id: 'prod_2' });

    await act(async () => {
      result1.current.addItem(product1, 1, 250);
    });

    expect(result1.current.items).toHaveLength(1);

    const { result: result2 } = renderHook(() => useCartStore());

    await act(async () => {
      result2.current.addItem(product2, 2, 500);
    });

    expect(result2.current.items).toHaveLength(2);

    const hasProd1 = result2.current.items.some(item => item.product.id === 'prod_1');
    const hasProd2 = result2.current.items.some(item => item.product.id === 'prod_2');

    expect(hasProd1).toBe(true);
    expect(hasProd2).toBe(true);
  });
});

describe('WishlistStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('agrega producto a wishlist', async () => {
    const { result } = renderHook(() => useWishlistStore());

    const product = createMockProduct({ id: 'prod_wishlist_1' });

    await act(async () => {
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('prod_wishlist_1');
  });

  it('no agrega producto duplicado a wishlist', async () => {
    const { result } = renderHook(() => useWishlistStore());

    const product = createMockProduct({ id: 'prod_wishlist_2' });

    await act(async () => {
      result.current.addItem(product);
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);
  });

  it('elimina producto de wishlist', async () => {
    const { result } = renderHook(() => useWishlistStore());

    const product = createMockProduct({ id: 'prod_wishlist_3' });

    await act(async () => {
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);

    await act(async () => {
      result.current.removeItem('prod_wishlist_3');
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('isInWishlist retorna true si el producto existe', async () => {
    const { result } = renderHook(() => useWishlistStore());

    const product = createMockProduct({ id: 'prod_wishlist_4' });

    expect(result.current.isInWishlist('prod_wishlist_4')).toBe(false);

    await act(async () => {
      result.current.addItem(product);
    });

    expect(result.current.isInWishlist('prod_wishlist_4')).toBe(true);
  });

  it('toggleItem agrega si no existe, elimina si existe', async () => {
    const { result } = renderHook(() => useWishlistStore());

    const product = createMockProduct({ id: 'prod_toggle' });

    await act(async () => {
      result.current.toggleItem(product);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.isInWishlist('prod_toggle')).toBe(true);

    await act(async () => {
      result.current.toggleItem(product);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.isInWishlist('prod_toggle')).toBe(false);
  });

  it('persiste wishlist en localStorage', async () => {
    const { result: result1 } = renderHook(() => useWishlistStore());

    const product = createMockProduct({ id: 'prod_persist' });

    await act(async () => {
      result1.current.addItem(product);
    });

    const { result: result2 } = renderHook(() => useWishlistStore());

    expect(result2.current.items).toHaveLength(1);
    expect(result2.current.isInWishlist('prod_persist')).toBe(true);
  });
});

describe('calculatePrice', () => {
  it('calcula precio correctamente para cada peso', () => {
    const basePrice = 1000;

    expect(calculatePrice(basePrice, 100)).toBe(1000);
    expect(calculatePrice(basePrice, 250)).toBe(2500);
    expect(calculatePrice(basePrice, 500)).toBe(5000);
    expect(calculatePrice(basePrice, 1000)).toBe(10000);
  });

  it('redondea correctamente', () => {
    expect(calculatePrice(3333, 250)).toBe(8333);
    expect(calculatePrice(3333, 100)).toBe(3333);
  });
});

describe('WEIGHTS', () => {
  it('contiene los pesos estándar', () => {
    expect(WEIGHTS).toContain(100);
    expect(WEIGHTS).toContain(250);
    expect(WEIGHTS).toContain(500);
    expect(WEIGHTS).toContain(1000);
  });

  it('tiene 4 pesos definidos', () => {
    expect(WEIGHTS).toHaveLength(4);
  });
});
