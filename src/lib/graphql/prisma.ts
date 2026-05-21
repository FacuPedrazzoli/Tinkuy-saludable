import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export function createContext(userId?: string, sessionId?: string) {
  return {
    prisma,
    userId,
    sessionId,
  };
}

export type GraphQLContext = ReturnType<typeof createContext>;
