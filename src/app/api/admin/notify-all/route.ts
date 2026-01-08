import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { sendProfileNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Authenticate
        const authHeader = request.headers.get('x-admin-password');
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword || authHeader !== adminPassword) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getServiceClient();

        // Get all profiles with email
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, business_name, slug')
            .not('email', 'is', null);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://reachqr.vercel.app';

        let sent = 0;
        let failed = 0;
        const errors: string[] = [];

        // Send emails with rate limiting (1 per 100ms to stay within limits)
        for (const profile of profiles || []) {
            if (!profile.email) continue;

            try {
                const result = await sendProfileNotification({
                    to: profile.email,
                    businessName: profile.business_name,
                    slug: profile.slug,
                    baseUrl
                });

                if (result.success) {
                    sent++;
                } else {
                    failed++;
                    errors.push(`${profile.email}: ${JSON.stringify(result.error)}`);
                }

                // Rate limit: wait 100ms between emails
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
                failed++;
                errors.push(`${profile.email}: ${err}`);
            }
        }

        return NextResponse.json({
            success: true,
            sent,
            failed,
            total: profiles?.length || 0,
            errors: errors.slice(0, 5) // Only return first 5 errors
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
