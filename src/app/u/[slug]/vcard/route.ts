import { NextRequest, NextResponse } from 'next/server';
import { getProfileBySlug } from '@/lib/public-profile';
import { getBaseUrl } from '@/lib/server-utils';
import { buildVCard } from '@/lib/vcard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    const profile = await getProfileBySlug(params.slug);
    if (!profile) return new NextResponse('Not found', { status: 404 });

    const vcard = buildVCard(profile, `${getBaseUrl(request)}/u/${profile.slug}`);

    return new NextResponse(vcard, {
        headers: {
            'Content-Type': 'text/vcard; charset=utf-8',
            'Content-Disposition': `attachment; filename="${profile.slug}.vcf"`,
            'Cache-Control': 'no-store',
        },
    });
}
