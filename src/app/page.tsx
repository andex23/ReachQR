import Link from 'next/link';
import QRCode from 'qrcode';
import { SiteFooter, SiteHeader } from '@/components/Brand';
import PhoneFrame from '@/components/PhoneFrame';
import ProfileCard from '@/components/ProfileCard';
import {
    ArrowRightIcon,
    BoltIcon,
    ContactCardIcon,
    LockIcon,
    PaletteIcon,
    PrinterIcon,
    WhatsAppIcon,
} from '@/components/icons';
import { CardData, mapsLink, whatsappLink } from '@/lib/profile';
import { THEMES } from '@/lib/themes';

const DEMO: CardData = {
    slug: 'mama-tees-kitchen',
    businessName: 'Mama Tee’s Kitchen',
    tagline: 'Home-cooked jollof & small chops · Lekki',
    logoUrl: null,
    theme: 'sunset',
    whatsappUrl: whatsappLink('2348012345678'),
    phone: '+234 801 234 5678',
    email: 'orders@mamatees.ng',
    mapsUrl: mapsLink('Lekki Phase 1, Lagos'),
    address: 'Lekki Phase 1, Lagos',
    website: null,
    socials: [
        { key: 'instagram', label: 'Instagram', url: 'https://instagram.com' },
        { key: 'tiktok', label: 'TikTok', url: 'https://tiktok.com' },
        { key: 'facebook', label: 'Facebook', url: 'https://facebook.com' },
    ],
};

const FEATURES = [
    { icon: WhatsAppIcon, title: 'WhatsApp first', body: 'One tap opens a chat with a greeting you choose. No saving numbers, no typos.' },
    { icon: PrinterIcon, title: 'Print-ready', body: 'Download a crisp PNG, a scalable SVG, or a ready-made sign for your counter.' },
    { icon: PaletteIcon, title: 'Six themes', body: 'Pick a look that matches your brand. Switch any time.' },
    { icon: ContactCardIcon, title: 'Save contact', body: 'Customers add you to their phone in one tap, with your logo and links.' },
    { icon: BoltIcon, title: 'Edit, never reprint', body: 'Change your number or links whenever you like. Your QR code stays the same.' },
    { icon: LockIcon, title: 'Free, no account', body: 'No passwords, no monthly fees. A private link lets you edit your page.' },
];

const STEPS = [
    { n: '01', title: 'Fill in your details', body: 'Business name, WhatsApp, socials. Takes about a minute.' },
    { n: '02', title: 'Get your QR code', body: 'Download it or a printable sign, ready for cards, stickers and packaging.' },
    { n: '03', title: 'Customers reach you', body: 'They scan, tap and they’re chatting with you. No app needed.' },
];

const FAQ = [
    { q: 'Is it really free?', a: 'Yes. Creating a page, downloading your QR code and editing it are all free.' },
    { q: 'Do I need an account?', a: 'No. When you create a page we give you a private edit link and email you a copy. Lose it? Request a new one from the Recover page with your email.' },
    { q: 'If I change my number, do I need a new QR code?', a: 'No. The QR code points to your page, not to your number. Update the page and every printed code updates with it.' },
    { q: 'Do customers need an app?', a: 'No. Any phone camera can scan the code, and the page opens in their browser.' },
];

const USES = ['Business cards', 'Shop windows', 'Packaging', 'Menus', 'Flyers', 'Market stalls', 'Delivery bags', 'Receipts'];

