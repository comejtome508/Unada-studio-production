import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    // Neon connection string: postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
    url: process.env.DATABASE_URL,
  },
});
