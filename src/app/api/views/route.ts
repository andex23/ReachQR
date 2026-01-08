import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { slug } = await request.json();

        if (!slug) {
            return NextResponse.json({ error: 'Slug required' }, { status: 400 });
        }

        const supabase = getServiceClient();

        // Get current views and increment
        const { data: profile } = await supabase
            .from('profiles')
            .select('views')
            .eq('slug', slug.toLowerCase())
            .single();

        const currentViews = profile?.views || 0;

        await supabase
            .from('profiles')
            .update({ views: currentViews + 1 })
            .eq('slug', slug.toLowerCase());

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Views API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
