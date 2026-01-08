import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { hashToken } from '@/lib/server-utils';

interface RouteParams {
    params: Promise<{ token: string }>;
}

// GET - Fetch profile by edit token
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { token } = await params;
        const tokenHash = hashToken(token);

        let supabase;
        try {
            supabase = getServiceClient();
        } catch {
            return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('edit_token_hash', tokenHash)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'This edit link is invalid or has expired' },
                { status: 404 }
            );
        }

        // Don't expose the hash
        const { edit_token_hash, ...profile } = data;
        return NextResponse.json({ profile });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// PUT - Update profile by edit token
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { token } = await params;
        const tokenHash = hashToken(token);
        const body = await request.json();

        const {
            business_name,
            tagline,
            whatsapp_e164,
            phone,
            email,
            logo_url,
            instagram,
            twitter,
            tiktok,
            facebook,
            linkedin,
            website,
            address,
        } = body;

        // Validate required fields
        if (!business_name?.trim()) {
            return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
        }
        if (!whatsapp_e164?.trim()) {
            return NextResponse.json({ error: 'WhatsApp number is required' }, { status: 400 });
        }

        let supabase;
        try {
            supabase = getServiceClient();
        } catch {
            return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
        }

        // Verify token exists
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('edit_token_hash', tokenHash)
            .single();

        if (!existing) {
            return NextResponse.json({ error: 'This edit link is invalid or has expired' }, { status: 404 });
        }

        // Format social URLs
        const formatSocialUrl = (platform: string, handle: string | null) => {
            if (!handle) return null;
            const cleanHandle = handle.replace(/^@/, '');
            switch (platform) {
                case 'instagram': return `https://instagram.com/${cleanHandle}`;
                case 'twitter': return `https://x.com/${cleanHandle}`;
                case 'tiktok': return `https://tiktok.com/@${cleanHandle}`;
                case 'facebook': return `https://facebook.com/${cleanHandle}`;
                case 'linkedin': return `https://linkedin.com/in/${cleanHandle}`;
                default: return null;
            }
        };

        let formattedWebsite = null;
        if (website) {
            let url = website.trim();
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            formattedWebsite = url;
        }

        // Update the profile
        const { data, error } = await supabase
            .from('profiles')
            .update({
                business_name: business_name.trim(),
                tagline: tagline?.trim() || null,
                whatsapp_e164: whatsapp_e164.trim(),
                phone: phone?.trim() || null,
                email: email?.trim()?.toLowerCase() || null,
                logo_url: logo_url?.trim() || null,
                instagram_url: formatSocialUrl('instagram', instagram),
                twitter_url: formatSocialUrl('twitter', twitter),
                tiktok_url: formatSocialUrl('tiktok', tiktok),
                facebook_url: formatSocialUrl('facebook', facebook),
                linkedin_url: formatSocialUrl('linkedin', linkedin),
                website_url: formattedWebsite,
                address: address?.trim() || null,
                updated_at: new Date().toISOString(),
            })
            .eq('edit_token_hash', tokenHash)
            .select('slug')
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: "Couldn't save changes. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ success: true, slug: data.slug });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
