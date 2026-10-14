import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export class DatabaseNotConfiguredError extends Error {
    constructor() {
        super('Supabase environment variables are not configured');
    }
}

/**
 * Server-only Supabase client using the service role key.
 * Row Level Security has no public policies, so every read and write
 * goes through here and selects explicit columns.
 */
export function getServiceClient(): SupabaseClient {
    if (client) return client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) throw new DatabaseNotConfiguredError();

    client = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return client;
}
