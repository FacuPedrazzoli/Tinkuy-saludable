import { test, expect, Browser, chromium, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Concurrency: Stock', () => {
  const TEST_PRODUCT_STOCK_1 = {
    name: 'Producto Stock 1',
    slug: 'producto-stock-1',
    price: 2500,
    stock: 1,
  };

  async function loginUser(page: Page, email: string) {
    await page.goto('/login');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button:has-text("Iniciar sesión")');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  }

  async function addToCartAndCheckout(page: Page, productSlug: string) {
    await page.goto(`/product/${productSlug}`);
    await page.click('button:has-text("Agregar al Carrito")');
    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Finalizar Compra');

    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="phone"]', '+54 11 5555-1234');
    await page.click('button:has-text("Continuar")');

    await page.fill('[name="street"]', 'Calle Test');
    await page.fill('[name="number"]', '123');
    await page.fill('[name="city"]', 'Buenos Aires');
    await page.fill('[name="postal_code"]', 'C1001');
    await page.click('button:has-text("Continuar")');
  }

  test.beforeEach(async () => {
    await prisma.product.update({
      where: { slug: TEST_PRODUCT_STOCK_1.slug },
      data: { stock: 1 },
    });
  });

  test('solo un usuario puede comprar el último stock', async ({ browser }) => {
    const product = await prisma.product.upsert({
      where: { slug: TEST_PRODUCT_STOCK_1.slug },
      update: { stock: 1 },
      create: {
        id: `prod_stock_concurrency_${Date.now()}`,
        name: TEST_PRODUCT_STOCK_1.name,
        slug: TEST_PRODUCT_STOCK_1.slug,
        description: 'Producto para test de concurrencia',
        shortDescription: 'Test concurrency',
        price: TEST_PRODUCT_STOCK_1.price,
        stock: 1,
        category: 'Test',
        tags: ['test'],
        images: ['/test.jpg'],
        rating: 5,
        reviews: 0,
        featured: false,
        organic: false,
        glutenFree: false,
        vegan: false,
        keto: false,
        createdAt: new Date(),
      },
    });

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await loginUser(page1, 'user1@test.com');
    await loginUser(page2, 'user2@test.com');

    await addToCartAndCheckout(page1, TEST_PRODUCT_STOCK_1.slug);
    await addToCartAndCheckout(page2, TEST_PRODUCT_STOCK_1.slug);

    await page1.click('text=MercadoPago');
    await page1.click('button:has-text("Realizar Pedido")');

    await expect(page1).toHaveURL(/checkout\/success/, { timeout: 15000 });

    await page2.click('button:has-text("Realizar Pedido")');

    const errorVisible = await page2.locator('text=/Stock insuficiente|Solo hay.*disponibles|No hay suficiente stock/i').isVisible({ timeout: 5000 }).catch(() => false);

    if (errorVisible) {
      await expect(page2.locator('text=/Stock insuficiente|Solo hay.*disponibles|No hay suficiente stock/i')).toBeVisible();
    } else {
      await page2.click('text=MercadoPago');
      await page2.click('button:has-text("Realizar Pedido")');
      await expect(page2).toHaveURL(/checkout\/failure/, { timeout: 15000 });
    }

    await context1.close();
    await context2.close();

    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(finalProduct?.stock).toBe(0);
  });

  test('carrito se actualiza cuando stock llega a 0', async ({ browser }) => {
    await prisma.product.upsert({
      where: { slug: TEST_PRODUCT_STOCK_1.slug },
      update: { stock: 2 },
      create: {
        id: `prod_stock_cart_${Date.now()}`,
        name: TEST_PRODUCT_STOCK_1.name,
        slug: TEST_PRODUCT_STOCK_1.slug,
        description: 'Producto test',
        shortDescription: 'Test',
        price: TEST_PRODUCT_STOCK_1.price,
        stock: 2,
        category: 'Test',
        tags: ['test'],
        images: ['/test.jpg'],
        rating: 5,
        reviews: 0,
        featured: false,
        organic: false,
        glutenFree: false,
        vegan: false,
        keto: false,
        createdAt: new Date(),
      },
    });

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await loginUser(page1, 'user3@test.com');
    await loginUser(page2, 'user4@test.com');

    await page1.goto(`/product/${TEST_PRODUCT_STOCK_1.slug}`);
    await page1.click('button:has-text("Agregar al Carrito")');

    await page2.goto(`/product/${TEST_PRODUCT_STOCK_1.slug}`);
    await page2.click('button:has-text("Agregar al Carrito")');

    await page1.click('[data-testid="cart-icon"]');
    await page1.click('text=Finalizar Compra');
    await page1.fill('[name="firstName"]', 'User');
    await page1.fill('[name="lastName"]', 'Three');
    await page1.fill('[name="email"]', 'user3@test.com');
    await page1.fill('[name="phone"]', '+54 11 5555-3333');
    await page1.click('button:has-text("Continuar")');
    await page1.fill('[name="street"]', 'Calle');
    await page1.fill('[name="number"]', '1');
    await page1.fill('[name="city"]', 'BA');
    await page1.fill('[name="postal_code"]', 'C1001');
    await page1.click('button:has-text("Continuar")');
    await page1.click('text=MercadoPago');
    await page1.click('button:has-text("Realizar Pedido")');

    await expect(page1).toHaveURL(/checkout\/success/, { timeout: 15000 });

    await page2.goto(`/product/${TEST_PRODUCT_STOCK_1.slug}`);

    const stockText = await page2.locator('[data-testid="product-stock"]').textContent();
    expect(stockText).toMatch(/0|Agotado/);

    const addButton = page2.locator('button:has-text("Agregar al Carrito")');
    const buttonDisabled = await addButton.isDisabled();
    expect(buttonDisabled || stockText?.includes('0') || stockText?.includes('Agotado')).toBe(true);

    await context1.close();
    await context2.close();
  });

  test('concurrent checkout no causa stock negativo', async ({ browser }) => {
    const product = await prisma.product.upsert({
      where: { slug: 'prod-concurrency-test' },
      update: { stock: 5 },
      create: {
        id: `prod_concurrency_${Date.now()}`,
        name: 'Producto Concurrencia',
        slug: 'prod-concurrency-test',
        description: 'Test',
        shortDescription: 'Test',
        price: 1000,
        stock: 5,
        category: 'Test',
        tags: ['test'],
        images: ['/test.jpg'],
        rating: 5,
        reviews: 0,
        featured: false,
        organic: false,
        glutenFree: false,
        vegan: false,
        keto: false,
        createdAt: new Date(),
      },
    });

    const NUM_USERS = 5;
    const contexts: Browser['contexts'] = [];
    const pages: Page[] = [];

    for (let i = 0; i < NUM_USERS; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);

      await loginUser(page, `concurrent${i}@test.com`);
    }

    await Promise.all(pages.map(page => page.goto(`/product/${product.slug}`)));
    await Promise.all(pages.map(page => page.click('button:has-text("Agregar al Carrito")')));

    await Promise.all(pages.map(async (page) => {
      await page.click('[data-testid="cart-icon"]');
      await page.click('text=Finalizar Compra');
      await page.fill('[name="firstName"]', `User${Math.random()}`);
      await page.fill('[name="lastName"]', 'Test');
      await page.fill('[name="email"]', `concurrent${Math.random()}@test.com`);
      await page.fill('[name="phone"]', '+54 11 5555-0000');
      await page.click('button:has-text("Continuar")');
      await page.fill('[name="street"]', 'Calle');
      await page.fill('[name="number"]', '1');
      await page.fill('[name="city"]', 'BA');
      await page.fill('[name="postal_code"]', 'C1001');
      await page.click('button:has-text("Continuar")');
      await page.click('text=MercadoPago');
    }));

    const checkoutPromises = pages.map(async (page) => {
      try {
        await page.click('button:has-text("Realizar Pedido")');
        await page.waitForURL(/checkout\/success/, { timeout: 10000 });
        return 'success';
      } catch {
        const hasStockError = await page.locator('text=/Stock insuficiente|No hay suficiente stock/i').isVisible({ timeout: 3000 }).catch(() => false);
        if (hasStockError) return 'stock_error';
        return 'unknown';
      }
    });

    const results = await Promise.all(checkoutPromises);

    const successCount = results.filter(r => r === 'success').length;
    const stockErrorCount = results.filter(r => r === 'stock_error').length;

    expect(successCount).toBeLessThanOrEqual(product.stock);

    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(finalProduct?.stock).toBeGreaterThanOrEqual(0);
    expect(finalProduct?.stock).toBeLessThanOrEqual(5);

    await Promise.all(contexts.map(ctx => ctx.close()));
  });
});

