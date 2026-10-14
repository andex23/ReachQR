'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SiteHeader } from '@/components/Brand';
import CopyButton from '@/components/CopyButton';
import QRPanel from '@/components/QRPanel';
import { ArrowRightIcon, KeyIcon } from '@/components/icons';
import { useOrigin } from '@/components/form/fields';

function SuccessContent() {
    const params = useSearchParams();
    const origin = useOrigin();
    const slug = params.get('slug') || '';
    const [token, setToken] = useState<string | null>(null);
    const [name, setName] = useState('');

    useEffect(() => {
        const fromHash = new URLSearchParams(window.location.hash.slice(1)).get('t');
        setToken(fromHash || params.get('token'));
        try {
            setName(sessionStorage.getItem('rq_last_name') || '');
        } catch {
            // ignore
        }
    }, [params]);

    if (!slug) {
        return (
            <main className="mx-auto max-w-md px-4 py-24 text-center">
                <p className="mb-6 text-muted">We couldn’t find your page details.</p>
                <Link href="/create" className="btn-primary">
                    Create a page
                </Link>
            </main>
        );
    }

    const publicUrl = origin ? `${origin}/u/${slug}` : '';
    const editUrl = origin && token ? `${origin}/edit/${token}` : '';

    return (
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-20">
            <div className="animate-fade-up text-center">
                <span className="chip bg-accent">● Live now</span>
                <h1 className="mt-5 text-4xl font-bold sm:text-6xl">You’re live.</h1>
                <p className="mx-auto mt-4 max-w-md text-lg text-muted">
                    Print your QR code, stick it anywhere, and let customers reach you in one scan.
                </p>
            </div>

            <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
                <div className="card min-w-0 animate-fade-up">{publicUrl && <QRPanel url={publicUrl} slug={slug} businessName={name || slug} />}</div>

                <div className="min-w-0 space-y-5 animate-fade-up">
                    <div className="card">
                        <p className="eyebrow mb-2">Your public link</p>
                        <div className="flex items-center gap-3">
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate font-mono text-sm font-semibold hover:underline">
                                {publicUrl.replace(/^https?:\/\//, '')}
                            </a>
                            {publicUrl && <CopyButton text={publicUrl} />}
                        </div>
                        <p className="hint">Put it in your Instagram bio, WhatsApp status and email signature.</p>
                    </div>

                    {editUrl && (
                        <div className="rounded-2xl border-2 border-ink bg-accent p-6 shadow-hard md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white">
                                    <KeyIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-display text-lg font-bold">Save your private edit link</p>
                                    <p className="mt-1 text-sm text-ink/70">
                                        It’s the key to update your page, and we’ve emailed you a copy. Lost it? You can request a new one any time.
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-ink bg-white p-2 pl-3">
                                        <code className="min-w-0 flex-1 truncate text-xs">{editUrl.replace(/^https?:\/\//, '')}</code>
                                        <CopyButton text={editUrl} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Link href={`/u/${slug}`} className="btn-primary">
                            View my page <ArrowRightIcon />
                        </Link>
                        {token && (
                            <Link href={`/edit/${token}`} className="btn-secondary">
                                Edit my page
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function SuccessPage() {
    return (
        <>
            <SiteHeader cta={false} />
            <Suspense fallback={<main className="py-24 text-center text-muted">Loading…</main>}>
                <SuccessContent />
            </Suspense>
        </>
    );
}
