import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { generateEditToken, hashToken, checkRateLimit } from '@/lib/server-utils';
import { sendEditLinkEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'You\'re creating pages too fast! Please wait a minute and try again.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Check honeypot field
        if (body.honeypot) {
            return NextResponse.json({
                success: true,
                slug: 'fake-slug',
                editToken: 'fake-token'
            });
        }

        const {
            slug,
            business_name,
            tagline,
            logo_url,
            whatsapp_e164,
            phone,
            email,
            instagram,
            twitter,
            tiktok,
            facebook,
            linkedin,
            youtube,
            website,
            address,
        } = body;

        // Validate required fields
        if (!business_name?.trim()) {
            return NextResponse.json({ error: 'Please enter your business name' }, { status: 400 });
        }
        if (!slug?.trim()) {
            return NextResponse.json({ error: 'Please choose a unique link' }, { status: 400 });
        }
        if (!email?.trim()) {
            return NextResponse.json({ error: 'Please enter your email' }, { status: 400 });
        }
        if (!whatsapp_e164?.trim()) {
            return NextResponse.json({ error: 'Please enter your WhatsApp number' }, { status: 400 });
        }

        // Generate edit token
        const editToken = generateEditToken();
        const editTokenHash = hashToken(editToken);

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
                case 'youtube': return `https://youtube.com/${cleanHandle.startsWith('@') ? cleanHandle : '@' + cleanHandle}`;
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

        let supabase;
        try {
            supabase = getServiceClient();
        } catch {
            return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
        }

        const { data, error } = await supabase
            .from('profiles')
            .insert({
                slug: slug.toLowerCase().trim(),
                business_name: business_name.trim(),
                tagline: tagline?.trim() || null,
                logo_url: logo_url?.trim() || null,
                whatsapp_e164: whatsapp_e164.trim(),
                phone: phone?.trim() || null,
                email: email.toLowerCase().trim(),
                instagram_url: formatSocialUrl('instagram', instagram),
                twitter_url: formatSocialUrl('twitter', twitter),
                tiktok_url: formatSocialUrl('tiktok', tiktok),
                facebook_url: formatSocialUrl('facebook', facebook),
                linkedin_url: formatSocialUrl('linkedin', linkedin),
                youtube_url: formatSocialUrl('youtube', youtube),
                website_url: formattedWebsite,
                address: address?.trim() || null,
                edit_token_hash: editTokenHash,
            })
            .select('id, slug')
            .single();

        if (error) {
            console.error('Supabase error:', error);
            if (error.code === '23505') {
                return NextResponse.json({ error: 'This name is already taken' }, { status: 409 });
            }
            return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
        }

        // Get base URL for email links
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const publicLink = `${baseUrl}/u/${data.slug}`;
        const editLink = `${baseUrl}/edit/${editToken}`;

        // Send email with edit link (non-blocking)
        sendEditLinkEmail({
            to: email.toLowerCase().trim(),
            businessName: business_name.trim(),
            editLink,
            publicLink,
        }).catch(err => console.error('Failed to send email:', err));

        return NextResponse.json({
            success: true,
            slug: data.slug,
            editToken,
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
