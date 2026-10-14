import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: 'ReachQR — One scan. Instant contact.',
        template: '%s · ReachQR',
    },
    description:
        'Create a free contact page and QR code for your business in 60 seconds. WhatsApp, call, email, socials and directions — one scan away.',
    openGraph: {
        title: 'ReachQR — One scan. Instant contact.',
        description: 'A free contact page and QR code for your business in 60 seconds.',
        siteName: 'ReachQR',
        type: 'website',
    },
};

export const viewport: Viewport = {
    themeColor: '#F6F4EF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
            <body className="min-h-screen">{children}</body>
        </html>
    );
}
