import { createHmac } from "crypto";

export function generateBarcodePayload(orderId: string) {
  const secret = process.env.NEXTAUTH_SECRET || "morsall-internal-secret";
  const payload = `MOR-${orderId.slice(-8).toUpperCase()}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 8);
  return `${payload}-${hmac}`;
}

export function verifyBarcodePayload(payloadWithHmac: string) {
  const secret = process.env.NEXTAUTH_SECRET || "morsall-internal-secret";
  const parts = payloadWithHmac.split('-');
  if (parts.length < 3) return false;
  
  const hmacInPayload = parts.pop();
  const basePayload = parts.join('-');
  
  const expectedHmac = createHmac("sha256", secret).update(basePayload).digest("hex").slice(0, 8);
  return hmacInPayload === expectedHmac;
}
