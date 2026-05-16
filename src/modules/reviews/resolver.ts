import { builder } from '@/graphql/builder';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

builder.objectType('Review', {
  fields: (t) => ({
    id: t.exposeID('id'),
    productId: t.exposeString('productId'),
    userId: t.exposeString('userId'),
    rating: t.exposeInt('rating'),
    title: t.exposeString('title', { nullable: true }),
    comment: t.exposeString('comment', { nullable: true }),
    isApproved: t.exposeBoolean('isApproved'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    user: t.field({
      type: 'UserBasic',
      resolve: (review) => ({
        firstName: review.user?.firstName || 'Usuario',
        lastName: review.user?.lastName || '',
      }),
    }),
  }),
});

builder.objectType('UserBasic', {
  fields: (t) => ({
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
  }),
});

builder.objectType('ReviewConnection', {
  fields: (t) => ({
    reviews: t.field({ type: ['Review'], resolve: (parent) => parent.reviews }),
    total: t.exposeInt('total'),
    hasMore: t.exposeBoolean('hasMore'),
  }),
});

const CreateReviewInput = builder.inputType('CreateReviewInput', {
  fields: (t) => ({
    productId: t.string({ required: true }),
    rating: t.int({ required: true }),
    title: t.string(),
    comment: t.string(),
  }),
});

async function checkUserHasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      paymentStatus: 'PAID',
      items: { some: { productId } },
    },
  });
  return !!order;
}

builder.mutationType({
  fields: (t) => ({
    createReview: t.field({
      type: 'Review',
      nullable: true,
      args: { input: t.arg({ type: CreateReviewInput, required: true }) },
      authScopes: { user: true },
      resolve: async (_parent: unknown, { input }: any, ctx: any) => {
        if (!ctx.userId) {
          throw new Error('No autenticado');
        }

        const hasPurchased = await checkUserHasPurchasedProduct(ctx.userId, input.productId);
        if (!hasPurchased) {
          throw new Error('Solo puedes opinar sobre productos que hayas comprado');
        }

        const existingReview = await prisma.review.findUnique({
          where: {
            productId_userId: {
              productId: input.productId,
              userId: ctx.userId,
            },
          },
        });
        if (existingReview) {
          throw new Error('Ya dejaste una opinión sobre este producto');
        }

        return prisma.review.create({
          data: {
            productId: input.productId,
            userId: ctx.userId,
            rating: input.rating,
            title: input.title,
            comment: input.comment,
            isApproved: false,
          },
        });
      },
    }),

    approveReview: t.field({
      type: 'Review',
      args: { reviewId: t.arg.string({ required: true }) },
      authScopes: { role: 'admin' },
      resolve: async (_parent: unknown, { reviewId }: any, ctx: any) => {
        if (!ctx.userId) {
          throw new Error('No autenticado');
        }
        return prisma.review.update({
          where: { id: reviewId },
          data: {
            isApproved: true,
            approvedAt: new Date(),
            approvedBy: ctx.userId,
          },
        });
      },
    } as any),

    deleteReview: t.field({
      type: 'Boolean',
      args: { reviewId: t.arg.string({ required: true }) },
      authScopes: { user: true },
      resolve: async (_parent: unknown, { reviewId }: any, ctx: any) => {
        if (!ctx.userId) {
          throw new Error('No autenticado');
        }

        const review = await prisma.review.findUnique({
          where: { id: reviewId },
        });

        if (!review) {
          throw new Error('Review no encontrado');
        }

        if (review.userId !== ctx.userId && ctx.user?.role !== 'ADMIN') {
          throw new Error('No tienes permiso para eliminar esta opinión');
        }

        await prisma.review.delete({ where: { id: reviewId } });
        return true;
      },
    } as any),
  }),
});

builder.queryType({
  fields: (t) => ({
    productReviews: t.field({
      type: 'ReviewConnection',
      args: {
        productId: t.arg.string({ required: true }),
        first: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
      },
      resolve: async (_parent: unknown, { productId, first, skip }: any) => {
        const [reviews, total] = await Promise.all([
          prisma.review.findMany({
            where: { productId, isApproved: true },
            include: { user: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
            take: first,
            skip,
          }),
          prisma.review.count({ where: { productId, isApproved: true } }),
        ]);

        return {
          reviews,
          total,
          hasMore: skip + reviews.length < total,
        };
      },
    } as any),

    productRatingSummary: t.field({
      type: 'RatingSummary',
      args: { productId: t.arg.string({ required: true }) },
      resolve: async (_parent: unknown, { productId }: any) => {
        const reviews = await prisma.review.findMany({
          where: { productId, isApproved: true },
          select: { rating: true },
        });

        if (reviews.length === 0) {
          return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }

        const total = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
        const averageRating = total / reviews.length;

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r: any) => {
          distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
        });

        return {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length,
          distribution,
        };
      },
    } as any),
  }),
});

builder.objectType('RatingSummary', {
  fields: (t) => ({
    averageRating: t.exposeFloat('averageRating'),
    totalReviews: t.exposeInt('totalReviews'),
    distribution: t.expose('distribution', {
      type: 'JSON',
    }),
  }),
});
