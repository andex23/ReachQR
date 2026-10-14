import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'rq_admin';
const SESSION_SECONDS = 60 * 60 * 12;

function getPassword(): string | null {
    return process.env.ADMIN_PASSWORD || null;
}

/** Changing ADMIN_PASSWORD invalidates every existing session. */
function signingKey(password: string): Buffer {
    const secret = process.env.ADMIN_SESSION_SECRET || '';
    return createHash('sha256').update(`reachqr-admin:${secret}:${password}`).digest();
}

function safeEqual(a: string, b: string): boolean {
    const ha = createHash('sha256').update(a).digest();
    const hb = createHash('sha256').update(b).digest();
    return timingSafeEqual(ha, hb);
}

export function isAdminConfigured(): boolean {
    return !!getPassword();
}

export function checkAdminPassword(input: unknown): boolean {
    const password = getPassword();
    if (!password || typeof input !== 'string') return false;
    return safeEqual(input, password);
}

function sign(expires: number, password: string): string {
    return createHmac('sha256', signingKey(password)).update(String(expires)).digest('hex');
}

export function setAdminSession(response: NextResponse): NextResponse {
    const password = getPassword()!;
    const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    response.cookies.set(ADMIN_COOKIE, `${expires}.${sign(expires, password)}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_SECONDS,
    });
    return response;
}

export function clearAdminSession(response: NextResponse): NextResponse {
    response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return response;
}

export function isAdminRequest(request: NextRequest): boolean {
    const password = getPassword();
    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!password || !cookie) return false;

    const [expiresRaw, signature] = cookie.split('.');
    const expires = Number(expiresRaw);
    if (!signature || !Number.isFinite(expires) || expires < Date.now() / 1000) return false;

    return safeEqual(signature, sign(expires, password));
}

export function unauthorized() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