test.describe('Coupon Concurrency', () => {
  test('cupón de un solo uso no se aplica dos veces', async ({ browser }) => {
    const coupon = await prisma.coupon.upsert({
      where: { code: 'SINGLE_USE_TEST' },
      update: { usedCount: 0, maxUses: 1 },
      create: {
        code: 'SINGLE_USE_TEST',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        maxUses: 1,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await loginUser(page1, 'coupon1@test.com');
    await loginUser(page2, 'coupon2@test.com');

    await page1.goto('/catalog');
    await page1.click('[data-testid="product-card"]:first-child');
    await page1.click('button:has-text("Agregar al Carrito")');
    await page1.click('[data-testid="cart-icon"]');
    await page1.click('text=Finalizar Compra');

    await page2.goto('/catalog');
    await page2.click('[data-testid="product-card"]:first-child');
    await page2.click('button:has-text("Agregar al Carrito")');
    await page2.click('[data-testid="cart-icon"]');
    await page2.click('text=Finalizar Compra');

    await fillBasicCheckout(page1);
    await fillBasicCheckout(page2);

    await page1.fill('[name="coupon"]', 'SINGLE_USE_TEST');
    await page1.click('button:has-text("Aplicar")');
    await expect(page1.locator('text=15%')).toBeVisible({ timeout: 5000 });

    await page2.fill('[name="coupon"]', 'SINGLE_USE_TEST');
    await page2.click('button:has-text("Aplicar")');

    const errorVisible = await page2.locator('text=/cupón.*ya.*usado|Cupón no válido/i').isVisible({ timeout: 5000 }).catch(() => false);
    expect(errorVisible).toBe(true);

    await context1.close();
    await context2.close();
  });
});

async function loginUser(page: Page, email: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'Test123!');
  await page.click('button:has-text("Iniciar sesión")');
  await expect(page).toHaveURL('/', { timeout: 10000 });
}

async function fillBasicCheckout(page: Page) {
  await page.fill('[name="firstName"]', 'Test');
  await page.fill('[name="lastName"]', 'User');
  await page.fill('[name="email"]', 'test@test.com');
  await page.fill('[name="phone"]', '+54 11 5555-1234');
  await page.click('button:has-text("Continuar")');
  await page.fill('[name="street"]', 'Calle');
  await page.fill('[name="number"]', '1');
  await page.fill('[name="city"]', 'BA');
  await page.fill('[name="postal_code"]', 'C1001');
  await page.click('button:has-text("Continuar")');
}
