import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter (단일 인스턴스용 MVP)
// Production에서는 Redis-backed upstash/ratelimit 사용 권장
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;       // 분당 요청 수
const RATE_LIMIT_WINDOW = 60_000; // 1분 (ms)

function getRateLimitKey(req: NextRequest): string {
  // IP + path prefix 조합
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  return ip;
}

function checkRateLimit(key: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
  if (entry.count > RATE_LIMIT_MAX) {
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining };
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '';
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3456')
    .split(',')
    .map((o) => o.trim());

  // CORS preflight
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    if (allowedOrigins.includes(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin);
    }
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Agent-Key');
    res.headers.set('Access-Control-Max-Age', '86400');
    return res;
  }

  // Rate limiting (API 경로만)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const key = getRateLimitKey(req);
    const { ok, remaining } = checkRateLimit(key);
    if (!ok) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const res = NextResponse.next();

    // CORS 응답 헤더 추가
    if (allowedOrigins.includes(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin);
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    res.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
    res.headers.set('X-RateLimit-Remaining', String(remaining));

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
