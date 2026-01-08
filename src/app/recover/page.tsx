'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecoverPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
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

            if (!res.ok) {
                throw new Error(data.error);
            }

            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        }

        setLoading(false);
    };

    if (sent) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-mono font-semibold text-ink mb-4">
                        Check Your Email
                    </h1>
                    <p className="text-ink/60 mb-8">
                        If a page exists with that email, we&apos;ve sent you a link to edit it.
                    </p>
                    <Link href="/" className="text-ink/60 hover:text-ink text-sm">
                        ← Back to home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-mono font-semibold text-ink mb-2">
                        Recover Your Page
                    </h1>
                    <p className="text-ink/60">
                        Enter the email you used when creating your page
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-6">
                    <div>
                        <label htmlFor="email" className="label">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@yourbusiness.com"
                            className="input-field"
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Recovery Link'}
                    </button>
                </form>

                <p className="text-center mt-6 text-ink/40 text-sm">
                    Don&apos;t have a page?{' '}
                    <Link href="/create" className="text-ink hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}
