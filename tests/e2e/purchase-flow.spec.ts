import { test, expect, Page, Locator } from '@playwright/test';

test.describe('Flujo completo de compra', () => {
  const TEST_DATA = {
    contact: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@test.com',
      phone: '+54 11 5555-1234',
    },
    shipping: {
      street: 'Calle Falsa',
      number: '123',
      apartment: 'A',
      city: 'Buenos Aires',
      postal_code: 'C1001',
      state: 'CABA',
    },
    mercadoPagoSandbox: {
      cardNumber: '4509 9535 6623 1174',
      expiry: '11/25',
      cvv: '123',
      cardholderName: 'APRO',
    },
  };

  async function completeContactStep(page: Page) {
    await page.fill('[name="firstName"]', TEST_DATA.contact.firstName);
    await page.fill('[name="lastName"]', TEST_DATA.contact.lastName);
    await page.fill('[name="email"]', TEST_DATA.contact.email);
    await page.fill('[name="phone"]', TEST_DATA.contact.phone);
    await page.click('button:has-text("Continuar")');
  }

  async function completeShippingStep(page: Page) {
    await page.fill('[name="street"]', TEST_DATA.shipping.street);
    await page.fill('[name="number"]', TEST_DATA.shipping.number);
    await page.fill('[name="apartment"]', TEST_DATA.shipping.apartment);
    await page.fill('[name="city"]', TEST_DATA.shipping.city);
    await page.fill('[name="postal_code"]', TEST_DATA.shipping.postal_code);
    await page.click('button:has-text("Continuar")');
  }

  async function handleMercadoPagoSandbox(page: Page) {
    const mpFrame = page.frameLocator('iframe[title="MercadoPago"]');
    if (mpFrame) {
      await mpFrame.fill('[name="cardNumber"]', TEST_DATA.mercadoPagoSandbox.cardNumber);
      await mpFrame.fill('[name="expiry"]', TEST_DATA.mercadoPagoSandbox.expiry);
      await mpFrame.fill('[name="cvv"]', TEST_DATA.mercadoPagoSandbox.cvv);
      await mpFrame.fill('[name="cardholderName"]', TEST_DATA.mercadoPagoSandbox.cardholderName);
      await mpFrame.click('button[type="submit"]');
    }
  }

  test('compra guest exitosa con MercadoPago sandbox', async ({ page }) => {
    await page.goto('/catalog');

    await page.click('[data-testid="product-card"]:first-child');

    await page.click('button:has-text("Agregar al Carrito")');
    await expect(page.locator('text=Agregado')).toBeVisible({ timeout: 5000 });

    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('text=Finalizar Compra')).toBeVisible();
    await page.click('text=Finalizar Compra');

    await completeContactStep(page);
    await expect(page).toHaveURL(/checkout\/shipping/);

    await completeShippingStep(page);
    await expect(page).toHaveURL(/checkout\/payment/);

    await page.click('text=MercadoPago');
    await page.click('button:has-text("Realizar Pedido")');

    await handleMercadoPagoSandbox(page);

    await expect(page).toHaveURL(/checkout\/success/, { timeout: 15000 });
    await expect(page.locator('text=¡Pedido confirmado!')).toBeVisible();
    await expect(page.locator('text=/[A-Z0-9]{6,}/')).toBeVisible();
  });

  test('compra logueado exitosa - carrito persiste', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@tinkuy.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button:has-text("Iniciar sesión")');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');

    const addButton = page.locator('button:has-text("Agregar al Carrito")').first();
    await addButton.click();
    await expect(page.locator('text=Agregado')).toBeVisible({ timeout: 5000 });

    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('text=Finalizar Compra')).toBeVisible();

    const cartCount = await page.locator('[data-testid="cart-badge"]').textContent();
    expect(parseInt(cartCount || '0')).toBeGreaterThan(0);
  });

  test('pago fallido redirige a /failure', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeContactStep(page);
    await completeShippingStep(page);

    await page.click('text=MercadoPago');
    await page.click('button:has-text("Realizar Pedido")');

    const mpFrame = page.frameLocator('iframe[title="MercadoPago"]');
    await mpFrame.fill('[name="cardNumber"]', '0000 0000 0000 0000');
    await mpFrame.fill('[name="expiry"]', '11/25');
    await mpFrame.fill('[name="cvv"]', '000');
    await mpFrame.fill('[name="cardholderName"]', 'OTHE');
    await mpFrame.click('button[type="submit"]');

    await expect(page).toHaveURL(/checkout\/failure/, { timeout: 15000 });
    await expect(page.locator('text=Error en el pago')).toBeVisible();
  });

  test('pago pendiente redirige a /pending', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeContactStep(page);
    await completeShippingStep(page);

    await page.click('text=Pago Fácil');
    await page.click('button:has-text("Realizar Pedido")');

    await expect(page).toHaveURL(/checkout\/pending/, { timeout: 15000 });
    await expect(page.locator('text=Pago en efectivo')).toBeVisible();
  });

  test('validación de stock - no permite superar stock disponible', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');

    const stockText = await page.locator('[data-testid="product-stock"]').textContent();
    const stockMatch = stockText?.match(/(\d+)/);
    const stock = stockMatch ? parseInt(stockMatch[1]) : 3;

    if (stock <= 1) {
      await page.click('button:has-text("Agregar al Carrito")');
      await expect(page.locator('text=Última unidad')).toBeVisible();
    } else {
      await page.fill('[name="quantity"]', String(stock + 5));
      await page.click('button:has-text("Agregar al Carrito")');
      await expect(page.locator(`text=Solo hay ${stock} disponibles`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('aplicar cupón válido BIENVENIDO10', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeContactStep(page);
    await completeShippingStep(page);

    const initialTotal = await page.locator('[data-testid="order-total"]').textContent();
    const initialValue = parseFloat(initialTotal?.replace(/[^\d,]/g, '').replace(',', '.') || '0');

    await page.fill('[name="coupon"]', 'BIENVENIDO10');
    await page.click('button:has-text("Aplicar")');

    await expect(page.locator('text=10%')).toBeVisible();
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();

    const discountedTotal = await page.locator('[data-testid="order-total"]').textContent();
    const discountedValue = parseFloat(discountedTotal?.replace(/[^\d,]/g, '').replace(',', '.') || '0');

    expect(discountedValue).toBeLessThan(initialValue);
    expect(discountedValue).toBeCloseTo(initialValue * 0.9, 2);
  });

  test('aplicar cupón expirado muestra error', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeContactStep(page);
    await completeShippingStep(page);

    await page.fill('[name="coupon"]', 'EXPIRED2024');
    await page.click('button:has-text("Aplicar")');

    await expect(page.locator('text=Este cupón ya venció')).toBeVisible({ timeout: 5000 });
  });

  test('checkout responsive - iPhone SE (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeContactStep(page);
    await completeShippingStep(page);

    await expect(page.locator('button:has-text("MercadoPago")')).toBeVisible();
    await expect(page.locator('button:has-text("Pago Fácil")')).toBeVisible();

    const isBottomNavVisible = await page.locator('[data-testid="bottom-nav"]').isVisible();
    expect(isBottomNavVisible).toBe(true);
  });

  test('wishlist - agregar y ver producto', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');

    const heartButton = page.locator('[data-testid="wishlist-button"]').first();
    await heartButton.click();

    await expect(page.locator('[data-testid="wishlist-badge"]')).toBeVisible();

    await page.click('[data-testid="wishlist-icon"]');
    await expect(page).toHaveURL('/wishlist');

    const wishlistItems = page.locator('[data-testid="wishlist-item"]');
    await expect(wishlistItems).toHaveCount(1, { timeout: 5000 });
  });
});
