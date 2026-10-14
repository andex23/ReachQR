import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdminRequest, unauthorized } from '@/lib/admin-auth';
import { getBaseUrl, handleRouteError, jsonError } from '@/lib/server-utils';
import { sendRecoveryLinks } from '@/lib/recovery';

export const dynamic = 'force-dynamic';

/** Support action: email the owner a fresh recovery link for this page. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    if (!isAdminRequest(request)) return unauthorized();
    try {
        const { data: profile, error } = await getServiceClient()
            .from('profiles')
            .select('id, slug, business_name, email')
            .eq('id', params.id)
            .maybeSingle();

        if (error) throw error;
        if (!profile) return jsonError('Profile not found', 404);

        await sendRecoveryLinks(profile.email, [profile], getBaseUrl(request));
        return NextResponse.json({ success: true });
    } catch (error) {
        return handleRouteError(error, 'Admin recovery');
    }
}