export default async function HomePage() {
    const qrSvg = await QRCode.toString(process.env.NEXT_PUBLIC_BASE_URL || 'https://reachqr.vercel.app', {
        type: 'svg',
        margin: 0,
        color: { dark: '#141414', light: '#00000000' },
    });

    return (
        <>
            <SiteHeader />

            <main>
                {/* Hero */}
                <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
                    <div className="animate-fade-up">
                        <span className="chip">
                            <span className="h-2 w-2 rounded-full bg-[#1E6B40]" /> Free · No account · 60 seconds
                        </span>
                        <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] sm:text-7xl">
                            One scan.
                            <br />
                            <span className="relative inline-block">
                                <span className="relative z-10">Instant contact.</span>
                                <span className="absolute inset-x-0 bottom-1 -z-0 h-4 rounded bg-accent sm:bottom-2 sm:h-6" />
                            </span>
                        </h1>
                        <p className="mt-6 max-w-lg text-lg text-muted sm:text-xl">
                            Turn your business card, shop window or packaging into a WhatsApp button. Make a free contact page and QR code in a minute.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/create" className="btn-accent px-7 py-4 text-lg">
                                Create my free page <ArrowRightIcon />
                            </Link>
                            <Link href="#how" className="btn-secondary px-7 py-4 text-lg">
                                How it works
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-muted">Already have a page? <Link href="/recover" className="font-semibold text-ink underline">Get your edit link</Link></p>
                    </div>

                    <div className="relative animate-fade-up">
                        <PhoneFrame themeId={DEMO.theme} className="rotate-[1.5deg]">
                            <ProfileCard card={DEMO} preview />
                        </PhoneFrame>
                        <div className="absolute -bottom-6 -left-2 hidden w-36 -rotate-6 rounded-2xl border-2 border-ink bg-white p-3 shadow-hard sm:block lg:-left-10">
                            <div className="aspect-square [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                            <p className="mt-2 text-center font-mono text-[10px] font-semibold uppercase tracking-widest">Scan me</p>
                        </div>
                    </div>
                </section>

                {/* Uses strip */}
                <section className="overflow-hidden border-y-2 border-ink bg-ink py-4 text-paper">
                    <div className="flex w-max gap-10 whitespace-nowrap font-display text-xl font-bold motion-safe:animate-[marquee_30s_linear_infinite]">
                        {[...USES, ...USES].map((u, i) => (
                            <span key={i} className="flex items-center gap-10">
                                {u} <span className="text-accent">✦</span>
                            </span>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
                    <p className="eyebrow">Why ReachQR</p>
                    <h2 className="mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">Everything you need. Nothing you don’t.</h2>
                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="rounded-2xl border-2 border-ink bg-white p-6 transition-transform hover:-translate-y-1 hover:shadow-hard">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink bg-accent">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold">{f.title}</h3>
                                <p className="mt-2 text-muted">{f.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section id="how" className="scroll-mt-20 border-y-2 border-ink bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
                        <p className="eyebrow">How it works</p>
                        <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Live in three steps.</h2>
                        <ol className="mt-12 grid gap-8 md:grid-cols-3">
                            {STEPS.map((s) => (
                                <li key={s.n} className="border-t-2 border-ink pt-6">
                                    <span className="font-mono text-sm font-semibold text-muted">{s.n}</span>
                                    <h3 className="mt-3 text-2xl font-bold">{s.title}</h3>
                                    <p className="mt-2 text-muted">{s.body}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Themes */}
                <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="eyebrow">Themes</p>
                            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Make it yours.</h2>
                        </div>
                        <Link href="/create" className="btn-secondary self-start sm:self-auto">
                            Try them out <ArrowRightIcon />
                        </Link>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {THEMES.map((t) => (
                            <div key={t.id} className="rounded-2xl border-2 border-ink p-3" style={{ background: t.bg }}>
                                <div className="rounded-xl p-4" style={{ background: t.card, border: `2px solid ${t.border}`, color: t.text }}>
                                    <div className="mx-auto mb-3 h-10 w-10 rounded-full" style={{ background: t.accent, border: `2px solid ${t.border}` }} />
                                    <div className="mx-auto mb-1.5 h-2 w-3/4 rounded-full" style={{ background: t.text }} />
                                    <div className="mx-auto mb-4 h-1.5 w-1/2 rounded-full" style={{ background: t.muted }} />
                                    <div className="h-7 rounded-lg" style={{ background: t.accent, border: `2px solid ${t.border}` }} />
                                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                                        <div className="h-5 rounded-md" style={{ border: `2px solid ${t.border}` }} />
                                        <div className="h-5 rounded-md" style={{ border: `2px solid ${t.border}` }} />
                                    </div>
                                </div>
                                <p className="mt-2 text-center text-sm font-semibold" style={{ color: t.id === 'midnight' ? '#F4F4F5' : '#141414' }}>
                                    {t.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="border-t-2 border-ink bg-white">
                    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:py-28">
                        <div>
                            <p className="eyebrow">FAQ</p>
                            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">Questions, answered.</h2>
                        </div>
                        <div className="divide-y-2 divide-ink border-y-2 border-ink">
                            {FAQ.map((f) => (
                                <details key={f.q} className="group py-5">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                                        {f.q}
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-lg transition-transform group-open:rotate-45">
                                            +
                                        </span>
                                    </summary>
                                    <p className="mt-3 max-w-xl text-muted">{f.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="border-t-2 border-ink bg-accent">
                    <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center">
                        <h2 className="max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">Your customers are one scan away.</h2>
                        <Link href="/create" className="btn-primary px-8 py-4 text-lg">
                            Create my free page <ArrowRightIcon />
                        </Link>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </>
    );
}
