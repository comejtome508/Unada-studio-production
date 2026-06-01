import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/v1/start
 * 공개 엔드포인트 — 인증 없이 누구나 온보딩 세션을 시작할 수 있습니다.
 * unadarealestate.com "Start your search" 버튼에서 호출합니다.
 *
 * Jane Kim 에이전트에 자동 배정됩니다 (AGENT_ID 환경변수).
 * Response: { onboardingUrl, token }
 */
export async function POST() {
  const agentId = process.env.AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 503 });
  }

  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.onboardingSession.create({
    data: {
      onboardingToken: token,
      agentId,
      status: 'pending',
      answers: {},
      expiresAt,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3456';
  const onboardingUrl = `${frontendUrl}?token=${token}`;

  return NextResponse.json({ onboardingUrl, token }, { status: 201 });
}
