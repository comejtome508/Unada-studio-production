import { encryptPii, decryptPii } from '@/lib/pii';
// NODE_ENV=test 시 zero-key fallback 사용 (pii.ts 참고)

describe('PII encryption', () => {
  const original = {
    livingWith: 'solo',
    creditScore: '750',
    immigrationStatus: 'citizen',
    employmentStatus: 'fulltime',
    budget: 500000,
    nonPiiField: 'unchanged',
  };

  it('encrypts PII fields and leaves non-PII untouched', () => {
    const encrypted = encryptPii(original);

    // PII 필드는 변환됨
    expect(encrypted.creditScore).not.toBe(original.creditScore);
    expect(encrypted.immigrationStatus).not.toBe(original.immigrationStatus);
    expect(encrypted.employmentStatus).not.toBe(original.employmentStatus);

    // 암호화된 값은 iv:tag:encrypted 형식
    expect(typeof encrypted.creditScore).toBe('string');
    expect((encrypted.creditScore as string).split(':').length).toBe(3);

    // 비-PII 필드는 그대로
    expect(encrypted.nonPiiField).toBe('unchanged');
    expect(encrypted.budget).toBe(500000);
    expect(encrypted.livingWith).toBe('solo');
  });

  it('round-trips PII fields correctly', () => {
    const encrypted = encryptPii(original);
    const decrypted = decryptPii(encrypted as Record<string, unknown>);

    expect(decrypted.creditScore).toBe(original.creditScore);
    expect(decrypted.immigrationStatus).toBe(original.immigrationStatus);
    expect(decrypted.employmentStatus).toBe(original.employmentStatus);
    expect(decrypted.nonPiiField).toBe('unchanged');
  });

  it('handles missing PII fields gracefully', () => {
    const sparse = { budget: 400000 };
    const encrypted = encryptPii(sparse);
    expect(encrypted.budget).toBe(400000);
    expect(encrypted.creditScore).toBeUndefined();
  });

  it('handles null PII fields gracefully', () => {
    const withNull = { creditScore: null };
    const encrypted = encryptPii(withNull as Record<string, unknown>);
    expect(encrypted.creditScore).toBeNull();
  });
});
