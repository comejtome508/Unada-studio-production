/**
 * prisma/seed.ts — 로컬 개발용 시드 데이터
 * 실행: npm run db:seed
 *
 * 생성 내용:
 * - 에이전트 Jane (테스트용)
 * - 샘플 온보딩 세션 1개 (pending 상태)
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomUUID } from 'crypto';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 에이전트 생성 (이미 존재하면 업서트)
  const agent = await prisma.agent.upsert({
    where: { email: 'jane@unada.ca' },
    update: {},
    create: {
      id: process.env.AGENT_ID ?? randomUUID(),
      name: 'Jane Smith',
      email: 'jane@unada.ca',
      phone: '+1-416-555-0100',
    },
  });
  console.log(`✅ Agent: ${agent.name} (${agent.id})`);

  // 샘플 세션 생성
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const session = await prisma.onboardingSession.create({
    data: {
      onboardingToken: token,
      agentId: agent.id,
      clientEmail: 'client@example.com',
      status: 'pending',
      answers: {},
      expiresAt,
    },
  });
  console.log(`✅ Session created:`);
  console.log(`   Token: ${session.onboardingToken}`);
  console.log(`   URL:   ${process.env.FRONTEND_URL ?? 'http://localhost:3456'}?token=${token}`);
  console.log(`   Expires: ${session.expiresAt.toISOString()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
