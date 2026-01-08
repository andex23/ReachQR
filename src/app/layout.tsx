import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Reach - Create Your QR Contact Page',
    description: 'Create a beautiful QR code that opens your contact page. Perfect for small businesses and freelancers.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-milk">
                {children}
            </body>
        </html>
    );
}
