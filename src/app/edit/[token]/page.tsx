'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Logo } from '@/components/Brand';
import CopyButton from '@/components/CopyButton';
import PhoneFrame from '@/components/PhoneFrame';
import ProfileCard from '@/components/ProfileCard';
import QRPanel from '@/components/QRPanel';
import { ArrowRightIcon, CheckIcon, EyeIcon, LockIcon } from '@/components/icons';
import {
    EmailField,
    LogoUpload,
    SetField,
    SocialFields,
    TextField,
    ThemePicker,
    WhatsAppField,
    WhatsAppMessageField,
    useOrigin,
} from '@/components/form/fields';
import { formToCard, LIMITS, ProfileFormValues } from '@/lib/profile';

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' };

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="card space-y-5">
            <div>
                <h2 className="text-xl font-bold">{title}</h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {children}
        </section>
    );
}

export default function EditPage() {
    const { token } = useParams<{ token: string }>();
    const origin = useOrigin();

    const [load, setLoad] = useState<LoadState>({ status: 'loading' });
    const [values, setValues] = useState<ProfileFormValues | null>(null);
    const [saved, setSaved] = useState<ProfileFormValues | null>(null);
    const [views, setViews] = useState(0);
    const [saving, setSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/profiles/${token}`, { cache: 'no-store' });
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok) {
                    setLoad({ status: 'error', message: data.error || 'This edit link may be expired or incorrect.' });
                    return;
                }
                setValues(data.values);
                setSaved(data.values);
                setViews(data.views || 0);
                setLoad({ status: 'ready' });
            } catch {
                if (!cancelled) setLoad({ status: 'error', message: 'Couldn’t connect. Check your internet and try again.' });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const set: SetField = useCallback((key, value) => {
        setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
        setError('');
        setJustSaved(false);
    }, []);

    const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(saved), [values, saved]);
    const card = useMemo(() => (values ? formToCard(values) : null), [values]);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        if (!dirty) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty]);

    const save = async () => {
        if (!values) return;
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`/api/profiles/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Couldn’t save changes. Please try again.');
            setSaved(values);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Couldn’t save changes. Please try again.');
        }
        setSaving(false);
    };

    if (load.status === 'loading') {
        return <main className="flex min-h-screen items-center justify-center text-muted">Loading your page…</main>;
    }

    if (load.status === 'error' || !values || !card) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <div className="card w-full max-w-md text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-accent">
                        <LockIcon className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold">This link isn’t working</h1>
                    <p className="mt-2 text-sm text-muted">{load.status === 'error' ? load.message : ''}</p>
                    <div className="mt-6 space-y-3">
                        <Link href="/recover" className="btn-primary w-full">
                            Get a new edit link
                        </Link>
                        <Link href="/" className="btn-ghost w-full text-sm">
                            Go home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const publicUrl = origin ? `${origin}/u/${values.slug}` : '';

    return (
        <div className="min-h-screen pb-28">
            <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                    <Logo />
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setShowPreview(true)} className="btn-secondary px-3 py-1.5 text-sm lg:hidden">
                            <EyeIcon className="h-4 w-4" /> Preview
                        </button>
                        <a href={`/u/${values.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost hidden px-3 py-2 text-sm sm:inline-flex">
                            View live page <ArrowRightIcon className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </header>

            <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px]">
                <div className="min-w-0 space-y-6">
                    <div>
                        <p className="eyebrow">Editing</p>
                        <h1 className="mt-1 break-words text-3xl font-bold sm:text-4xl">{saved?.businessName}</h1>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="chip">
                                <EyeIcon className="h-3.5 w-3.5" /> {views.toLocaleString()} {views === 1 ? 'visit' : 'visits'}
                            </span>
                            {publicUrl && (
                                <span className="chip max-w-full">
                                    <span className="truncate font-mono">{publicUrl.replace(/^https?:\/\//, '')}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <Section title="Basics">
                        <TextField
                            id="businessName"
                            label="Business name"
                            value={values.businessName}
                            onChange={(v) => set('businessName', v)}
                            maxLength={LIMITS.businessName}
                            required
                        />
                        <TextField
                            id="tagline"
                            label="What do you do?"
                            value={values.tagline}
                            onChange={(v) => set('tagline', v)}
                            maxLength={LIMITS.tagline}
                            placeholder="Home-cooked meals, delivered in Lekki"
                        />
                        <LogoUpload values={values} set={set} />
                    </Section>

                    <Section title="Look" description="Pick the theme for your public page.">
                        <ThemePicker values={values} set={set} />
                    </Section>

                    <Section title="Contact">
                        <WhatsAppField values={values} set={set} />
                        {values.whatsappNumber && <WhatsAppMessageField values={values} set={set} />}
                        <TextField
                            id="phone"
                            type="tel"
                            label="Phone for calls"
                            value={values.phone}
                            onChange={(v) => set('phone', v)}
                            inputMode="tel"
                            placeholder="+234 801 234 5678"
                        />
                        <EmailField values={values} set={set} />
                    </Section>

                    <Section title="Socials & website">
                        <SocialFields values={values} set={set} />
                    </Section>

                    <Section title="Location">
                        <TextField
                            id="address"
                            label="Address"
                            value={values.address}
                            onChange={(v) => set('address', v)}
                            maxLength={LIMITS.address}
                            placeholder="12 Admiralty Way, Lekki, Lagos"
                            hint="Adds a Directions button."
                        />
                    </Section>

                    <Section title="Your QR code" description="It always points to your page, so edits never mean reprinting.">
                        {publicUrl && <QRPanel url={publicUrl} slug={values.slug} businessName={saved?.businessName || values.businessName} compact />}
                    </Section>

                    <section className="rounded-2xl border-2 border-dashed border-line p-5 text-sm text-muted">
                        <p className="font-semibold text-ink">Keep this page’s address private</p>
                        <p className="mt-1">Anyone with this edit link can change your page. Bookmark it, or request a new one from the Recover page.</p>
                        <div className="mt-3">
                            <CopyButton text={typeof window !== 'undefined' ? window.location.href : ''} label="Copy edit link" />
                        </div>
                    </section>
                </div>

                <aside className="hidden lg:block">
                    <div className="sticky top-24">
                        <p className="eyebrow mb-4 text-center">Live preview</p>
                        <PhoneFrame themeId={values.theme}>
                            <ProfileCard card={card} preview />
                        </PhoneFrame>
                    </div>
                </aside>
            </main>

            {/* Save bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <p className="min-w-0 truncate text-sm" role="status">
                        {error ? (
                            <span className="font-medium text-[#D23A3A]">{error}</span>
                        ) : justSaved ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-[#1E6B40]">
                                <CheckIcon className="h-4 w-4" /> Saved. Your page is updated.
                            </span>
                        ) : dirty ? (
                            <span className="font-medium">You have unsaved changes</span>
                        ) : (
                            <span className="text-muted">All changes saved</span>
                        )}
                    </p>
                    <div className="flex shrink-0 gap-2">
                        {dirty && (
                            <button type="button" onClick={() => saved && setValues(saved)} className="btn-ghost px-3 py-2 text-sm">
                                Discard
                            </button>
                        )}
                        <button type="button" onClick={save} disabled={saving || !dirty} className="btn-primary px-6 py-2.5">
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </div>
            </div>

            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center lg:hidden" onClick={() => setShowPreview(false)}>
                    <div className="w-full max-w-sm animate-fade-up" onClick={(e) => e.stopPropagation()}>
                        <PhoneFrame themeId={values.theme} className="max-w-[320px]">
                            <ProfileCard card={card} preview />
                        </PhoneFrame>
                        <button type="button" onClick={() => setShowPreview(false)} className="btn-secondary mx-auto mt-4 flex w-full max-w-[320px]">
                            Close preview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
