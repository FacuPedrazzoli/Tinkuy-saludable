import { test, expect, Page } from '@playwright/test';
import { graphqlRequest } from './helpers/graphqlRequest';

const TEST_DATA = {
  contact: {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: `guest_${Date.now()}@test.com`,
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
  await mpFrame.locator('[name="cardNumber"]').fill(TEST_DATA.mercadoPagoSandbox.cardNumber);
  await mpFrame.locator('[name="expiry"]').fill(TEST_DATA.mercadoPagoSandbox.expiry);
  await mpFrame.locator('[name="cvv"]').fill(TEST_DATA.mercadoPagoSandbox.cvv);
  await mpFrame.locator('[name="cardholderName"]').fill(TEST_DATA.mercadoPagoSandbox.cardholderName);
  await mpFrame.locator('button[type="submit"]').click();
}

test.describe('Purchase Complete - Guest Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
  });

  test('flujo completo guest: búsqueda → carrito → checkout → pago', async ({ page }) => {
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

  test('flujo guest con múltiples productos', async ({ page }) => {
    const products = await page.locator('[data-testid="product-card"]').all();

    if (products.length >= 2) {
      await products[0].click();
      await page.click('button:has-text("Agregar al Carrito")');
      await page.click('[data-testid="back-to-catalog"]');

      await products[1].click();
      await page.click('button:has-text("Agregar al Carrito")');
      await page.click('[data-testid="back-to-catalog"]');

      await page.click('[data-testid="cart-icon"]');
      const cartItems = await page.locator('[data-testid="cart-item"]').count();
      expect(cartItems).toBeGreaterThanOrEqual(2);
    }
  });

  test('guest no puede ver historial de pedidos', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login/);
  });

  test('validación de stock en tiempo real', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child');

    const stockText = await page.locator('[data-testid="product-stock"]').textContent();
    const stockMatch = stockText?.match(/(\d+)/);
    const stock = stockMatch ? parseInt(stockMatch[1]) : 3;

    if (stock > 1) {
      const quantityInput = page.locator('[name="quantity"]');
      await quantityInput.fill(String(stock + 5));
      await page.click('button:has-text("Agregar al Carrito")');
      await expect(page.locator(`text=Solo hay ${stock} disponibles`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('aplicar cupón durante checkout', async ({ page }) => {
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

  test('wishlist agregado desde catalog persiste', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child');

    const heartButton = page.locator('[data-testid="wishlist-button"]').first();
    await heartButton.click();

    await expect(page.locator('[data-testid="wishlist-badge"]')).toBeVisible();

    await page.goto('/wishlist');
    await expect(page.locator('[data-testid="wishlist-item"]')).toHaveCount(1, { timeout: 5000 });
  });

  test('checkout abandona carrito intacto', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeContactStep(page);

    await page.goto('/cart');

    const cartItems = await page.locator('[data-testid="cart-item"]').count();
    expect(cartItems).toBeGreaterThan(0);
  });
});
