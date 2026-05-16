import { builder } from '@/graphql/builder';
import { successResponse, errorResponse } from '@/lib/graphql/response';
import { handleAppError, formatGraphQLErrors, createAppError } from '@/lib/errors';
import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, mergeGuestCart, CartItemResult } from '@/modules/cart/service';
import { refreshAccessToken, revokeRefreshToken, revokeAllUserSessions, createPasswordResetToken, verifyPasswordResetToken, resetPassword, authenticateUser, createUser, createAuthTokens, getUserFromToken, hashPassword } from '@/modules/auth/service';
import { processApprovedPayment, handlePaymentRejected, handlePaymentPending } from '@/modules/checkout/service';
import '@/modules/reviews/resolver';
import '@/modules/newsletter/resolver';
import '@/modules/loyalty/resolver';

const prisma = new PrismaClient();

const AddToCartInput = builder.inputType('AddToCartInput', {
  fields: (t) => ({
    productId: t.string({ required: true }),
    quantity: t.int({ required: true }),
    variantId: t.string(),
  }),
});

const RemoveFromCartInput = builder.inputType('RemoveFromCartInput', {
  fields: (t) => ({
    cartItemId: t.string({ required: true }),
  }),
});

const UpdateQuantityInput = builder.inputType('UpdateQuantityInput', {
  fields: (t) => ({
    cartItemId: t.string({ required: true }),
    quantity: t.int({ required: true }),
  }),
});

const RegisterInput = builder.inputType('RegisterInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    firstName: t.string(),
    lastName: t.string(),
  }),
});

const LoginInput = builder.inputType('LoginInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

const CreateProductInput = builder.inputType('CreateProductInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    slug: t.string({ required: true }),
    description: t.string(),
    shortDescription: t.string(),
    basePrice: t.float({ required: true }),
    categoryId: t.string({ required: true }),
    stock: t.int({ defaultValue: 0 }),
    isActive: t.boolean({ defaultValue: true }),
    isFeatured: t.boolean({ defaultValue: false }),
    isOrganic: t.boolean({ defaultValue: false }),
    isVegan: t.boolean({ defaultValue: false }),
    isGlutenFree: t.boolean({ defaultValue: false }),
    isKeto: t.boolean({ defaultValue: false }),
    brand: t.string(),
    images: t.stringList({ defaultValue: [] }),
  }),
});

const UpdateProductInput = builder.inputType('UpdateProductInput', {
  fields: (t) => ({
    name: t.string(),
    description: t.string(),
    shortDescription: t.string(),
    basePrice: t.float(),
    stock: t.int(),
    isActive: t.boolean(),
    isFeatured: t.boolean(),
    isOrganic: t.boolean(),
    isVegan: t.boolean(),
    isGlutenFree: t.boolean(),
    isKeto: t.boolean(),
    brand: t.string(),
  }),
});

const ShippingAddressInput = builder.inputType('ShippingAddressInput', {
  fields: (t) => ({
    street: t.string({ required: true }),
    number: t.string({ required: true }),
    apartment: t.string(),
    city: t.string({ required: true }),
    state: t.string({ required: true }),
    postalCode: t.string({ required: true }),
    country: t.string({ defaultValue: 'Argentina' }),
  }),
});

const CreateOrderInput = builder.inputType('CreateOrderInput', {
  fields: (t) => ({
    guestEmail: t.string(),
    guestName: t.string(),
    guestPhone: t.string(),
    shippingAddress: t.field({ type: ShippingAddressInput, required: true }),
    couponCode: t.string(),
  }),
});

const WebhookInput = builder.inputType('WebhookInput', {
  fields: (t) => ({
    type: t.string({ required: true }),
    data: t.string({ required: true }),
    metadata: t.string(),
  }),
});

(builder.objectType as any)('GQLError', {
  fields: (t: any) => ({
    code: t.exposeString('code'),
    message: t.exposeString('message'),
    path: t.field({ type: [String], nullable: true }),
  }),
});

(builder.objectType as any)('CartItem', {
  fields: (t: any) => ({
    id: t.exposeID('id'),
    productId: t.exposeString('productId'),
    variantId: t.exposeString('variantId', { nullable: true }),
    name: t.exposeString('name'),
    price: t.exposeString('price'),
    quantity: t.exposeInt('quantity'),
    imageUrl: t.exposeString('imageUrl', { nullable: true }),
    total: t.exposeString('total'),
  }),
});

