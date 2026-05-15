import { Prisma, PrismaClient } from '@prisma/client';

export interface Context {
  userId?: string;
  sessionId?: string;
  prisma: PrismaClient;
}

export interface AuthContext extends Context {
  userId: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}
