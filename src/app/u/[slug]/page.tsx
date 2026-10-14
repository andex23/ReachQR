import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import ViewTracker from '@/components/ViewTracker';
import { getProfileBySlug } from '@/lib/public-profile';
import { rowToCard } from '@/lib/profile';
import { getTheme } from '@/lib/themes';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const profile = await getProfileBySlug(params.slug);
    if (!profile) return { title: 'Page not found' };

    const description = profile.tagline || `Contact ${profile.business_name} on WhatsApp, phone, email and more.`;
    return {
        title: profile.business_name,
        description,
        openGraph: {
            title: profile.business_name,
            description,
            images: profile.logo_url ? [{ url: profile.logo_url }] : undefined,
        },
        twitter: { card: 'summary', title: profile.business_name, description },
    };
}

export default async function PublicProfilePage({ params }: PageProps) {
    const profile = await getProfileBySlug(params.slug);
    if (!profile) notFound();

    const card = rowToCard(profile);
    const theme = getTheme(card.theme);

    return (
        <main className="flex min-h-screen flex-col items-center px-4 py-10 sm:py-16" style={{ background: theme.bg, color: theme.text }}>
            <ViewTracker slug={profile.slug} />
            <div className="w-full max-w-[420px] animate-fade-up">
                <ProfileCard card={card} />
            </div>
            <Link
                href="/"
                className="mt-10 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold opacity-60 transition-opacity hover:opacity-100"
                style={{ color: theme.text }}
            >
                Made with <span className="font-display font-extrabold">ReachQR</span> · Get your free page
            </Link>
        </main>
    );
}
