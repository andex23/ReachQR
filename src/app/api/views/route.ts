import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getClientIp, handleRouteError, rateLimit, readJson } from '@/lib/server-utils';
import { isValidSlug } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { slug } = await readJson(request);
        if (typeof slug !== 'string' || !isValidSlug(slug.toLowerCase())) {
            return NextResponse.json({ error: 'Slug required' }, { status: 400 });
        }

        // One view per visitor per page every 30 minutes
        const allowed = await rateLimit(`view:${slug.toLowerCase()}:${getClientIp(request)}`, 1, 60 * 30);
        if (!allowed) return NextResponse.json({ success: true });

        const supabase = getServiceClient();
        const { error } = await supabase.rpc('increment_profile_views', { p_slug: slug });

        if (error) {
            // Migration not applied yet: fall back to read-then-write
            const { data } = await supabase.from('profiles').select('views').eq('slug', slug.toLowerCase()).maybeSingle();
            if (data) {
                await supabase
                    .from('profiles')
                    .update({ views: (data.views || 0) + 1 })
                    .eq('slug', slug.toLowerCase());
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleRouteError(error, 'Track view');
    }
}
