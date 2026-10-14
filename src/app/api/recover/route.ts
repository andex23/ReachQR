import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getBaseUrl, getClientIp, handleRouteError, jsonError, rateLimit, readJson, tooManyRequests } from '@/lib/server-utils';
import { sendRecoveryLinks } from '@/lib/recovery';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { email: rawEmail } = await readJson(request);
        const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
        if (!email) return jsonError('Please enter your email', 400);

        const ip = getClientIp(request);
        if (!(await rateLimit(`recover-ip:${ip}`, 5, 60 * 15))) return tooManyRequests();
        if (!(await rateLimit(`recover-email:${email}`, 3, 60 * 15))) return tooManyRequests();

        const { data: profiles, error } = await getServiceClient()
            .from('profiles')
            .select('id, slug, business_name')
            .eq('email', email);

        if (error) throw error;

        await sendRecoveryLinks(email, profiles || [], getBaseUrl(request));

        // Same answer either way, so emails can't be enumerated.
        return NextResponse.json({ success: true });
    } catch (error) {
        return handleRouteError(error, 'Recover');
    }
}
