/**
 * High-performance In-Memory Sliding-Window Rate Limiter & Anti-Brute-Force Guard
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  firstSeen: number;
}

// In-memory store (keyed by action:identifier)
const limitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 3 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of limitStore.entries()) {
      if (now > record.resetAt) {
        limitStore.delete(key);
      }
    }
  }, 3 * 60 * 1000).unref?.();
}

/**
 * Safely extracts client IP address, sanitizing against header spoofing
 */
export function getClientIp(request: Request): string {
  try {
    const headers = request.headers;
    const cfConnectingIp = headers.get('cf-connecting-ip');
    if (cfConnectingIp) {
      return cfConnectingIp.trim().replace(/[^a-fA-F0-9.:]/g, '').slice(0, 45);
    }

    const xRealIp = headers.get('x-real-ip');
    if (xRealIp) {
      return xRealIp.trim().replace(/[^a-fA-F0-9.:]/g, '').slice(0, 45);
    }

    const xForwardedFor = headers.get('x-forwarded-for');
    if (xForwardedFor) {
      // First IP in list is the original client IP
      const firstIp = xForwardedFor.split(',')[0].trim();
      return firstIp.replace(/[^a-fA-F0-9.:]/g, '').slice(0, 45);
    }
  } catch {}

  return '127.0.0.1';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetSeconds: number;
}

/**
 * Generic sliding window rate limiter
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = limitStore.get(key);

  if (!record || now > record.resetAt) {
    // New or expired window
    limitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
      firstSeen: now,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      limit,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  // Active window
  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  if (record.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      resetSeconds,
    };
  }

  return {
    allowed: true,
    remaining,
    limit,
    resetSeconds,
  };
}

/**
 * Specialized login rate limiter (Anti-Brute Force)
 * Allows max 5 failed attempts per 15 minutes before temporary lockout
 */
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(identifier: string): RateLimitResult {
  const key = `login_attempts:${identifier}`;
  const now = Date.now();
  const record = limitStore.get(key);

  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      remaining: LOGIN_MAX_ATTEMPTS,
      limit: LOGIN_MAX_ATTEMPTS,
      resetSeconds: Math.ceil(LOGIN_LOCKOUT_MS / 1000),
    };
  }

  const remaining = Math.max(0, LOGIN_MAX_ATTEMPTS - record.count);
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    allowed: record.count < LOGIN_MAX_ATTEMPTS,
    remaining,
    limit: LOGIN_MAX_ATTEMPTS,
    resetSeconds,
  };
}

export function recordFailedLogin(identifier: string): RateLimitResult {
  const key = `login_attempts:${identifier}`;
  const now = Date.now();
  const record = limitStore.get(key);

  if (!record || now > record.resetAt) {
    limitStore.set(key, {
      count: 1,
      resetAt: now + LOGIN_LOCKOUT_MS,
      firstSeen: now,
    });
    return {
      allowed: true,
      remaining: LOGIN_MAX_ATTEMPTS - 1,
      limit: LOGIN_MAX_ATTEMPTS,
      resetSeconds: Math.ceil(LOGIN_LOCKOUT_MS / 1000),
    };
  }

  record.count += 1;
  const remaining = Math.max(0, LOGIN_MAX_ATTEMPTS - record.count);
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    allowed: record.count < LOGIN_MAX_ATTEMPTS,
    remaining,
    limit: LOGIN_MAX_ATTEMPTS,
    resetSeconds,
  };
}

export function clearLoginRateLimit(identifier: string): void {
  limitStore.delete(`login_attempts:${identifier}`);
}
