import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { generateEditToken, hashToken } from '@/lib/server-utils';
import { sendRecoveryEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email?.trim()) {
            return NextResponse.json({ error: 'Please enter your email' }, { status: 400 });
        }

        let supabase;
        try {
            supabase = getServiceClient();
        } catch {
            return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
        }

        // Find profiles with this email
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, slug, business_name')
            .eq('email', email.toLowerCase().trim());

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
        }

        // If profiles found, generate new edit tokens and send email
        if (profiles && profiles.length > 0) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const pages = [];

            for (const profile of profiles) {
                // Generate new edit token for each profile
                const newToken = generateEditToken();
                const newTokenHash = hashToken(newToken);

                // Update the profile with the new token
                await supabase
                    .from('profiles')
                    .update({ edit_token_hash: newTokenHash })
                    .eq('id', profile.id);

                pages.push({
                    businessName: profile.business_name,
                    editLink: `${baseUrl}/edit/${newToken}`,
                    publicLink: `${baseUrl}/u/${profile.slug}`,
                });
            }

            // Send recovery email
            sendRecoveryEmail({
                to: email.toLowerCase().trim(),
                pages,
            }).catch(err => console.error('Failed to send recovery email:', err));
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({
            success: true,
            message: 'If a page exists with this email, you will receive a recovery link.',
        });
    } catch (error) {
        console.error('Recovery API error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
