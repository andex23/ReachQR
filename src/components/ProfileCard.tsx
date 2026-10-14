/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from 'react';
import { CardData, telLink } from '@/lib/profile';
import { getTheme, themeVars } from '@/lib/themes';
import {
    ContactCardIcon,
    EmailIcon,
    GlobeIcon,
    PhoneIcon,
    PinIcon,
    SOCIAL_ICONS,
    WhatsAppIcon,
} from './icons';

interface Props {
    card: CardData;
    /** Live preview inside the editor: links are inert. */
    preview?: boolean;
    className?: string;
}

interface Action {
    key: string;
    label: string;
    href: string;
    icon: ReactNode;
    external?: boolean;
    download?: boolean;
}

export default function ProfileCard({ card, preview = false, className = '' }: Props) {
    const theme = getTheme(card.theme);
    const linkProps = (a: Action) => ({
        href: a.href,
        ...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        ...(a.download ? { download: true } : {}),
        ...(preview ? { tabIndex: -1 } : {}),
    });

    const all: Action[] = [];
    if (card.whatsappUrl) all.push({ key: 'whatsapp', label: 'WhatsApp', href: card.whatsappUrl, icon: <WhatsAppIcon className="h-5 w-5" />, external: true });
    if (card.phone) all.push({ key: 'call', label: 'Call', href: telLink(card.phone), icon: <PhoneIcon /> });
    if (card.email) all.push({ key: 'email', label: 'Email', href: `mailto:${card.email}`, icon: <EmailIcon /> });
    if (card.mapsUrl) all.push({ key: 'directions', label: 'Directions', href: card.mapsUrl, icon: <PinIcon />, external: true });
    if (card.website) all.push({ key: 'website', label: 'Website', href: card.website, icon: <GlobeIcon />, external: true });

    const [primary, ...secondary] = all;
    const saveContact: Action = {
        key: 'save',
        label: 'Save contact',
        href: `/u/${card.slug}/vcard`,
        icon: <ContactCardIcon />,
        download: true,
    };

    return (
        <div
            style={themeVars(theme) as CSSProperties}
            className={`text-p-text ${preview ? 'pointer-events-none select-none' : ''} ${className}`}
            aria-hidden={preview || undefined}
        >
            <div className={`rounded-[28px] border-2 border-p-border bg-p-card shadow-[6px_6px_0_0_var(--p-border)] ${preview ? 'p-5' : 'p-6 sm:p-8'}`}>
                {/* Identity */}
                <div className="text-center">
                    {card.logoUrl ? (
                        <img
                            src={card.logoUrl}
                            alt=""
                            className="mx-auto mb-5 h-24 w-24 rounded-full border-2 border-p-border object-cover"
                        />
                    ) : (
                        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-p-border bg-p-accent font-display text-4xl font-bold text-p-accent-text">
                            {card.businessName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h1 className={`break-words font-display font-bold leading-tight ${preview ? 'text-2xl' : 'text-2xl sm:text-3xl'}`}>{card.businessName}</h1>
                    {card.tagline && <p className="mt-2 break-words text-[15px] text-p-muted">{card.tagline}</p>}
                    {card.address && (
                        <p className="mt-3 inline-flex items-center gap-1 text-xs text-p-muted">
                            <PinIcon className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{card.address}</span>
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-7 space-y-3">
                    {primary && (
                        <a
                            {...linkProps(primary)}
                            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-p-border bg-p-accent px-5 py-4 text-base font-semibold text-p-accent-text transition-transform active:scale-[0.98]"
                        >
                            {primary.icon}
                            {primary.key === 'whatsapp' ? 'Chat on WhatsApp' : primary.label}
                        </a>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {[...secondary, saveContact].map((a, i, arr) => (
                            <a
                                key={a.key}
                                {...linkProps(a)}
                                className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-p-border px-3 py-3 text-sm font-semibold transition-opacity hover:opacity-75 active:scale-[0.98] ${
                                    arr.length % 2 === 1 && i === arr.length - 1 ? 'col-span-2' : ''
                                }`}
                            >
                                {a.icon}
                                {a.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Socials */}
                {card.socials.length > 0 && (
                    <div
                        className="mt-7 flex flex-wrap items-center justify-center gap-2.5 border-t-2 border-dashed pt-6"
                        style={{ borderColor: 'color-mix(in srgb, var(--p-border) 25%, transparent)' }}
                    >
                        {card.socials.map((s) => {
                            const Icon = SOCIAL_ICONS[s.key];
                            return (
                                <a
                                    key={s.key}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    title={s.label}
                                    tabIndex={preview ? -1 : undefined}
                                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-p-border transition-transform hover:-translate-y-0.5 active:scale-95"
                                >
                                    <Icon className="h-[18px] w-[18px]" />
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
