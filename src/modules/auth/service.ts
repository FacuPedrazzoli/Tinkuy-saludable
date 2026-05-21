import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const RESET_TOKEN_EXPIRY_HOURS = 1;

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
  jti?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateAccessToken(userId: string, jti: string): string {
  return sign(
    { userId, type: 'access', jti } as TokenPayload,
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function generateRefreshToken(userId: string, jti: string): string {
  return sign(
    { userId, type: 'refresh', jti } as TokenPayload,
    REFRESH_TOKEN_SECRET,
    { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` }
  );
}

export function generateJti(): string {
  return randomBytes(16).toString('hex');
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const payload = verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    if (payload.type !== 'refresh') return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createUser(email: string, password: string, firstName?: string, lastName?: string) {
  const passwordHash = await hashPassword(password);
  
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

export async function createAuthTokens(userId: string, ipAddress?: string, userAgent?: string) {
  const jti = generateJti();
  const accessToken = generateAccessToken(userId, jti);
  const refreshToken = generateRefreshToken(userId, jti);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 900,
    user,
  };
}

export async function refreshAccessToken(
  input: { refreshToken: string }
): Promise<AuthPayload> {
  const payload = verifyRefreshToken(input.refreshToken);
  
  if (!payload) {
    throw new Error('Invalid or expired refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: input.refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error('Refresh token not found');
  }

  if (storedToken.revokedAt) {
    await revokeAllSessionsForUser(storedToken.userId, storedToken.id);
    throw new Error('Token has been revoked. All sessions have been terminated for security.');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error('Refresh token has expired');
  }

  if (storedToken.usedAt) {
    console.warn(`[SECURITY] Token reuse detected for user ${storedToken.userId}. Possible token theft.`);
    await revokeAllSessionsForUser(storedToken.userId, storedToken.id);
    throw new Error('Token reuse detected. All sessions have been terminated for security.');
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { usedAt: new Date() },
  });

  const newJti = generateJti();
  const newAccessToken = generateAccessToken(storedToken.userId, newJti);
  const newRefreshToken = generateRefreshToken(storedToken.userId, newJti);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.userId,
      expiresAt,
      ipAddress: storedToken.ipAddress,
      userAgent: storedToken.userAgent,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 900,
    user: {
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    },
  };
}

export async function revokeAllSessionsForUser(userId: string, revokedByTokenId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { 
      revokedAt: new Date(),
      revokedBy: revokedByTokenId,
    },
  });
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken) {
    return false;
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  return true;
}

export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return result.count;
}

export async function getUserFromToken(accessToken: string) {
  const payload = verifyAccessToken(accessToken);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });
}

export async function createPasswordResetToken(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return;
  }

  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`Password reset token for ${email}: ${token}`);
  }
}

export async function verifyPasswordResetToken(token: string): Promise<boolean> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return false;
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return false;
  }

  return true;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error('Token inválido o expirado');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
}

export async function getUser() {
  return null
}
