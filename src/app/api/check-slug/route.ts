import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
        return NextResponse.json(
            { error: 'Slug is required' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

    if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
            { error: 'Failed to check slug' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        available: !data,
    });
}
