import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, handleRouteError, jsonError, rateLimit, readJson, tooManyRequests } from '@/lib/server-utils';
import { redeemRecoveryToken } from '@/lib/recovery';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        if (!(await rateLimit(`recover-confirm:${getClientIp(request)}`, 10, 60 * 15))) return tooManyRequests();

        const { token } = await readJson(request);
        const editToken = typeof token === 'string' ? await redeemRecoveryToken(token) : null;
        if (!editToken) return jsonError('This recovery link has expired or was already used', 410);

        return NextResponse.json({ editToken });
    } catch (error) {
        return handleRouteError(error, 'Confirm recovery');
    }
}
