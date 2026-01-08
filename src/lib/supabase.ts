import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase environment variables are not configured');
        }
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
}

export const supabase = {
    from: (table: string) => getSupabase().from(table),
};

export function getServiceClient(): SupabaseClient {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase environment variables are not configured');
    }
    return createClient(supabaseUrl, serviceRoleKey);
}

export interface Profile {
    id: string;
    slug: string;
    business_name: string;
    tagline: string | null;
    email: string;
    whatsapp_e164: string;
    phone: string | null;
    logo_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    tiktok_url: string | null;
    facebook_url: string | null;
    linkedin_url: string | null;
    youtube_url: string | null;
    website_url: string | null;
    address: string | null;
    edit_token_hash: string;
    created_at: string;
    updated_at: string;
}
