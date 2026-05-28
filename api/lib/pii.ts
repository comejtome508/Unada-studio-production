import crypto from 'crypto';

// PII 필드 목록 — DB 저장 전 암호화 대상
const PII_KEYS = [
  'creditScore',
  'immigrationStatus',
  'employmentStatus',
  'visaExpiry',
  'annualIncome',
];

const ALGORITHM = 'aes-256-gcm';
const KEY_HEX = process.env.PII_ENCRYPTION_KEY ?? '';

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PII_ENCRYPTION_KEY must be a 64-char hex string in production');
    }
    // dev fallback — 절대 prod에서 사용 금지
    return Buffer.from('0'.repeat(64), 'hex');
  }
  return Buffer.from(KEY_HEX, 'hex');
}

function encrypt(value: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // iv:tag:encrypted — base64
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

function decrypt(encoded: string): string {
  const key = getKey();
  const [ivHex, tagHex, encHex] = encoded.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encBuf = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encBuf), decipher.final()]).toString('utf8');
}

/** answers JSONB 저장 전 PII 필드를 암호화 */
export function encryptPii(answers: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...answers };
  for (const key of PII_KEYS) {
    if (out[key] !== undefined && out[key] !== null) {
      out[key] = encrypt(String(out[key]));
    }
  }
  return out;
}

/** DB에서 꺼낸 answers의 PII 필드를 복호화 */
export function decryptPii(answers: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...answers };
  for (const key of PII_KEYS) {
    if (typeof out[key] === 'string' && (out[key] as string).includes(':')) {
      try {
        out[key] = decrypt(out[key] as string);
      } catch {
        // 복호화 실패 시 마스킹 (로그에 원본 노출 방지)
        out[key] = '[encrypted]';
      }
    }
  }
  return out;
}
