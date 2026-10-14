'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }: { slug: string }) {
    useEffect(() => {
        const key = `rq_viewed_${slug}`;
        try {
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, '1');
        } catch {
            // storage blocked: still count the view
        }

        fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug }),
            keepalive: true,
        }).catch(() => {});
    }, [slug]);

    return null;
}
