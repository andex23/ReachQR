import Link from 'next/link';
import { SiteHeader } from '@/components/Brand';

export default function NotFound() {
    return (
        <>
            <SiteHeader />
            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
                <div className="card w-full max-w-md text-center">
                    <p className="font-display text-7xl font-extrabold">404</p>
                    <h1 className="mt-4 text-2xl font-bold">This page doesn’t exist</h1>
                    <p className="mt-2 text-muted">The link may be mistyped, or the page was removed.</p>
                    <div className="mt-6 flex flex-col gap-3">
                        <Link href="/create" className="btn-accent w-full">
                            Create your own page
                        </Link>
                        <Link href="/" className="btn-ghost w-full text-sm">
                            Go home
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
