'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/Brand';
import { EmailIcon, KeyIcon } from '@/components/icons';

export default function RecoverPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSent(true);
        } catch (err) {
            setError(err instanceof Error && err.message ? err.message : 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <>
            <SiteHeader />
            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
                <div className="w-full max-w-md animate-fade-up">
                    {sent ? (
                        <div className="card text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-accent">
                                <EmailIcon className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-bold">Check your inbox</h1>
                            <p className="mt-3 text-muted">
                                If a page uses <span className="font-semibold text-ink">{email}</span>, we’ve sent a link to get back in. It works for one hour.
                            </p>
                            <p className="mt-4 text-sm text-muted">Nothing there? Check spam, or try the email you used when you created the page.</p>
                            <button type="button" onClick={() => setSent(false)} className="btn-ghost mt-6 text-sm">
                                Use a different email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="card space-y-6">
                            <div>
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-accent">
                                    <KeyIcon className="h-6 w-6" />
                                </div>
                                <h1 className="text-3xl font-bold">Edit your page</h1>
                                <p className="mt-2 text-muted">Enter the email you used to create your page and we’ll send you a fresh edit link.</p>
                            </div>
                            <div>
                                <label htmlFor="email" className="label">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="hello@yourbusiness.com"
                                    className="input"
                                    autoComplete="email"
                                    required
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p role="alert" className="rounded-xl border-2 border-[#D23A3A] bg-[#FDECEC] px-4 py-3 text-sm font-medium text-[#8A1C1C]">
                                    {error}
                                </p>
                            )}
                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? 'Sending…' : 'Email me a link'}
                            </button>
                            <p className="text-center text-sm text-muted">
                                No page yet?{' '}
                                <Link href="/create" className="font-semibold text-ink underline">
                                    Create one free
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </main>
        </>
    );
}
