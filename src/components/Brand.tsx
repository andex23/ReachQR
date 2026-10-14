import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
    return (
        <Link href="/" className={`inline-flex items-center font-display text-xl font-extrabold tracking-tight ${className}`}>
            Reach
            <span className="ml-0.5 rounded-md border-2 border-ink bg-accent px-1.5 leading-tight">QR</span>
        </Link>
    );
}

export function SiteHeader({ cta = true }: { cta?: boolean }) {
    return (
        <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Logo />
                <nav className="flex items-center gap-1 sm:gap-2">
                    <Link href="/recover" className="btn-ghost px-3 py-2 text-sm">
                        Edit my page
                    </Link>
                    {cta && (
                        <Link href="/create" className="btn-primary px-4 py-2 text-sm">
                            Create free
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export function SiteFooter() {
    return (
        <footer className="border-t-2 border-ink">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
                <Logo className="text-lg" />
                <nav className="flex gap-5 text-muted">
                    <Link href="/create" className="hover:text-ink">Create</Link>
                    <Link href="/recover" className="hover:text-ink">Recover link</Link>
                </nav>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                    © {new Date().getFullYear()} AVD Studios
                </p>
            </div>
        </footer>
    );
}
