'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

function SuccessContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const token = searchParams.get('token');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copied, setCopied] = useState<'public' | 'edit' | null>(null);
    const [visible, setVisible] = useState(false);

    const publicUrl = slug ? `${window.location.origin}/u/${slug}` : '';
    const editUrl = token ? `${window.location.origin}/edit/${token}` : '';

    // Generate QR code
    useEffect(() => {
        if (canvasRef.current && publicUrl) {
            QRCode.toCanvas(canvasRef.current, publicUrl, {
                width: 280,
                margin: 2,
                color: {
                    dark: '#1A1A1A',
                    light: '#FAF9F6',
                },
            });
        }
    }, [publicUrl]);

    // Fade-in animation
    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleDownload = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = `${slug}-qr-code.png`;
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };

    const handleCopy = async (text: string, type: 'public' | 'edit') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        }
    };

    if (!slug || !token) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-ink/60 mb-4">Missing page information</p>
                    <Link href="/create" className="btn-primary inline-block">
                        Create a Page
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-12 px-4 md:py-20">
            <div className={`max-w-md mx-auto transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                {/* 1. "You're live" confirmation with checkmark */}
                <div className="text-center mb-10">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-mono font-semibold text-ink">
                        You&apos;re live!
                    </h1>
                </div>

                {/* 2. QR Code (largest element) */}
                <div className="bg-milk border border-border rounded-2xl p-8 mb-6">
                    <div className="flex justify-center">
                        <canvas ref={canvasRef} className="rounded-xl" />
                    </div>
                </div>

                {/* 3. Download QR button */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <button
                        onClick={handleDownload}
                        className="flex-1 py-3 px-6 rounded-xl bg-ink text-milk font-medium transition-all hover:bg-ink/90 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download
                    </button>
                    <button
                        onClick={async () => {
                            if (!canvasRef.current) return;
                            try {
                                const blob = await new Promise<Blob | null>(resolve =>
                                    canvasRef.current!.toBlob(resolve, 'image/png')
                                );
                                if (!blob) return;

                                const file = new File([blob], 'reach-qr-code.png', { type: 'image/png' });

                                // Check if sharing files is supported
                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                    await navigator.share({
                                        files: [file],
                                        title: 'My ReachQR',
                                        text: `Scan to connect with ${slug}!`
                                    });
                                } else {
                                    // Fallback to link sharing
                                    await navigator.share({
                                        title: 'My ReachQR',
                                        text: `Check out my contact page: ${publicUrl}`,
                                        url: publicUrl
                                    });
                                }
                            } catch (err) {
                                console.error('Share failed', err);
                            }
                        }}
                        className="flex-1 py-3 px-6 rounded-xl border border-border text-ink font-medium transition-all hover:bg-ink/5 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.345 1.093m0-3.186a4.125 4.125 0 117.964-5.416m-9.215 0c-.967.628-1.542 1.745-1.542 3V9.75M7.5 12h.008v.008H7.5V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm9.75 5.25h.008v.008H17.625v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Share
                    </button>
                </div>

                {/* 4. Public link with copy button */}
                <div className="border border-border rounded-xl p-4 mb-4">
                    <p className="text-xs text-ink/50 uppercase tracking-wide mb-2">Your public link</p>
                    <div className="flex items-center gap-2">
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 font-mono text-sm text-ink hover:underline truncate"
                        >
                            {publicUrl.replace('http://', '').replace('https://', '')}
                        </a>
                        <button
                            onClick={() => handleCopy(publicUrl, 'public')}
                            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-ink/5 transition-colors"
                        >
                            {copied === 'public' ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* 5. Edit link (calm styling, not danger) */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-amber-800 font-medium mb-1">
                                Your private edit link
                            </p>
                            <p className="text-xs text-amber-700/70 mb-3">
                                Keep this somewhere safe — it&apos;s the only way to edit your page.
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs text-amber-800 bg-amber-100/50 px-2 py-1 rounded truncate">
                                    {editUrl.replace('http://', '').replace('https://', '')}
                                </code>
                                <button
                                    onClick={() => handleCopy(editUrl, 'edit')}
                                    className="px-3 py-1.5 text-xs bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors flex-shrink-0"
                                >
                                    {copied === 'edit' ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View page link */}
                <div className="mt-8 text-center">
                    <Link
                        href={`/u/${slug}`}
                        className="text-ink/60 hover:text-ink text-sm hover:underline transition-colors"
                    >
                        View your page →
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-ink/60">Loading...</div>
            </main>
        }>
            <SuccessContent />
        </Suspense>
    );
}
