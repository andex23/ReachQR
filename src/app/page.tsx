import Link from 'next/link';
import HowItWorks from '../components/HowItWorks';

export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Hero */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Logo */}
                    <h1 className="text-3xl md:text-5xl font-mono font-semibold text-ink mb-6">
                        Reach<span className="text-ink/40">QR</span>
                    </h1>

                    {/* Headline */}
                    <p className="text-3xl md:text-5xl font-mono text-ink mb-6 leading-tight">
                        One scan. Instant contact.
                    </p>

                    {/* Subhead */}
                    <p className="text-ink/60 mb-10 max-w-xl mx-auto text-lg md:text-xl">
                        Create a QR code that opens your contact page. Perfect for business cards, storefronts, and packaging.
                    </p>

                    {/* CTA */}
                    <Link href="/create" className="btn-primary inline-block px-10 py-4 text-lg">
                        Get Started Free
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="border-t border-border py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-center text-xl md:text-2xl font-mono font-medium text-ink mb-16">
                        Everything you need. Nothing you don&apos;t.
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {/* WhatsApp Ready */}
                        <div>
                            <div className="w-16 h-16 bg-ink/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-ink" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-ink mb-3 text-lg">WhatsApp Ready</h3>
                            <p className="text-ink/60 leading-relaxed">
                                One tap opens a WhatsApp chat with your business. No phone numbers to save.
                            </p>
                        </div>

                        {/* Print & Share */}
                        <div>
                            <div className="w-16 h-16 bg-ink/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-ink mb-3 text-lg">Print Anywhere</h3>
                            <p className="text-ink/60 leading-relaxed">
                                Download your QR code and print it on cards, stickers, menus, or packaging.
                            </p>
                        </div>

                        {/* Instant Setup */}
                        <div>
                            <div className="w-16 h-16 bg-ink/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-ink mb-3 text-lg">60-Second Setup</h3>
                            <p className="text-ink/60 leading-relaxed">
                                No accounts, no monthly fees. Just fill in your details and you&apos;re live.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <HowItWorks />

            {/* Footer */}
            <footer className="border-t border-border py-8 px-4 text-center">
                <p className="text-sm text-ink/40">
                    &copy; {new Date().getFullYear()} ReachQR
                </p>
            </footer>
        </main>
    );
}
