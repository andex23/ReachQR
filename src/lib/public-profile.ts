import 'server-only';
import { cache } from 'react';
import { getServiceClient } from './supabase';
import { isValidSlug, PROFILE_COLUMNS, ProfileRow } from './profile';

/** Cached per request, so metadata and the page share one query. */
export const getProfileBySlug = cache(async (slug: string): Promise<ProfileRow | null> => {
    const normalized = slug.toLowerCase();
    if (!isValidSlug(normalized)) return null;

    const { data, error } = await getServiceClient()
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('slug', normalized)
        .maybeSingle();

    if (error) {
        console.error('Load public profile:', error);
        return null;
    }
    return (data as unknown as ProfileRow) || null;
});
