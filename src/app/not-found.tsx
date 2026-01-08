import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center py-8 px-4">
            <div className="card text-center max-w-md">
                <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🔍</span>
                </div>
                <h1 className="text-2xl font-mono font-semibold text-ink mb-2">
                    Page Not Found
                </h1>
                <p className="text-ink/60 mb-6">
                    The page you&apos;re looking for doesn&apos;t exist or may have been removed.
                </p>
                <Link href="/create" className="btn-primary inline-block">
                    Create Your Own Page
                </Link>
            </div>
        </main>
    );
}
