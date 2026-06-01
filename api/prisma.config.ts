import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as fs from 'node:fs';
import { config as dotenvConfig } from 'dotenv';

// Prisma CLI는 .env.local을 자동으로 읽지 않으므로 직접 로드
// (Next.js dev 서버는 자동 로드하므로 런타임에는 중복 없음)
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  dotenvConfig({ path: path.join(__dirname, '.env.local'), override: false });
}

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    // Neon connection string: postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
    url: process.env.DATABASE_URL,
  },
});
