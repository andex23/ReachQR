import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getClientIp, handleRouteError, rateLimit, tooManyRequests } from '@/lib/server-utils';
import { isValidSlug } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const slug = (request.nextUrl.searchParams.get('slug') || '').trim().toLowerCase();
        if (!isValidSlug(slug)) return NextResponse.json({ available: false, valid: false });

        if (!(await rateLimit(`slug:${getClientIp(request)}`, 60, 60))) return tooManyRequests();

        const { data, error } = await getServiceClient()
            .from('profiles')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();

        if (error) throw error;
        return NextResponse.json({ available: !data, valid: true });
    } catch (error) {
        return handleRouteError(error, 'Check slug');
    }
}
