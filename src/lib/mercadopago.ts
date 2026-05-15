import crypto from 'crypto';

export function verifyMercadoPagoSignature(
  rawPayload: string,
  signature: string,
  secret: string
): boolean {
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
