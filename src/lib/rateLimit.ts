import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const isProduction = process.env.NODE_ENV === 'production';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  CHECKOUT: { windowMs: 60 * 1000, maxRequests: 10 },
  GENERAL: { windowMs: 60 * 1000, maxRequests: 100 },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

const memoryStore: Map<string, { count: number; resetTime: number }> = new Map();

async function slidingWindowRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  if (redis) {
    try {
      await redis.zremrangebyscore(key, 0, windowStart);
      
      const count = await redis.zcard(key);
      
      if (count >= config.maxRequests) {
        const oldest = await redis.zrange(key, 0, 0, { withScores: true });
        const resetIn = oldest.length >= 2
          ? Math.max(0, (oldest[1] as number) + config.windowMs - now)
          : config.windowMs;
        
        return {
          allowed: false,
          remaining: 0,
          resetIn,
        };
      }

      await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      await redis.expire(key, Math.ceil(config.windowMs / 1000));

      return {
        allowed: true,
        remaining: config.maxRequests - count - 1,
        resetIn: config.windowMs,
      };
    } catch (err) {
      console.error('Redis error, falling back to memory store:', err);
      
      if (isProduction) {
        return {
          allowed: false,
          remaining: 0,
          resetIn: config.windowMs,
        };
      }
    }
  }

  return memoryRateLimit(key, config);
}

function memoryRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetTime - now,
  };
}

export async function checkLoginRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  return slidingWindowRateLimit(`ratelimit:login:${ip}`, RATE_LIMITS.LOGIN);
}

export async function checkRegisterRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  return slidingWindowRateLimit(`ratelimit:register:${ip}`, RATE_LIMITS.REGISTER);
}

export async function checkCheckoutRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  return slidingWindowRateLimit(`ratelimit:checkout:${userId}`, RATE_LIMITS.CHECKOUT);
}

export async function checkApiRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  return slidingWindowRateLimit(`ratelimit:api:${ip}`, RATE_LIMITS.GENERAL);
}

export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn: number;
}> {
  return slidingWindowRateLimit(`ratelimit:${type}:${identifier}`, RATE_LIMITS[type]);
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

export function getRateLimitHeaders(
  result: { allowed: boolean; remaining: number; resetIn: number }
): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
    'X-RateLimit-Limit': RATE_LIMITS.GENERAL.maxRequests.toString(),
    ...(result.allowed
      ? {}
      : {
          'Retry-After': Math.ceil(result.resetIn / 1000).toString(),
        }),
  };
}

export async function resetRateLimit(type: RateLimitType, identifier: string): Promise<void> {
  const key = `ratelimit:${type}:${identifier}`;

  if (redis) {
    try {
      await redis.del(key);
    } catch (err) {
      console.error('Failed to reset rate limit in Redis:', err);
    }
  }

  memoryStore.delete(key);
}
