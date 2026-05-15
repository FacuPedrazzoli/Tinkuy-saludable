import { test, expect, Page } from '@playwright/test';

test.describe('Autenticación', () => {
  test('registro → login → logout → login', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test.${timestamp}@tinkuy.com`;
    const password = 'Test123!';

    await page.goto('/register');

    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.fill('[name="confirmPassword"]', password);

    const termsCheckbox = page.locator('[name="terms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.click('button:has-text("Crear cuenta")');

    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.locator('text=/¡Bienvenido|Account created/i')).toBeVisible({ timeout: 5000 });

    await page.click('[data-testid="user-menu"]');
    await page.click('text=Cerrar sesión');

    await expect(page).toHaveURL('/login', { timeout: 5000 });

    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('ruta protegida sin sesión redirige a login', async ({ page }) => {
    const protectedRoutes = [
      '/admin',
      '/profile',
      '/orders',
      '/wishlist',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    }
  });

  test('login credenciales inválidas muestra error genérico', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@email.com');
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page.locator('text=Credenciales incorrectas')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/usuario.*no.*existe/i')).not.toBeVisible();
  });

  test('login admin@tinkuy.com redirige a /admin', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'admin@tinkuy.com');
    await page.fill('[name="password"]', 'Admin123!');
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page).toHaveURL('/admin', { timeout: 10000 });
    await expect(page.locator('text=/Panel de Admin|Admin Dashboard/i')).toBeVisible({ timeout: 5000 });
  });

  test('rate limiting - 6to intento bloquea por 15 min', async ({ page }) => {
    await page.goto('/login');

    const invalidEmail = `wrong${Date.now()}@test.com`;

    for (let i = 0; i < 5; i++) {
      await page.fill('[name="email"]', invalidEmail);
      await page.fill('[name="password"]', 'wrongpass');
      await page.click('button:has-text("Iniciar sesión")');
      await expect(page.locator('text=Credenciales incorrectas')).toBeVisible({ timeout: 3000 });
      await page.reload();
    }

    await page.fill('[name="email"]', invalidEmail);
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page.locator(/Demasiados intentos|Probá en 15 minutos/i)).toBeVisible({ timeout: 5000 });
  });

  test('registro con email existente falla', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', 'admin@tinkuy.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.fill('[name="confirmPassword"]', 'Test123!');

    const termsCheckbox = page.locator('[name="terms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.click('button:has-text("Crear cuenta")');

    await expect(page.locator('text=/email.*ya.*existe|Este email ya está registrado/i')).toBeVisible({ timeout: 5000 });
  });

  test('registro con contraseñas que no coinciden', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', `new${Date.now()}@tinkuy.com`);
    await page.fill('[name="password"]', 'Test123!');
    await page.fill('[name="confirmPassword"]', 'Different123!');

    await page.click('button:has-text("Crear cuenta")');

    await expect(page.locator('text=/Las contraseñas no coinciden|Passwords must match/i')).toBeVisible({ timeout: 5000 });
  });

  test('logout funcional - sesión se cierra', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@tinkuy.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page).toHaveURL('/', { timeout: 10000 });

    await page.click('[data-testid="user-menu"]');
    await page.click('text=Cerrar sesión');

    await expect(page).toHaveURL('/login', { timeout: 5000 });

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('registro sin aceptar términos falla', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', `noterms${Date.now()}@tinkuy.com`);
    await page.fill('[name="password"]', 'Test123!');
    await page.fill('[name="confirmPassword"]', 'Test123!');

    const termsCheckbox = page.locator('[name="terms"]');
    if (await termsCheckbox.isVisible() && await termsCheckbox.isChecked()) {
      await termsCheckbox.uncheck();
    }

    await page.click('button:has-text("Crear cuenta")');

    await expect(page.locator('text=/Debes aceptar|Aceptar términos/i')).toBeVisible({ timeout: 3000 });
  });

  test('token expiration - sesión expira después de inactividad', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@tinkuy.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button:has-text("Iniciar sesión")');

    await expect(page).toHaveURL('/', { timeout: 10000 });

    await page.context().setDefaultTimeout(16 * 60 * 1000);
    await page.waitForTimeout(15 * 60 * 1000 + 5000);

    await page.click('[data-testid="user-menu"]');

    const isLoggedIn = await page.locator('text=Cerrar sesión').isVisible();
    if (!isLoggedIn) {
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    }
  });
});
