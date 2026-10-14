import { NextRequest, NextResponse } from 'next/server';
import {
    checkAdminPassword,
    clearAdminSession,
    isAdminConfigured,
    isAdminRequest,
    setAdminSession,
} from '@/lib/admin-auth';
import { getClientIp, jsonError, rateLimit, readJson, tooManyRequests } from '@/lib/server-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return NextResponse.json({ authenticated: isAdminRequest(request) });
}

export async function POST(request: NextRequest) {
    if (!isAdminConfigured()) return jsonError('ADMIN_PASSWORD is not set', 503);
    if (!(await rateLimit(`admin-login:${getClientIp(request)}`, 5, 60 * 15))) return tooManyRequests();

    const { password } = await readJson(request);
    if (!checkAdminPassword(password)) return jsonError('Invalid password', 401);

    return setAdminSession(NextResponse.json({ authenticated: true }));
}

export async function DELETE() {
    return clearAdminSession(NextResponse.json({ authenticated: false }));
}
