import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // DB 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: 'unada-api',
      db: 'connected',
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, service: 'unada-api', db: 'disconnected', error: String(err) },
      { status: 503 }
    );
  }
}
