import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabase, Profile } from '@/lib/supabase';
import { generateWhatsAppLink, generateMapsLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getProfile(slug: string): Promise<Profile | null> {
    const supabase = getSupabase();
    // Ensure slug is lowercase for lookup
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug.toLowerCase())
        .single();

    if (error || !data) return null;
    return data;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const profile = await getProfile(slug);

    if (!profile) return { title: 'Not Found' };

    return {
        title: `${profile.business_name} | ReachQR`,
        description: profile.tagline || `Contact ${profile.business_name}`,
    };
}

// Icon components
const WhatsAppIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const PhoneIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

const EmailIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);

const InstagramIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
);

const TwitterIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TikTokIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const WebsiteIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
);

export default async function PublicProfilePage({ params }: PageProps) {
    const { slug } = await params;
    const profile = await getProfile(slug);

    if (!profile) notFound();

    const whatsappLink = generateWhatsAppLink(profile.whatsapp_e164);
    const mapsLink = profile.address ? generateMapsLink(profile.address) : null;

    // Social links array
    const socials = [
        { url: profile.instagram_url, icon: InstagramIcon, label: 'Instagram' },
        { url: profile.tiktok_url, icon: TikTokIcon, label: 'TikTok' },
        { url: profile.twitter_url, icon: TwitterIcon, label: 'X' },
        { url: profile.linkedin_url, icon: LinkedInIcon, label: 'LinkedIn' },
        { url: profile.website_url, icon: WebsiteIcon, label: 'Website' },
    ].filter(s => s.url);

    return (
        <main className="min-h-screen py-12 px-4 md:py-20">
            <div className="max-w-sm mx-auto">
                {/* Profile Card */}
                <div className="text-center">
                    {/* Avatar or Logo */}
                    {profile.logo_url ? (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto mb-6 md:mb-8 border border-border">
                            <Image
                                src={profile.logo_url}
                                alt={profile.business_name}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-ink/5 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                            <span className="text-2xl md:text-3xl font-mono font-semibold text-ink">
                                {profile.business_name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    {/* Business Name */}
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-mono font-semibold text-ink mb-2">
                        {profile.business_name}
                    </h1>

                    {/* Tagline */}
                    {profile.tagline && (
                        <p className="text-ink/50 text-sm md:text-base truncate max-w-full mb-8 md:mb-10">
                            {profile.tagline}
                        </p>
                    )}
                    {!profile.tagline && <div className="mb-6 md:mb-8" />}

                    {/* CONTACT BUTTONS */}
                    <div className="space-y-3">
                        {/* WhatsApp - PRIMARY */}
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl bg-ink text-milk font-medium transition-all hover:bg-ink/90 active:scale-[0.98]"
                        >
                            <WhatsAppIcon />
                            WhatsApp
                        </a>

                        {/* Call - SECONDARY */}
                        {profile.phone && (
                            <a
                                href={`tel:${profile.phone}`}
                                className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-xl border border-border text-ink font-medium transition-all hover:bg-ink/5 active:scale-[0.98]"
                            >
                                <PhoneIcon />
                                Call
                            </a>
                        )}

                        {/* Email - SECONDARY */}
                        {profile.email && (
                            <a
                                href={`mailto:${profile.email}`}
                                className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-xl border border-border text-ink font-medium transition-all hover:bg-ink/5 active:scale-[0.98]"
                            >
                                <EmailIcon />
                                Email
                            </a>
                        )}

                        {/* Directions - SECONDARY */}
                        {mapsLink && (
                            <a
                                href={mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-xl border border-border text-ink font-medium transition-all hover:bg-ink/5 active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                Directions
                            </a>
                        )}
                    </div>

                    {/* SOCIAL LINKS */}
                    {socials.length > 0 && (
                        <>
                            <div className="my-6 border-t border-border" />
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                {socials.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border border-border text-ink/60 hover:text-ink hover:border-ink/30 transition-all active:scale-95"
                                        aria-label={social.label}
                                    >
                                        <social.icon />
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer CTA */}
                <div className="mt-12 md:mt-16 text-center">
                    <Link
                        href="/create"
                        className="text-ink/40 hover:text-ink/60 text-sm hover:underline transition-all"
                    >
                        Create your own QR page
                    </Link>
                </div>
            </div>
        </main>
    );
}
