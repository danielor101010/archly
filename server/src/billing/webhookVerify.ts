import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verify a Lemon Squeezy webhook's `X-Signature` header: an HMAC-SHA256 hex
 * digest of the raw request body, keyed by the webhook signing secret from
 * the LS dashboard. Pulled out as a pure function (raw body/signature/secret
 * in, boolean out) so it's testable without spinning up Express.
 */
export function verifyLemonSqueezySignature(rawBody: Buffer | string, signatureHeader: string | undefined, secret: string): boolean {
  if (!signatureHeader || !secret) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected, 'utf8')
  const actualBuf = Buffer.from(signatureHeader, 'utf8')
  if (expectedBuf.length !== actualBuf.length) return false
  return timingSafeEqual(expectedBuf, actualBuf)
}
