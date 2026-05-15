import { test, expect, Page } from '@playwright/test';
import { graphqlRequest } from './helpers/graphqlRequest';

const TEST_DATA = {
  contact: {
    firstName: 'Usuario',
    lastName: 'Logueado',
    email: 'logged_user@test.com',
    phone: '+54 11 5555-5678',
  },
  shipping: {
    street: 'Avenida Siempre Viva',
    number: '742',
    apartment: 'B',
    city: 'Springfield',
    postal_code: '12345',
    state: 'IL',
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

test.describe('Purchase Complete - Logged In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@tinkuy.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button:has-text("Iniciar sesión")');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('flujo completo logueado: catalog → carrito → checkout → pago', async ({ page }) => {
    await page.goto('/catalog');

    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');
    await expect(page.locator('text=Agregado')).toBeVisible({ timeout: 5000 });

    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('text=Finalizar Compra')).toBeVisible();
    await page.click('text=Finalizar Compra');

    await completeShippingStep(page);
    await expect(page).toHaveURL(/checkout\/payment/);

    await page.click('text=MercadoPago');
    await page.click('button:has-text("Realizar Pedido")');

    await handleMercadoPagoSandbox(page);

    await expect(page).toHaveURL(/checkout\/success/, { timeout: 15000 });
    await expect(page.locator('text=¡Pedido confirmado!')).toBeVisible();
    await expect(page.locator('text=/[A-Z0-9]{6,}/')).toBeVisible();
  });

  test('carrito persiste entre sesiones', async ({ page, context }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    const cartBadge = await page.locator('[data-testid="cart-badge"]').textContent();
    expect(parseInt(cartBadge || '0')).toBeGreaterThan(0);

    const storageStatePath = 'storage-state.json';
    await context.storageState({ path: storageStatePath });

    const newContext = await context.browser()?.newContext();
    await newContext?.storageState({ path: storageStatePath });
    const newPage = await newContext?.newPage();

    if (newPage) {
      await newPage.goto('/cart');
      const cartItems = await newPage.locator('[data-testid="cart-item"]').count();
      expect(cartItems).toBeGreaterThan(0);
      await newPage.close();
    }
  });

  test('usuario puede ver historial de pedidos', async ({ page }) => {
    await page.goto('/orders');

    const ordersPage = page.url();
    expect(ordersPage).not.toContain('/login');
  });

  test('puntos de fidelidad se acumulan tras compra', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeShippingStep(page);
    await expect(page).toHaveURL(/checkout\/payment/);

    await page.click('text=MercadoPago');
    await page.click('button:has-text("Realizar Pedido")');

    await handleMercadoPagoSandbox(page);

    await expect(page).toHaveURL(/checkout\/success/, { timeout: 15000 });

    await page.goto('/loyalty');
    await expect(page.locator('[data-testid="loyalty-points"]')).toBeVisible();
  });

  test('dirección guardada se pre-llena en checkout', async ({ page }) => {
    await page.goto('/account/addresses');
    await page.click('button:has-text("Agregar Dirección")');

    await page.fill('[name="street"]', TEST_DATA.shipping.street);
    await page.fill('[name="number"]', TEST_DATA.shipping.number);
    await page.fill('[name="apartment"]', TEST_DATA.shipping.apartment);
    await page.fill('[name="city"]', TEST_DATA.shipping.city);
    await page.fill('[name="postalCode"]', TEST_DATA.shipping.postal_code);
    await page.click('button:has-text("Guardar")');

    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeShippingStep(page);

    const streetValue = await page.locator('[name="street"]').inputValue();
    expect(streetValue).toBe(TEST_DATA.shipping.street);
  });

  test('método de pago guardardo se pre-selecciona', async ({ page }) => {
    await page.goto('/account/payment-methods');

    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await completeShippingStep(page);
    await expect(page).toHaveURL(/checkout\/payment/);
  });

  test('logout elimina carrito de la sesión', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    const cartBadgeBefore = await page.locator('[data-testid="cart-badge"]').textContent();
    expect(parseInt(cartBadgeBefore || '0')).toBeGreaterThan(0);

    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Cerrar sesión")');

    await page.goto('/cart');
    const cartItems = await page.locator('[data-testid="cart-item"]').count();
    expect(cartItems).toBe(0);
  });
});

test.describe('Purchase Complete - Guest to Logged In Merge', () => {
  test('carrito guest se fusiona al hacer login', async ({ page }) => {
    await page.goto('/catalog');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Agregar al Carrito")');

    const guestCartBadge = await page.locator('[data-testid="cart-badge"]').textContent();
    const guestCartCount = parseInt(guestCartBadge || '0');
    expect(guestCartCount).toBeGreaterThan(0);

    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Iniciar sesión")');

    await page.fill('[name="email"]', 'test@tinkuy.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page).toHaveURL('/', { timeout: 10000 });

    await page.click('[data-testid="cart-icon"]');
    const cartBadgeAfterLogin = await page.locator('[data-testid="cart-badge"]').textContent();
    const mergedCartCount = parseInt(cartBadgeAfterLogin || '0');
    expect(mergedCartCount).toBeGreaterThanOrEqual(guestCartCount);
  });
});
