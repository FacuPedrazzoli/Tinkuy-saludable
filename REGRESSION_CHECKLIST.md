# Checklist de Regresión - Pre-Deploy (15 min)

## Autenticación

- [ ] Registro nuevo funciona (/register)
- [ ] Registro con email duplicado muestra error
- [ ] Registro sin aceptar términos muestra error
- [ ] Login con credenciales válidas funciona
- [ ] Login con credenciales inválidas muestra error genérico
- [ ] Login admin@tinkuy.com redirige a /admin
- [ ] Logout funciona y limpia sesión
- [ ] Rate limiting bloquea después de 6 intentos fallidos
- [ ] Ruta protegida sin sesión redirige a /login

## Carrito

- [ ] Agregar producto funciona
- [ ] Agregar mismo producto con diferente peso crea item separado
- [ ] Eliminar producto funciona
- [ ] Cambiar cantidad funciona
- [ ] Cantidad 0 elimina el producto
- [ ] Total calcula correcto
- [ ] Total con descuento calcula correcto
- [ ] Badge muestra cantidad correcta
- [ ] Carrito persiste en localStorage
- [ ] Carrito se abre/cierra con toggle

## Checkout - Contacto

- [ ] Paso 1 (contacto) valida campos obligatorios
- [ ] Email inválido muestra error
- [ ] Teléfono inválido muestra error
- [ ] Click continuar avanza al paso 2

## Checkout - Shipping

- [ ] Paso 2 (envío) valida campos obligatorios
- [ ] Dirección inválida muestra error
- [ ] Click continuar avanza al paso 3
- [ ] Click atrás vuelve al paso 1

## Checkout - Payment

- [ ] Selección de método de pago funciona
- [ ] MercadoPago sandbox carga correctamente
- [ ] Tarjeta válida completa pago
- [ ] Tarjeta inválida muestra error

## Checkout -结果 Pages

- [ ] /success existe y muestra número de orden
- [ ] /success muestra productos comprados
- [ ] /failure existe y muestra mensaje de error
- [ ] /failure preserva carrito
- [ ] /pending existe y muestra instrucciones

## Cupones

- [ ] Cupón válido (BIENVENIDO10) aplica 10% descuento
- [ ] Cupón inválido (EXPIRED2024) muestra error
- [ ] Cupón de un solo uso no se puede reuse

## Stock

- [ ] Producto con stock bajo muestra "Última unidad"
- [ ] No permite agregar más del stock disponible
- [ ] Stock se descuenta tras compra exitosa
- [ ] Stock 0 marca producto como agotado

## Wishlist

- [ ] Click corazón agrega a wishlist
- [ ] /wishlist muestra productos agregados
- [ ] Click corazón en wishlist elimina producto
- [ ] Badge wishlist actualiza

## Admin

- [ ] Dashboard /admin accesible para admin
- [ ] Crear producto funciona
- [ ] Editar producto funciona
- [ ] Eliminar producto funciona
- [ ] Ver órdenes funciona
- [ ] Cambiar estado de orden funciona

## Mobile Responsive

- [ ] Nav funciona en mobile
- [ ] Carrito funciona en mobile
- [ ] Checkout completo funcional en 375px
- [ ] BottomNav visible en mobile
- [ ] BottomNav badge muestra correctamente

## Navegación

- [ ] Logo clickeable lleva a home
- [ ] Menú de usuario abre dropdown
- [ ] Carrito icon muestra badge
- [ ] Búsqueda funciona

## Errores y Edge Cases

- [ ] Error de red muestra mensaje apropiado
- [ ] Página 404 existe y es amigable
- [ ] Página 500 existe y es amigable
- [ ] Formato de precios correcto en ARS
- [ ] Fechas en formato local

## Performance

- [ ] Página carga en < 3s
- [ ] Imágenes lazy load
- [ ] No errores de consola en production
