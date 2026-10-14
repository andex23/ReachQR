import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isAdminRequest, unauthorized } from '@/lib/admin-auth';
import { getBaseUrl, handleRouteError } from '@/lib/server-utils';
import { sendAnnouncementToAll } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    if (!isAdminRequest(request)) return unauthorized();
    try {
        const { data: profiles, error } = await getServiceClient()
            .from('profiles')
            .select('email, business_name, slug')
            .not('email', 'is', null);

        if (error) throw error;

        const recipients = (profiles || []).map((p) => ({
            email: p.email as string,
            businessName: p.business_name as string,
            slug: p.slug as string,
        }));

        const result = await sendAnnouncementToAll(recipients, getBaseUrl(request));
        return NextResponse.json({ success: true, total: recipients.length, ...result });
    } catch (error) {
        return handleRouteError(error, 'Notify all');
    }
}
