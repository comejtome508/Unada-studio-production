import { NextRequest } from 'next/server';

// Prisma mock
jest.mock('@/lib/prisma', () => ({
  prisma: {
    onboardingSession: {
      findUnique: jest.fn(),
    },
  },
}));

import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mockFindUnique = prisma.onboardingSession.findUnique as jest.Mock;

function makeRequest(authHeader?: string) {
  return new NextRequest('http://localhost/api/v1/onboarding/answers', {
    method: 'PATCH',
    headers: authHeader ? { Authorization: authHeader } : {},
  });
}

describe('verifyToken', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when Authorization header is missing', async () => {
    const result = await verifyToken(makeRequest());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(401);
      expect(result.error).toBe('missing_token');
    }
  });

  it('returns 401 when token not found in DB', async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await verifyToken(makeRequest('Bearer unknown-token'));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(401);
  });

  it('returns 410 when token is expired', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'session-1',
      agentId: 'agent-1',
      expiresAt: new Date('2020-01-01'), // 과거
    });
    const result = await verifyToken(makeRequest('Bearer expired-token'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(410);
      expect(result.error).toBe('token_expired');
    }
  });

  it('returns ok with sessionId and agentId for valid token', async () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    mockFindUnique.mockResolvedValue({
      id: 'session-abc',
      agentId: 'agent-xyz',
      expiresAt: future,
    });
    const result = await verifyToken(makeRequest('Bearer valid-token'));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sessionId).toBe('session-abc');
      expect(result.agentId).toBe('agent-xyz');
    }
  });
});
