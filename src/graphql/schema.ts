import { builder } from '@/graphql/builder';
import { GQLResponse, successResponse, errorResponse } from '@/lib/graphql/response';
import { handleAppError, formatGraphQLErrors } from '@/lib/errors';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, mergeGuestCart } from '@/modules/cart/service';
import { refreshAccessToken, revokeRefreshToken, revokeAllUserSessions } from '@/modules/auth/service';
import '@/modules/reviews/resolver';
import '@/modules/newsletter/resolver';
import '@/modules/loyalty/resolver';

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

(builder.objectType as any)('AuthUser', {
  fields: (t: any) => ({
    id: t.exposeString('id'),
    email: t.exposeString('email'),
    role: t.exposeString('role'),
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

builder.queryType({
  fields: (t) => ({
    cart: t.field({
      type: 'CartResponse',
      resolve: async (_root: unknown, _args: unknown, ctx: any) => {
        try {
          const cart = await getCart(ctx.userId, ctx.sessionId);
          return successResponse(cart);
        } catch (error) {
          const appError = handleAppError(error);
          return errorResponse(formatGraphQLErrors([appError]), appError.message);
        }
      },
    } as any),
  }),
});

builder.mutationType({
  fields: (t) => ({
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
    } as any),

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
    } as any),

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
    } as any),

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
      resolve: async (_root: unknown, _args: unknown, ctx: any) => {
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
  }),
});

export const schema = builder.toSchema();
