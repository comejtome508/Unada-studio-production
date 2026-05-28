import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { encryptPii } from '@/lib/pii';

const BodySchema = z.object({
  status: z.union([
    z.literal('partial_1'),
    z.literal('partial_2'),
    z.literal('complete'),
  ]),
  answers: z.record(z.string(), z.unknown()),
});

export async function PATCH(req: NextRequest) {
  // 1. 토큰 검증
  const auth = await verifyToken(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // 2. Body 파싱 + 유효성 검증
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation_error', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { status, answers } = parsed.data;

  // 3. PII 암호화 후 DB 업데이트
  const encryptedAnswers = encryptPii(answers) as Prisma.InputJsonValue;

  const session = await prisma.onboardingSession.update({
    where: { id: auth.sessionId },
    data: {
      status,
      answers: encryptedAnswers,
      updatedAt: new Date(),
    },
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json({
    ok: true,
    sessionId: session.id,
    status: session.status,
    updatedAt: session.updatedAt,
  });
}
