'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';

export async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    }
}

export default function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={async () => {
                await copyText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            }}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-ink bg-white px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-paper ${className}`}
        >
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? 'Copied' : label}
        </button>
    );
}
