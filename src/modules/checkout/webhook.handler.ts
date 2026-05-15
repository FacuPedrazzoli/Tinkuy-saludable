import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function handleMercadoPagoWebhook(
  req: Request
): Promise<Response> {
  const signature = req.headers.get('x-signature');
  
  let body: object;
  if (req.body instanceof Buffer) {
    body = JSON.parse(req.body.toString());
  } else if (req.body instanceof ReadableStream) {
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let result;
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    body = JSON.parse(new TextDecoder().decode(combined));
  } else {
    body = req.body as unknown as object;
  }

  const rawPayload = JSON.stringify(body);

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 401 });
  }

  const isValid = verifyMercadoPagoSignature(
    rawPayload,
    signature,
    process.env.MP_WEBHOOK_SECRET || ''
  );

  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }

  const { type, data } = body as { type: string; data: { id?: string; status?: string } };
  const eventId = req.headers.get('x-idempotency-key') || data?.id;

  if (!eventId) {
    return new Response(JSON.stringify({ error: 'Missing event ID' }), { status: 400 });
  }

  const existingEvent = await prisma.webhookEvent.findUnique({
    where: {
      source_eventId: {
        source: 'mercadopago',
        eventId: String(eventId),
      },
    },
  });

  if (existingEvent?.processed) {
    return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 });
  }

  await prisma.webhookEvent.upsert({
    where: {
      source_eventId: {
        source: 'mercadopago',
        eventId: String(eventId),
      },
    },
    create: {
      source: 'mercadopago',
      eventId: String(eventId),
      eventType: type,
      processed: false,
      payload: body,
    },
    update: {
      processed: false,
      payload: body,
    },
  });

  try {
    switch (type) {
      case 'payment': {
        const payment = data as { id: string; status: string };
        const status = payment.status;

        if (status === 'approved') {
          const { processApprovedPayment } = await import('./service');
          await processApprovedPayment(payment.id);
        } else if (status === 'pending') {
          const { handlePaymentPending } = await import('./service');
          await handlePaymentPending(payment.id);
        } else if (status === 'rejected') {
          const { handlePaymentRejected } = await import('./service');
          await handlePaymentRejected(payment.id);
        }
        break;
      }
      case 'merchant_order': {
        break;
      }
    }

    await prisma.webhookEvent.update({
      where: {
        source_eventId: {
          source: 'mercadopago',
          eventId: String(eventId),
        },
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
}

function verifyMercadoPagoSignature(
  rawPayload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const [timestampPart, hashPart] = signature.split(',');
  if (!timestampPart || !hashPart) {
    return false;
  }

  const timestamp = timestampPart.replace('t=', '');
  const hash = hashPart.replace('v1=', '');

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawPayload}`)
    .digest('hex');

  return hash === expectedSignature;
}
