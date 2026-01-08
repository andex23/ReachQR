'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
    slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;

        // Track view asynchronously
        fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug })
        }).catch(() => {
            // Silently fail - view tracking is non-critical
        });
    }, [slug]);

    return null; // This component renders nothing
}
