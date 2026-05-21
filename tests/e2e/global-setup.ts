import { test as setup, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

setup('seed test data', async () => {
  await prisma.coupon.upsert({
    where: { code: 'BIENVENIDO10' },
    update: {},
    create: {
      code: 'BIENVENIDO10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxUses: 100,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'EXPIRED2024' },
    update: {},
    create: {
      code: 'EXPIRED2024',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxUses: 10,
      usedCount: 10,
      expiresAt: new Date('2024-12-31'),
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@tinkuy.com' },
    update: {},
    create: {
      email: 'admin@tinkuy.com',
      password: 'Admin123!',
      role: 'ADMIN',
      name: 'Admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'test@tinkuy.com' },
    update: {},
    create: {
      email: 'test@tinkuy.com',
      password: 'Test123!',
      role: 'USER',
      name: 'Test User',
    },
  });
});
