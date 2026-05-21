import { builder } from '@/graphql/builder';
import { PrismaClient } from '@prisma/client';
import { getUserPointsSummary, redeemPoints, getUserPointsHistory } from './service';

const prisma = new PrismaClient();

builder.objectType('LoyaltyPointsSummary', {
  fields: (t) => ({
    currentPoints: t.exposeInt('currentPoints'),
    tier: t.exposeString('tier'),
    tierColor: t.exposeString('tierColor'),
    benefits: t.exposeStringList('benefits'),
  }),
});

builder.objectType('LoyaltyPointRecord', {
  fields: (t) => ({
    id: t.exposeID('id'),
    points: t.exposeInt('points'),
    type: t.exposeString('type'),
    description: t.exposeString('description'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime', nullable: true }),
  }),
});

builder.objectType('RedemptionResult', {
  fields: (t) => ({
    pointsRedeemed: t.exposeInt('pointsRedeemed'),
    discountAmount: t.exposeFloat('discountAmount'),
  }),
});

builder.queryType({
  fields: (t) => ({
    myLoyaltyPoints: t.field({
      type: 'LoyaltyPointsSummary',
      authScopes: { user: true },
      resolve: async (_parent: unknown, _args: any, ctx: any) => {
        if (!ctx.userId) {
          throw new Error('No autenticado');
        }
        const summary = await getUserPointsSummary(ctx.userId);
        if (!summary) {
          throw new Error('Usuario no encontrado');
        }
        return summary;
      },
    } as any),

    myPointsHistory: t.field({
      type: ['LoyaltyPointRecord'],
      authScopes: { user: true },
      args: { limit: t.arg.int({ defaultValue: 20 }) },
      resolve: async (_parent: unknown, { limit }: any, ctx: any) => {
        if (!ctx.userId) {
          throw new Error('No autenticado');
        }
        return getUserPointsHistory(ctx.userId);
      },
    } as any),
  }),
});

builder.mutationType({
  fields: (t) => ({
    redeemPoints: t.field({
      type: 'RedemptionResult',
      authScopes: { user: true },
      args: {
        points: t.arg.int({ required: true }),
        orderId: t.arg.string(),
      },
      resolve: async (_parent: unknown, { points, orderId }: any, ctx: any) => {
        if (!ctx.userId) {
          throw new Error('No autenticado');
        }
        if (points <= 0) {
          throw new Error('Los puntos deben ser positivos');
        }
        return redeemPoints(ctx.userId, points, orderId || undefined);
      },
    } as any),
  }),
});
