import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('register new user', async ({ page }) => {
    await page.goto('/register')
    
    const email = `test${Date.now()}@example.com`
    
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', 'Test123456!')
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    
    await page.click('text=Crear cuenta')
    
    // Debería redirigir a home o perfil
    await expect(page).not.toHaveURL(/\/register/)
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    await page.click('text=Iniciar sesión')
    
    // Verificar mensaje de error
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible()
  })
})
