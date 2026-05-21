import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POINTS_PER_PESOS = 100;
const POINTS_REDEMPTION_RATE = 0.01;

export async function earnPoints(orderId: string, userId: string): Promise<number> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { totalAmount: true, userId: true },
  });

  if (!order || order.userId !== userId) {
    throw new Error('Orden no encontrada');
  }

  const pointsEarned = Math.floor(Number(order.totalAmount) / POINTS_PER_PESOS);

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 12);

  await prisma.loyaltyPoint.create({
    data: {
      userId,
      orderId,
      points: pointsEarned,
      type: 'EARN',
      description: `Puntos ganados por orden #${orderId}`,
      expiresAt,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { loyaltyPoints: { increment: pointsEarned } },
  });

  return pointsEarned;
}

export async function redeemPoints(
  userId: string,
  pointsToRedeem: number,
  orderId?: string
): Promise<{ pointsRedeemed: number; discountAmount: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true },
  });

  if (!user || user.loyaltyPoints < pointsToRedeem) {
    throw new Error('Puntos insuficientes');
  }

  const discountAmount = pointsToRedeem * POINTS_REDEMPTION_RATE;

  await prisma.loyaltyPoint.create({
    data: {
      userId,
      orderId,
      points: -pointsToRedeem,
      type: 'REDEEM',
      description: `Canje de ${pointsToRedeem} puntos por $${discountAmount.toFixed(2)}`,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { loyaltyPoints: { decrement: pointsToRedeem } },
  });

  return { pointsRedeemed: pointsToRedeem, discountAmount };
}

export function getLoyaltyTier(points: number): { tier: string; color: string; benefits: string[] } {
  if (points >= 2000) {
    return {
      tier: 'Árbol',
      color: '#4A7C59',
      benefits: [
        '5% de descuento en todas las compras',
        'Envío gratis prioritario',
        'Acceso anticipado a ofertas',
      ],
    };
  } else if (points >= 500) {
    return {
      tier: 'Brote',
      color: '#9CAF88',
      benefits: [
        '3% de descuento en todas las compras',
        'Envío gratis en compras +$10.000',
      ],
    };
  }
  return {
    tier: 'Semilla',
    color: '#C4956A',
    benefits: ['Puntos dobles en tu primera compra'],
  };
}

export async function getUserPointsHistory(userId: string) {
  return prisma.loyaltyPoint.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getUserPointsSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true },
  });

  if (!user) {
    return null;
  }

  const pointsHistory = await prisma.loyaltyPoint.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const activePoints = pointsHistory.reduce((sum, record) => {
    const expiryDate = record.expiresAt;
    if (expiryDate && expiryDate < new Date()) {
      return sum;
    }
    return sum + record.points;
  }, 0);

  const tier = getLoyaltyTier(activePoints);

  return {
    currentPoints: activePoints,
    tier: tier.tier,
    tierColor: tier.color,
    benefits: tier.benefits,
  };
}
