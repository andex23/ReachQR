import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import {
    generateToken,
    getBaseUrl,
    getClientIp,
    handleRouteError,
    hashToken,
    jsonError,
    rateLimit,
    readJson,
    tooManyRequests,
} from '@/lib/server-utils';
import { isValidSlug, normalizeProfileInput } from '@/lib/profile';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        if (!(await rateLimit(`create:${getClientIp(request)}`, 5, 60 * 10))) return tooManyRequests();

        const body = await readJson(request);

        // Bots fill the hidden field; pretend it worked.
        if (body.website_confirm) {
            return NextResponse.json({ success: true, slug: 'ok', editToken: generateToken() });
        }

        const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
        if (!isValidSlug(slug)) {
            return jsonError('Your link must be 2–50 letters, numbers or dashes', 400, { field: 'slug' });
        }

        const parsed = normalizeProfileInput(body);
        if (!parsed.ok) return jsonError(parsed.error, 400, { field: parsed.field });

        const editToken = generateToken();
        const { data, error } = await getServiceClient()
            .from('profiles')
            .insert({ ...parsed.value, slug, edit_token_hash: hashToken(editToken) })
            .select('slug')
            .single();

        if (error) {
            if (error.code === '23505') return jsonError('That link is already taken', 409, { field: 'slug' });
            throw error;
        }

        const baseUrl = getBaseUrl(request);
        await sendWelcomeEmail({
            to: parsed.value.email,
            businessName: parsed.value.business_name,
            editLink: `${baseUrl}/edit/${editToken}`,
            publicLink: `${baseUrl}/u/${data.slug}`,
        });

        return NextResponse.json({ success: true, slug: data.slug, editToken });
    } catch (error) {
        return handleRouteError(error, 'Create profile');
    }
}
