import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function processApprovedPayment(paymentId: string): Promise<void> {
  const payment = await getMercadoPagoPayment(paymentId);
  if (!payment) {
    console.error(`Payment ${paymentId} not found`);
    return;
  }

  const externalReference = payment.external_reference;
  if (!externalReference) {
    console.error(`No external reference for payment ${paymentId}`);
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: externalReference },
    include: { items: true },
  });

  if (!order) {
    console.error(`Order ${externalReference} not found`);
    return;
  }

  await prisma.order.update({
    where: { id: externalReference },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
    },
  });

  for (const item of order.items) {
    if (item.productId) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  if (order.userId) {
    const { earnPoints } = await import('@/modules/loyalty/service');
    await earnPoints(externalReference, order.userId);
  }
}

async function getMercadoPagoPayment(paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function handlePaymentPending(paymentId: string): Promise<void> {
  const payment = await getMercadoPagoPayment(paymentId);
  if (!payment) return;

  const externalReference = payment.external_reference;
  if (!externalReference) return;

  await prisma.order.update({
    where: { id: externalReference },
    data: { paymentStatus: 'PENDING' },
  });
}

export async function handlePaymentRejected(paymentId: string): Promise<void> {
  const payment = await getMercadoPagoPayment(paymentId);
  if (!payment) return;

  const externalReference = payment.external_reference;
  if (!externalReference) return;

  const order = await prisma.order.findUnique({
    where: { id: externalReference },
    include: { items: true },
  });

  if (!order) return;

  await prisma.order.update({
    where: { id: externalReference },
    data: { paymentStatus: 'FAILED' },
  });

  for (const item of order.items) {
    if (item.productId) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }
}
