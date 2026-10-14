import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdminRequest, unauthorized } from '@/lib/admin-auth';
import { handleRouteError, jsonError, readJson } from '@/lib/server-utils';

export const dynamic = 'force-dynamic';

const ADMIN_COLUMNS = 'id, slug, business_name, email, whatsapp_e164, logo_url, theme, views, created_at';

export async function GET(request: NextRequest) {
    if (!isAdminRequest(request)) return unauthorized();
    try {
        const { data, error } = await getServiceClient()
            .from('profiles')
            .select(ADMIN_COLUMNS)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ profiles: data });
    } catch (error) {
        return handleRouteError(error, 'Admin list');
    }
}

export async function DELETE(request: NextRequest) {
    if (!isAdminRequest(request)) return unauthorized();
    try {
        const { id } = await readJson(request);
        if (typeof id !== 'string' || !id) return jsonError('Profile ID required', 400);

        const { error } = await getServiceClient().from('profiles').delete().eq('id', id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleRouteError(error, 'Admin delete');
    }
}
