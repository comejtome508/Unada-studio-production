import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // Neon serverless adapter — Vercel 환경에서 connection pooling 자동 처리
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

// Lazy singleton — Next.js 빌드 시 모듈 import 만으로는 초기화하지 않음
// DATABASE_URL 체크는 첫 실제 DB 호출 시점에 발생
const globalForPrisma = globalThis as unknown as { _prisma: PrismaClient | undefined };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma._prisma) {
    globalForPrisma._prisma = createPrismaClient();
  }
  return globalForPrisma._prisma;
}

// 기존 코드 호환용 — 런타임에 처음 사용할 때 초기화
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
