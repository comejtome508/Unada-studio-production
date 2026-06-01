import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAgentKey } from '@/lib/agent-auth';
import { decryptPii } from '@/lib/pii';

/**
 * GET /api/v1/sessions/:token
 * 에이전트가 특정 세션의 답변을 조회합니다.
 * PII 필드는 자동 복호화됩니다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const auth = await verifyAgentKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { token } = await params;

  const session = await prisma.onboardingSession.findUnique({
    where: { onboardingToken: token },
    select: {
      id: true,
      onboardingToken: true,
      agentId: true,
      clientEmail: true,
      status: true,
      answers: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  }

  // 본인 에이전트의 세션만 조회 가능
  if (session.agentId !== auth.agentId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // PII 복호화
  const answers = decryptPii(session.answers as Record<string, unknown>);

  return NextResponse.json({
    sessionId: session.id,
    onboardingToken: session.onboardingToken,
    clientEmail: session.clientEmail,
    status: session.status,
    answers,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  });
}
