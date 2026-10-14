import 'server-only';
import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, DatabaseNotConfiguredError } from './supabase';

/** A random 256-bit token (64 hex chars). Only its hash is stored. */
export function generateToken(): string {
    return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return request.headers.get('x-real-ip') || request.ip || 'unknown';
}

export function getBaseUrl(request?: NextRequest): string {
    const configured = process.env.NEXT_PUBLIC_BASE_URL;
    if (configured) return configured.replace(/\/$/, '');
    if (request) return request.nextUrl.origin;
    return 'http://localhost:3000';
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    if (memory.size > 5000) {
        memory.forEach((r, k) => {
            if (now > r.resetAt) memory.delete(k);
        });
    }
    const record = memory.get(key);
    if (!record || now > record.resetAt) {
        memory.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    record.count++;
    return record.count <= max;
}

/**
 * Returns true if the request is allowed. Uses the `hit_rate_limit`
 * Postgres function so limits hold across serverless instances, and
 * falls back to an in-memory counter if the migration hasn't been run.
 */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
    try {
        const { data, error } = await getServiceClient().rpc('hit_rate_limit', {
            p_key: key,
            p_max: max,
            p_window_seconds: windowSeconds,
        });
        if (!error && typeof data === 'boolean') return data;
    } catch {
        // fall through
    }
    return memoryRateLimit(key, max, windowSeconds * 1000);
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
    return NextResponse.json({ error: message, ...extra }, { status });
}

export const tooManyRequests = () =>
    jsonError('Too many attempts. Please wait a few minutes and try again.', 429);

export function handleRouteError(error: unknown, context: string) {
    if (error instanceof DatabaseNotConfiguredError) {
        return jsonError('Service temporarily unavailable', 503);
    }
    console.error(`${context}:`, error);
    return jsonError('Something went wrong. Please try again.', 500);
}

export async function readJson(request: NextRequest): Promise<Record<string, unknown>> {
    try {
        const body = await request.json();
        return body && typeof body === 'object' ? body : {};
    } catch {
        return {};
    }
}
