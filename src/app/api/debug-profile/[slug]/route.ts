import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const slug = params.slug;
    const supabase = getSupabase();

    // Test 1: Env Vars Check (Safe subset)
    const envCheck = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
    };

    // Test 2: Actual Query
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug.toLowerCase())
        .single();

    return NextResponse.json({
        envCheck,
        slugQuery: slug.toLowerCase(),
        data,
        error
    });
}
