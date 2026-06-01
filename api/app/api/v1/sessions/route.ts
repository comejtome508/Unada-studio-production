import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { verifyAgentKey } from '@/lib/agent-auth';

const TOKEN_EXPIRY_DAYS = 7;

const CreateSessionSchema = z.object({
  clientEmail: z.string().email().optional(),
});

/**
 * POST /api/v1/sessions
 * 에이전트가 클라이언트용 온보딩 링크를 생성합니다.
 * 응답의 onboardingUrl을 클라이언트에게 전송하면 됩니다.
 *
 * Request Header: X-Agent-Key: <api_key>
 * Response: { sessionId, onboardingToken, onboardingUrl, expiresAt }
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAgentKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = CreateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  const session = await prisma.onboardingSession.create({
    data: {
      onboardingToken: token,
      agentId: auth.agentId,
      clientEmail: parsed.data.clientEmail ?? null,
      status: 'pending',
      answers: {},
      expiresAt,
    },
    select: { id: true, onboardingToken: true, expiresAt: true, clientEmail: true },
  });

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3456';
  const onboardingUrl = `${frontendUrl}?token=${session.onboardingToken}`;

  return NextResponse.json(
    {
      sessionId: session.id,
      onboardingToken: session.onboardingToken,
      onboardingUrl,
      clientEmail: session.clientEmail,
      expiresAt: session.expiresAt,
    },
    { status: 201 }
  );
}
