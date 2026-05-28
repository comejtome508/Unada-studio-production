import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export type AuthResult =
  | { ok: true; sessionId: string; agentId: string }
  | { ok: false; status: 401 | 410; error: string };

/**
 * Bearer 토큰을 검증하고 세션을 반환합니다.
 * 401 — 토큰 없음 or 세션 미존재
 * 410 — 토큰 만료 (expiresAt 초과)
 */
export async function verifyToken(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'missing_token' };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return { ok: false, status: 401, error: 'invalid_token' };
  }

  const session = await prisma.onboardingSession.findUnique({
    where: { onboardingToken: token },
    select: { id: true, agentId: true, expiresAt: true },
  });

  if (!session) {
    return { ok: false, status: 401, error: 'invalid_token' };
  }

  if (session.expiresAt < new Date()) {
    return { ok: false, status: 410, error: 'token_expired' };
  }

  return { ok: true, sessionId: session.id, agentId: session.agentId };
}
