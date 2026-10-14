'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/Brand';
import { KeyIcon } from '@/components/icons';

/**
 * Landing page for the recovery email. Redeeming needs a button press
 * (a POST) so email link scanners that pre-open links can't use it up.
 */
export default function RecoverTokenPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const redeem = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/recover/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.replace(`/edit/${data.editToken}`);
        } catch (err) {
            setError(err instanceof Error && err.message ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <>
            <SiteHeader cta={false} />
            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
                <div className="card w-full max-w-md animate-fade-up text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-accent">
                        <KeyIcon className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-bold">Welcome back</h1>
                    <p className="mt-3 text-muted">
                        Continue to get a new edit link for your page. Your old edit link will stop working.
                    </p>
                    {error ? (
                        <>
                            <p role="alert" className="mt-6 rounded-xl border-2 border-[#D23A3A] bg-[#FDECEC] px-4 py-3 text-sm font-medium text-[#8A1C1C]">
                                {error}
                            </p>
                            <Link href="/recover" className="btn-primary mt-4 w-full">
                                Request a new link
                            </Link>
                        </>
                    ) : (
                        <button type="button" onClick={redeem} disabled={loading} className="btn-accent mt-6 w-full">
                            {loading ? 'Opening your page…' : 'Continue to my page'}
                        </button>
                    )}
                </div>
            </main>
        </>
    );
}
