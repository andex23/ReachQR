'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HowItWorks() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-t border-border py-16 px-4 bg-ink/[0.02]">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full md:cursor-default md:pointer-events-none flex items-center justify-center gap-2 group mb-8 md:mb-12"
                    aria-expanded={isOpen}
                >
                    <h2 className="text-xl md:text-2xl font-mono font-medium text-ink">
                        How it works
                    </h2>
                    <svg
                        className={`w-5 h-5 text-ink/40 md:hidden transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <div className={`grid md:grid-cols-3 gap-8 text-center md:text-left transition-all duration-300 ${isOpen ? 'block' : 'hidden md:grid'}`}>
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="w-10 h-10 bg-ink text-milk rounded-full flex items-center justify-center font-mono text-lg flex-shrink-0">
                            1
                        </div>
                        <div>
                            <h3 className="font-medium text-ink mb-2">Fill in your details</h3>
                            <p className="text-sm text-ink/60">Name, WhatsApp, email, and any social links you want to share.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="w-10 h-10 bg-ink text-milk rounded-full flex items-center justify-center font-mono text-lg flex-shrink-0">
                            2
                        </div>
                        <div>
                            <h3 className="font-medium text-ink mb-2">Get your QR code</h3>
                            <p className="text-sm text-ink/60">Download it instantly. Print it, share it, stick it anywhere.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="w-10 h-10 bg-ink text-milk rounded-full flex items-center justify-center font-mono text-lg flex-shrink-0">
                            3
                        </div>
                        <div>
                            <h3 className="font-medium text-ink mb-2">Customers contact you</h3>
                            <p className="text-sm text-ink/60">One tap on WhatsApp, email, or call. No app downloads needed.</p>
                        </div>
                    </div>

                    <div className="md:col-span-3 mt-12 text-center">
                        <Link href="/create" className="btn-primary inline-block px-10 py-4 text-lg">
                            Create Your Page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
