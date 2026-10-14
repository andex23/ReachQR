import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getClientIp, handleRouteError, hashToken, jsonError, rateLimit, readJson, tooManyRequests } from '@/lib/server-utils';
import { normalizeProfileInput, PROFILE_COLUMNS, ProfileRow, rowToFormValues } from '@/lib/profile';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: { token: string };
}

const INVALID_LINK = 'This edit link is invalid or has expired';

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        if (!(await rateLimit(`edit-get:${getClientIp(request)}`, 60, 60))) return tooManyRequests();

        const { data } = await getServiceClient()
            .from('profiles')
            .select(PROFILE_COLUMNS)
            .eq('edit_token_hash', hashToken(params.token))
            .maybeSingle();

        if (!data) return jsonError(INVALID_LINK, 404);

        const row = data as unknown as ProfileRow;
        return NextResponse.json({
            values: rowToFormValues(row),
            views: row.views || 0,
            createdAt: row.created_at,
        });
    } catch (error) {
        return handleRouteError(error, 'Load profile');
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        if (!(await rateLimit(`edit-put:${getClientIp(request)}`, 30, 60))) return tooManyRequests();

        const parsed = normalizeProfileInput(await readJson(request));
        if (!parsed.ok) return jsonError(parsed.error, 400, { field: parsed.field });

        const { data, error } = await getServiceClient()
            .from('profiles')
            .update(parsed.value)
            .eq('edit_token_hash', hashToken(params.token))
            .select('slug');

        if (error) throw error;
        if (!data || data.length === 0) return jsonError(INVALID_LINK, 404);

        return NextResponse.json({ success: true, slug: data[0].slug });
    } catch (error) {
        return handleRouteError(error, 'Update profile');
    }
}