(builder.objectType as any)('Cart', {
  fields: (t: any) => ({
    id: t.exposeID('id'),
    items: t.field({ type: ['CartItem'] }),
    totalItems: t.exposeInt('totalItems'),
    totalAmount: t.exposeString('totalAmount'),
  }),
});

(builder.objectType as any)('CartResponse', {
  fields: (t: any) => ({
    success: t.exposeBoolean('success'),
    data: t.field({ type: 'Cart', nullable: true }),
    message: t.exposeString('message', { nullable: true }),
    errors: t.field({ type: ['GQLError'], nullable: true }),
  }),
});

(builder.objectType as any)('User', {
  fields: (t: any) => ({
    id: t.exposeString('id'),
    email: t.exposeString('email'),
    firstName: t.exposeString('firstName', { nullable: true }),
    lastName: t.exposeString('lastName', { nullable: true }),
    role: t.exposeString('role'),
  }),
});

(builder.objectType as any)('AuthUser', {
  fields: (t: any) => ({
    id: t.exposeString('id'),
    email: t.exposeString('email'),
    role: t.exposeString('role'),
    firstName: t.exposeString('firstName', { nullable: true }),
    lastName: t.exposeString('lastName', { nullable: true }),
  }),
});

(builder.objectType as any)('AuthPayload', {
  fields: (t: any) => ({
    accessToken: t.exposeString('accessToken'),
    refreshToken: t.exposeString('refreshToken'),
    expiresIn: t.exposeInt('expiresIn'),
    user: t.field({ type: 'AuthUser' }),
  }),
});

(builder.objectType as any)('AuthResponse', {
  fields: (t: any) => ({
    success: t.exposeBoolean('success'),
    data: t.field({ type: 'AuthPayload', nullable: true }),
    message: t.exposeString('message', { nullable: true }),
    errors: t.field({ type: ['GQLError'], nullable: true }),
  }),
});

(builder.objectType as any)('ProductImage', {
  fields: (t: any) => ({
    id: t.exposeID('id'),
    url: t.exposeString('url'),
    altText: t.exposeString('altText', { nullable: true }),
  }),
});

(builder.objectType as any)('ProductVariant', {
  fields: (t: any) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    price: t.exposeFloat('price'),
    stock: t.exposeInt('stock'),
  }),
});

(builder.objectType as any)('Category', {
  fields: (t: any) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    description: t.exposeString('description', { nullable: true }),
  }),
});

(builder.objectType as any)('Product', {
  fields: (t: any) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    description: t.exposeString('description', { nullable: true }),
    shortDescription: t.exposeString('shortDescription', { nullable: true }),
    basePrice: t.exposeFloat('basePrice'),
    stock: t.exposeInt('stock'),
    isActive: t.exposeBoolean('isActive'),
    isFeatured: t.exposeBoolean('isFeatured'),
    isOrganic: t.exposeBoolean('isOrganic'),
    isVegan: t.exposeBoolean('isVegan'),
    isGlutenFree: t.exposeBoolean('isGlutenFree'),
    isKeto: t.exposeBoolean('isKeto'),
    brand: t.exposeString('brand', { nullable: true }),
    category: t.field({ type: 'Category' }),
    images: t.field({ type: ['ProductImage'] }),
    variants: t.field({ type: ['ProductVariant'] }),
  }),
});

(builder.objectType as any)('ProductConnection', {
  fields: (t: any) => ({
    items: t.field({ type: ['Product'] }),
    total: t.exposeInt('total'),
    hasMore: t.exposeBoolean('hasMore'),
  }),
});

(builder.objectType as any)('ProductResponse', {
  fields: (t: any) => ({
    success: t.exposeBoolean('success'),
    data: t.field({ type: 'Product', nullable: true }),
    errors: t.field({ type: ['GQLError'], nullable: true }),
  }),
});

(builder.objectType as any)('OrderItem', {
  fields: (t: any) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    price: t.exposeFloat('price'),
    quantity: t.exposeInt('quantity'),
    total: t.exposeFloat('total'),
    productId: t.exposeString('productId', { nullable: true }),
    variantId: t.exposeString('variantId', { nullable: true }),
  }),
});

