import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      UPSTASH_REDIS_REST_URL?: string;
      UPSTASH_REDIS_REST_TOKEN?: string;
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
    }
  }
}

export interface Context {
  prisma: PrismaClient;
  userId?: string;
  sessionId?: string;
}

export interface AuthContext extends Context {
  userId: string;
}
