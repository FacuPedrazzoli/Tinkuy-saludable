import { builder } from '@/graphql/builder';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

builder.objectType('NewsletterSubscriber', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    isActive: t.exposeBoolean('isActive'),
    subscribedAt: t.expose('subscribedAt', { type: 'DateTime' }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    subscribeToNewsletter: t.field({
      type: 'NewsletterSubscriber',
      args: {
        email: t.arg.string({ required: true }),
        source: t.arg.string({ defaultValue: 'FOOTER' }),
      },
      resolve: async (_parent: unknown, { email, source }: { email: string; source?: string }) => {
        const emailSchema = z.string().email();
        if (!emailSchema.safeParse(email).success) {
          throw new Error('Email inválido');
        }

        const existing = await prisma.newsletterSubscriber.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (existing?.unsubscribedAt) {
          return prisma.newsletterSubscriber.update({
            where: { email: email.toLowerCase() },
            data: {
              isActive: true,
              unsubscribedAt: null,
              source: source || undefined,
            },
          });
        }

        if (existing) {
          if (existing.isActive) {
            throw new Error('Este email ya está suscripto');
          }
          return prisma.newsletterSubscriber.update({
            where: { email: email.toLowerCase() },
            data: { isActive: true, source: source || undefined },
          });
        }

        return prisma.newsletterSubscriber.create({
          data: {
            email: email.toLowerCase(),
            source: source || undefined,
          },
        });
      },
    }),

    unsubscribeFromNewsletter: t.field({
      type: 'Boolean',
      args: { email: t.arg.string({ required: true }) },
      resolve: async (_parent: unknown, { email }: { email: string }) => {
        await prisma.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: { isActive: false, unsubscribedAt: new Date() },
        });
        return true;
      },
    }),
  }),
});

builder.queryType({
  fields: (t) => ({
    newsletterStats: t.field({
      type: 'NewsletterStats',
      authScopes: { role: 'admin' },
      resolve: async () => {
        const [total, active, thisMonth] = await Promise.all([
          prisma.newsletterSubscriber.count(),
          prisma.newsletterSubscriber.count({ where: { isActive: true } }),
          prisma.newsletterSubscriber.count({
            where: {
              subscribedAt: { gte: new Date(new Date().setDate(1)) },
            },
          }),
        ]);

        return { total, active, thisMonth };
      },
    }),
  }),
});

builder.objectType('NewsletterStats', {
  fields: (t) => ({
    total: t.exposeInt('total'),
    active: t.exposeInt('active'),
    thisMonth: t.exposeInt('thisMonth'),
  }),
});