(builder.objectType as any)('Order', {
  fields: (t: any) => ({
    id: t.exposeID('id'),
    orderNumber: t.exposeString('orderNumber'),
    status: t.exposeString('status'),
    paymentStatus: t.exposeString('paymentStatus'),
    totalAmount: t.exposeFloat('totalAmount'),
    subtotal: t.exposeFloat('subtotal'),
    shippingCost: t.exposeFloat('shippingCost'),
    discount: t.exposeFloat('discount'),
    guestEmail: t.exposeString('guestEmail', { nullable: true }),
    guestName: t.exposeString('guestName', { nullable: true }),
    shippingAddress: t.expose('shippingAddress', { type: 'JSON', nullable: true }),
    items: t.field({ type: ['OrderItem'] }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

(builder.objectType as any)('OrderResponse', {
  fields: (t: any) => ({
    success: t.exposeBoolean('success'),
    data: t.field({ type: 'Order', nullable: true }),
    errors: t.field({ type: ['GQLError'], nullable: true }),
  }),
});

(builder.objectType as any)('WebhookResponse', {
  fields: (t: any) => ({
    success: t.exposeBoolean('success'),
    message: t.exposeString('message', { nullable: true }),
  }),
});

builder.queryType({
  fields: (t) => ({
    cart: t.field({
      type: 'CartResponse',
      resolve: async (_root: any, _args: any, ctx: any) => {
        try {
          const cart = await getCart(ctx.userId, ctx.sessionId);
          return successResponse(cart);
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    } as any),

    me: t.field({
      type: 'User',
      resolve: async (_root: unknown, _args: Record<string, never>, ctx: { userId?: string }) => {
        if (!ctx.userId) {
          throw new Error('No autenticado');
        }
        const user = await prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { id: true, email: true, firstName: true, lastName: true, role: true },
        });
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        return user;
      },
    } as any),

    products: t.field({
      type: 'ProductConnection',
      args: {
        first: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        categorySlug: t.arg.string(),
        search: t.arg.string(),
      },
      resolve: async (_root: any, args: any) => {
        const where: Record<string, unknown> = { isActive: true };
        if (args.categorySlug) {
          where.category = { slug: args.categorySlug };
        }
        if (args.search) {
          where.OR = [
            { name: { contains: args.search, mode: 'insensitive' } },
            { description: { contains: args.search, mode: 'insensitive' } },
          ];
        }

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            include: {
              category: { select: { id: true, name: true, slug: true } },
              images: { take: 1 },
              variants: { where: { isActive: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: args.first,
            skip: args.skip,
          }),
          prisma.product.count({ where }),
        ]);

        return {
          items: products.map((p) => ({
            ...p,
            basePrice: Number(p.basePrice),
            images: p.images.map((i) => ({ ...i, url: i.url })),
          })),
          total,
          hasMore: (args.skip || 0) + products.length < total,
        };
      },
    } as any),

    product: t.field({
      type: 'Product',
      args: { slug: t.arg.string({ required: true }) },
      resolve: async (_root: any, args: any) => {
        const product = await prisma.product.findUnique({
          where: { slug: args.slug },
          include: {
            category: true,
            images: true,
            variants: { where: { isActive: true } },
          },
        });
        if (!product) {
          throw new Error('Producto no encontrado');
        }
        return {
          ...product,
          basePrice: Number(product.basePrice),
        };
      },
    } as any),

    categories: t.field({
      type: ['Category'],
      resolve: async () => {
        return prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        });
      },
    } as any),

    myOrders: t.field({
      type: ['Order'],
      resolve: async (_root: unknown, _args: Record<string, never>, ctx: { userId?: string }) => {
        if (!ctx.userId) {
          throw new Error('No autenticado');
        }
        return prisma.order.findMany({
          where: { userId: ctx.userId },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        });
      },
    } as any),

    order: t.field({
      type: 'Order',
      args: { id: t.arg.string({ required: true }) },
      resolve: async (_root: unknown, args: { id: string }, ctx: { userId?: string; user?: { role: string } }) => {
        const order = await prisma.order.findUnique({
          where: { id: args.id },
          include: { items: true },
        });
        if (!order) {
          throw new Error('Pedido no encontrado');
        }
        if (order.userId && order.userId !== ctx.userId && ctx.user?.role !== 'ADMIN') {
          throw new Error('No tienes permiso para ver este pedido');
        }
        return {
          ...order,
          totalAmount: Number(order.totalAmount),
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shippingCost),
          discount: Number(order.discount),
          items: order.items.map((i) => ({
            ...i,
            price: Number(i.price),
            total: Number(i.total),
          })),
        };
      },
    } as any),

    orders: t.field({
      type: ['Order'],
      resolve: async (_root: any, _args: any, ctx: any) => {
        if (!ctx.userId || ctx.user?.role !== 'ADMIN') {
          throw new Error('No tienes permiso');
        }
        return prisma.order.findMany({
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        });
      },
    } as any),
  }),
});

builder.mutationType({
  fields: (t) => ({
    login: t.field({
      type: 'AuthResponse',
      args: {
        email: t.arg.string({ required: true }),
        password: t.arg.string({ required: true }),
      },
      resolve: async (_root: any, args: any) => {
        try {
          const user = await authenticateUser(args.email, args.password);
          if (!user) {
            return errorResponse(
              [{ code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' }],
              'Authentication failed'
            );
          }
          const tokens = await createAuthTokens(user.id);
          return successResponse({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            user: {
              id: tokens.user!.id,
              email: tokens.user!.email,
              role: tokens.user!.role,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          });
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    } as any),

    register: t.field({
      type: 'AuthResponse',
      args: {
        input: t.arg({ type: RegisterInput, required: true }),
      },
      resolve: async (_root: unknown, args: any) => {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: args.input.email },
          });
          if (existing) {
            return errorResponse(
              [{ code: 'EMAIL_EXISTS', message: 'El email ya está registrado' }],
              'Registration failed'
            );
          }

          const user = await createUser(
            args.input.email,
            args.input.password,
            args.input.firstName,
            args.input.lastName
          );
          const tokens = await createAuthTokens(user.id);

          return successResponse({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          });
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    }),

    addToCart: t.field({
      type: 'CartResponse',
      args: {
        input: t.arg({ type: AddToCartInput, required: true }),
      },
      resolve: async (_root: unknown, { input }: any, ctx: any) => {
        try {
          const cart = await addToCart(ctx.userId || null, ctx.sessionId || null, input);
          return successResponse(cart, 'Producto agregado al carrito');
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    }),

    removeFromCart: t.field({
      type: 'CartResponse',
      args: {
        input: t.arg({ type: RemoveFromCartInput, required: true }),
      },
      resolve: async (_root: unknown, { input }: any, ctx: any) => {
        try {
          const cart = await removeFromCart(ctx.userId || null, ctx.sessionId || null, input);
          return successResponse(cart, 'Producto eliminado del carrito');
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    }),

    updateCartItemQuantity: t.field({
      type: 'CartResponse',
      args: {
        input: t.arg({ type: UpdateQuantityInput, required: true }),
      },
      resolve: async (_root: unknown, { input }: any, ctx: any) => {
        try {
          const cart = await updateCartItemQuantity(ctx.userId || null, ctx.sessionId || null, input);
          return successResponse(cart, 'Cantidad actualizada');
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    }),

    mergeGuestCart: t.field({
      type: 'CartResponse',
      args: {
        guestCartId: t.arg.string({ required: true }),
      },
      resolve: async (_root: unknown, { guestCartId }: any, ctx: any) => {
        try {
          if (!ctx.userId) {
            return errorResponse(
              [{ code: 'AUTH_REQUIRED', message: 'Debe iniciar sesión' }],
              'Authentication required'
            );
          }
          const cart = await mergeGuestCart(ctx.userId, guestCartId);
          return successResponse(cart, 'Carritos combinados exitosamente');
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    }),

    createProduct: t.field({
      type: 'ProductResponse',
      args: {
        input: t.arg({ type: CreateProductInput, required: true }),
      },
      resolve: async (_root: unknown, args: any, ctx: any) => {
        if (!ctx.userId || ctx.user?.role !== 'ADMIN') {
          return errorResponse(
            [{ code: 'FORBIDDEN', message: 'No tienes permiso para crear productos' }],
            'Permission denied'
          );
        }
        try {
          const category = await prisma.category.findUnique({
            where: { id: args.input.categoryId },
          });
          if (!category) {
            return errorResponse(
              [{ code: 'CATEGORY_NOT_FOUND', message: 'Categoría no encontrada' }],
              'Category not found'
            );
          }

          const product = await prisma.product.create({
            data: {
              name: args.input.name,
              slug: args.input.slug,
              description: args.input.description,
              shortDescription: args.input.shortDescription,
              basePrice: args.input.basePrice,
              stock: args.input.stock || 0,
              isActive: args.input.isActive ?? true,
              isFeatured: args.input.isFeatured ?? false,
              isOrganic: args.input.isOrganic ?? false,
              isVegan: args.input.isVegan ?? false,
              isGlutenFree: args.input.isGlutenFree ?? false,
              isKeto: args.input.isKeto ?? false,
              brand: args.input.brand,
              categoryId: args.input.categoryId,
            },
          });

          if (args.input.images && args.input.images.length > 0) {
            await prisma.productImage.createMany({
              data: args.input.images.map((url: string, index: number) => ({
                productId: product.id,
                url,
                sortOrder: index,
              })),
            });
          }

          const created = await prisma.product.findUnique({
            where: { id: product.id },
            include: {
              category: true,
              images: true,
              variants: { where: { isActive: true } },
            },
          });

          return successResponse({
            ...created,
            basePrice: Number(created!.basePrice),
          });
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    }),

    updateProduct: t.field({
      type: 'ProductResponse',
      args: {
        id: t.arg.string({ required: true }),
        input: t.arg({ type: UpdateProductInput, required: true }),
      },
      resolve: async (_root: unknown, args: any, ctx: any) => {
        if (!ctx.userId || ctx.user?.role !== 'ADMIN') {
          return errorResponse(
            [{ code: 'FORBIDDEN', message: 'No tienes permiso' }],
            'Permission denied'
          );
        }
        try {
          const product = await prisma.product.update({
            where: { id: args.id },
            data: args.input,
            include: {
              category: true,
              images: true,
              variants: { where: { isActive: true } },
            },
          });
          return successResponse({
            ...product,
            basePrice: Number(product.basePrice),
          });
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    }),

    deleteProduct: t.field({
      type: 'Boolean',
      args: { id: t.arg.string({ required: true }) },
      resolve: async (_root: unknown, args: { id: string }, ctx: { userId?: string; user?: { role: string } }) => {
        if (!ctx.userId || ctx.user?.role !== 'ADMIN') {
          throw new Error('No tienes permiso');
        }
        await prisma.product.delete({ where: { id: args.id } });
        return true;
      },
    }),

    createOrder: t.field({
      type: 'OrderResponse',
      args: {
        input: t.arg({ type: CreateOrderInput, required: true }),
      },
      resolve: async (_root: unknown, args: any, ctx: any) => {
        try {
          const cart = await getCart(ctx.userId || null, ctx.sessionId || null);

          if (!cart || cart.items.length === 0) {
            return errorResponse(
              [{ code: 'CART_EMPTY', message: 'El carrito está vacío' }],
              'Cart is empty'
            );
          }

          let userId: string | null = ctx.userId || null;

          const subtotal = cart.items.reduce((sum: number, item: CartItemResult) => {
            return sum + parseFloat(item.price) * item.quantity;
          }, 0);

          const shippingCost = 0;
          const discount = 0;
          const totalAmount = subtotal + shippingCost - discount;

          const orderNumber = `TNK-${Date.now().toString(36).toUpperCase()}`;

          const order = await prisma.order.create({
            data: {
              orderNumber,
              status: 'PENDING',
              paymentStatus: 'PENDING',
              totalAmount,
              subtotal,
              shippingCost,
              discount,
              userId,
              guestEmail: args.input.guestEmail,
              guestName: args.input.guestName,
              guestPhone: args.input.guestPhone,
              shippingAddress: args.input.shippingAddress,
              couponCode: args.input.couponCode,
              items: {
                create: cart.items.map((item: CartItemResult) => ({
                  name: item.name,
                  price: parseFloat(item.price),
                  quantity: item.quantity,
                  total: parseFloat(item.total),
                  productId: item.productId,
                  variantId: item.variantId,
                })),
              },
            },
            include: { items: true },
          });

          return successResponse({
            ...order,
            totalAmount: Number(order.totalAmount),
            subtotal: Number(order.subtotal),
            shippingCost: Number(order.shippingCost),
            discount: Number(order.discount),
            items: order.items.map((i) => ({
              ...i,
              price: Number(i.price),
              total: Number(i.total),
            })),
          });
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    }),

    updateOrderStatus: t.field({
      type: 'OrderResponse',
      args: {
        id: t.arg.string({ required: true }),
        status: t.arg.string({ required: true }),
      },
      resolve: async (_root: unknown, args: any, ctx: any) => {
        if (!ctx.userId || ctx.user?.role !== 'ADMIN') {
          throw new Error('No tienes permiso');
        }
        try {
          const order = await prisma.order.update({
            where: { id: args.id },
            data: { status: args.status as OrderStatus },
            include: { items: true },
          });
          return successResponse({
            ...order,
            totalAmount: Number(order.totalAmount),
            subtotal: Number(order.subtotal),
            shippingCost: Number(order.shippingCost),
            discount: Number(order.discount),
            items: order.items.map((i) => ({
              ...i,
              price: Number(i.price),
              total: Number(i.total),
            })),
          });
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    } as any),

    processWebhook: t.field({
      type: 'WebhookResponse',
      args: {
        input: t.arg({ type: WebhookInput, required: true }),
      },
      resolve: async (_root: unknown, args: any, ctx: any) => {
        if (!ctx.userId || ctx.user?.role !== 'ADMIN') {
          throw new Error('No tienes permiso');
        }
        try {
          const data = JSON.parse(args.input.data);
          const metadata = args.input.metadata ? JSON.parse(args.input.metadata) : {};

          if (args.input.type === 'payment') {
            const status = data.status;
            const paymentId = data.id;
            const orderId = metadata.orderId;

            if (status === 'approved') {
              await processApprovedPayment(paymentId);
            } else if (status === 'pending') {
              await handlePaymentPending(paymentId);
            } else if (status === 'rejected') {
              await handlePaymentRejected(paymentId);
            }
          }

          return { success: true, message: 'Webhook processed' };
        } catch (error) {
          console.error('Webhook error:', error);
          return { success: false, message: 'Webhook processing failed' };
        }
      },
    } as any),

    refreshToken: t.field({
      type: 'AuthResponse',
      args: {
        refreshToken: t.arg.string({ required: true }),
      },
      resolve: async (_root: unknown, { refreshToken }: any) => {
        try {
          const payload = await refreshAccessToken({ refreshToken });
          return successResponse(payload);
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    } as any),

    revokeRefreshToken: t.field({
      type: 'Boolean',
      args: {
        token: t.arg.string({ required: true }),
      },
      resolve: async (_root: unknown, { token }: any) => {
        try {
          await revokeRefreshToken(token);
          return true;
        } catch (error) {
          const appError = handleAppError(error);
          throw new Error(appError.message);
        }
      },
    } as any),

    revokeAllSessions: t.field({
      type: 'Int',
      resolve: async (_root: unknown, _args: any, ctx: any) => {
        try {
          if (!ctx.userId) {
            throw new Error('Authentication required');
          }
          const count = await revokeAllUserSessions(ctx.userId);
          return count;
        } catch (error) {
          const appError = handleAppError(error);
          throw new Error(appError.message);
        }
      },
    } as any),

    forgotPassword: t.field({
      type: 'Boolean',
      args: {
        email: t.arg.string({ required: true }),
      },
      resolve: async (_root: unknown, { email }: any) => {
        try {
          await createPasswordResetToken(email);
          return true;
        } catch (error) {
          console.error('Forgot password error:', error);
          return true;
        }
      },
    } as any),

    resetPassword: t.field({
      type: 'Boolean',
      args: {
        token: t.arg.string({ required: true }),
        newPassword: t.arg.string({ required: true }),
      },
      resolve: async (_root: unknown, { token, newPassword }: any) => {
        try {
          const isValid = await verifyPasswordResetToken(token);
          if (!isValid) {
            throw new Error('Token inválido o expirado');
          }
          await resetPassword(token, newPassword);
          return true;
        } catch (error) {
          const appError = handleAppError(error);
          throw new Error(appError.message);
        }
      },
    } as any),
  }),
});

export const schema = builder.toSchema();
