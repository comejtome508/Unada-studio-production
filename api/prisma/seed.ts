/**
 * prisma/seed.ts — 로컬 개발용 시드 데이터
 * 실행: npm run db:seed
 *
 * 생성 내용:
 * - 에이전트 Jane (테스트용)
 * - 샘플 온보딩 세션 1개 (pending 상태)
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { config as dotenvConfig } from 'dotenv';

// .env.local 로드 (Prisma CLI / ts-node는 Next.js와 달리 자동 로드 안 함)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenvConfig({ path: envLocalPath, override: false });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 에이전트 생성 (기존 Jane 삭제 후 지정된 UUID로 재생성 — 시드는 멱등성 보장)
  const agentId = process.env.AGENT_ID ?? randomUUID();
  await prisma.onboardingSession.deleteMany({ where: { agentId } });
  await prisma.agent.deleteMany({ where: { id: agentId } });
  const agent = await prisma.agent.create({
    data: {
      id: agentId,
      name: 'Jane Kim',
      email: 'unadarealestate@gmail.com',
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
