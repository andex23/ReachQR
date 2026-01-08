import { createHash, randomBytes } from 'crypto';

/**
 * Generate a secure random edit token (32+ chars)
 * Server-side only!
 */
export function generateEditToken(): string {
    return randomBytes(32).toString('hex'); // 64 hex chars
}

/**
 * Hash a token using SHA-256
 * Server-side only!
 */
export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

/**
 * Simple rate limiting map (in-memory, resets on server restart)
 * In production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}
