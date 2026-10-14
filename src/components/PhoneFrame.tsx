import type { CSSProperties, ReactNode } from 'react';
import { getTheme } from '@/lib/themes';

/** A simple phone mock that shows a profile in its theme's page colour. */
export default function PhoneFrame({
    themeId,
    children,
    className = '',
}: {
    themeId: string;
    children: ReactNode;
    className?: string;
}) {
    const theme = getTheme(themeId);
    return (
        <div
            className={`relative mx-auto w-full max-w-[340px] rounded-[44px] border-2 border-ink bg-ink p-2.5 shadow-hard-lg ${className}`}
        >
            <div
                className="relative h-[640px] overflow-hidden rounded-[34px] transition-colors duration-300"
                style={{ background: theme.bg } as CSSProperties}
            >
                <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
                <div className="h-full overflow-y-auto px-4 pb-6 pt-12 [scrollbar-width:none]">{children}</div>
            </div>
        </div>
    );
}
