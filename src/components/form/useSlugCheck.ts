'use client';

import { useEffect, useState } from 'react';
import { isValidSlug } from '@/lib/profile';

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function useSlugCheck(slug: string): SlugStatus {
    const [status, setStatus] = useState<SlugStatus>('idle');

    useEffect(() => {
        if (!slug) {
            setStatus('idle');
            return;
        }
        if (!isValidSlug(slug)) {
            setStatus('invalid');
            return;
        }

        setStatus('checking');
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`, { signal: controller.signal });
                const data = await res.json();
                setStatus(data.available ? 'available' : 'taken');
            } catch (err) {
                if ((err as Error).name !== 'AbortError') setStatus('idle');
            }
        }, 400);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [slug]);

    return status;
}
