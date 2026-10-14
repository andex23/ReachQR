'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Brand';
import PhoneFrame from '@/components/PhoneFrame';
import ProfileCard from '@/components/ProfileCard';
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon } from '@/components/icons';
import {
    EmailField,
    LogoUpload,
    SocialFields,
    TextField,
    ThemePicker,
    WhatsAppField,
    WhatsAppMessageField,
    useOrigin,
} from '@/components/form/fields';
import { useSlugCheck } from '@/components/form/useSlugCheck';
import { emptyFormValues, formToCard, generateSlug, isValidSlug, LIMITS, ProfileFormValues } from '@/lib/profile';

const DRAFT_KEY = 'rq_create_draft_v2';

type StepId = 'name' | 'brand' | 'contact' | 'links' | 'location' | 'theme';

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
    { id: 'name', title: 'What’s your business called?', subtitle: 'This is the big name at the top of your page.' },
    { id: 'brand', title: 'Make it look like you', subtitle: 'A short line about what you do, plus your logo.' },
    { id: 'contact', title: 'How should customers reach you?', subtitle: 'Add as many as you like.' },
    { id: 'links', title: 'Where else can people find you?', subtitle: 'Socials and website. All optional.' },
    { id: 'location', title: 'Do customers visit you?', subtitle: 'Add an address to show a Directions button.' },
    { id: 'theme', title: 'Pick a look', subtitle: 'You can change this any time.' },
];

const FIELD_STEP: Record<string, StepId> = {
    businessName: 'name',
    slug: 'name',
    tagline: 'brand',
    logoUrl: 'brand',
    email: 'contact',
    whatsappNumber: 'contact',
    phone: 'contact',
    website: 'links',
    address: 'location',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreatePage() {
    const router = useRouter();
    const origin = useOrigin();

    const [values, setValues] = useState<ProfileFormValues>(emptyFormValues);
    const [stepIndex, setStepIndex] = useState(0);
    const [slugEdited, setSlugEdited] = useState(false);
    const [editingSlug, setEditingSlug] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [honeypot, setHoneypot] = useState('');

    const step = STEPS[stepIndex];
    const isLast = stepIndex === STEPS.length - 1;

    // Restore a draft so a refresh doesn't lose progress
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const draft = JSON.parse(raw);
                setValues({ ...emptyFormValues(), ...draft.values, socials: { ...emptyFormValues().socials, ...draft.values?.socials } });
                setSlugEdited(!!draft.slugEdited);
                setStepIndex(Math.min(Math.max(0, draft.stepIndex || 0), STEPS.length - 1));
            }
        } catch {
            // ignore
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, stepIndex, slugEdited }));
        } catch {
            // ignore
        }
    }, [values, stepIndex, slugEdited, hydrated]);

    const set = useCallback(<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
        setValues((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'businessName' && !slugEdited) next.slug = generateSlug(value as string);
            return next;
        });
        setError('');
    }, [slugEdited]);

    const slugStatus = useSlugCheck(values.slug);
    const card = useMemo(() => formToCard(values), [values]);

    const validate = (id: StepId): string => {
        if (id === 'name') {
            if (!values.businessName.trim()) return 'Please enter your business name';
            if (!isValidSlug(values.slug)) return 'Your link needs at least 2 letters or numbers. Tap “Customize” to set one.';
            if (slugStatus === 'taken') return 'That link is taken. Try a different one.';
        }
        if (id === 'contact') {
            if (!EMAIL_PATTERN.test(values.email.trim())) return 'Please enter a valid email so we can send your edit link';
        }
        return '';
    };

    const goTo = (index: number) => {
        setError('');
        setStepIndex(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const next = () => {
        const problem = validate(step.id);
        if (problem) {
            setError(problem);
            return;
        }
        if (isLast) submit();
        else goTo(stepIndex + 1);
    };

    const submit = async () => {
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, website_confirm: honeypot }),
            });
            const data = await res.json();
            if (!res.ok) {
                const target = data.field && FIELD_STEP[data.field];
                if (target) setStepIndex(STEPS.findIndex((s) => s.id === target));
                throw new Error(data.error || 'Something didn’t save. Please try again.');
            }
            try {
                localStorage.removeItem(DRAFT_KEY);
                sessionStorage.setItem('rq_last_name', values.businessName.trim());
            } catch {
                // ignore
            }
            // The token goes in the fragment so it never reaches server logs.
            router.push(`/success?slug=${encodeURIComponent(data.slug)}#t=${data.editToken}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something didn’t save. Please try again.');
            setSubmitting(false);
        }
    };

    const host = origin.replace(/^https?:\/\//, '');

    return (
        <div className="min-h-screen">
            {/* Top bar */}
            <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Logo />
                    <div className="flex items-center gap-3">
                        <span className="eyebrow hidden sm:inline">
                            Step {stepIndex + 1} of {STEPS.length}
                        </span>
                        <button type="button" onClick={() => setShowPreview(true)} className="btn-secondary px-3 py-1.5 text-sm lg:hidden">
                            <EyeIcon className="h-4 w-4" /> Preview
                        </button>
                    </div>
                </div>
                <div className="h-1.5 bg-line">
                    <div className="h-full bg-ink transition-all duration-500" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
                </div>
            </header>

            <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:py-16">
                {/* Form column */}
                <div className="mx-auto w-full max-w-xl">
                    <div key={step.id} className="animate-fade-up">
                        <p className="eyebrow mb-3 sm:hidden">
                            Step {stepIndex + 1} of {STEPS.length}
                        </p>
                        <h1 className="text-3xl font-bold leading-[1.1] sm:text-4xl">{step.title}</h1>
                        <p className="mt-2 text-muted">{step.subtitle}</p>

                        <form
                            className="mt-8 space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                next();
                            }}
                        >
                            {step.id === 'name' && (
                                <>
                                    <TextField
                                        id="businessName"
                                        label="Business name"
                                        value={values.businessName}
                                        onChange={(v) => set('businessName', v)}
                                        placeholder="Mama Tee’s Kitchen"
                                        maxLength={LIMITS.businessName}
                                        autoFocus
                                        required
                                    />
                                    <div className="rounded-xl border-2 border-dashed border-line bg-white/60 p-4">
                                        <p className="eyebrow mb-2">Your link</p>
                                        {editingSlug ? (
                                            <div className="flex items-center gap-2">
                                                <span className="shrink-0 font-mono text-sm text-muted">{host}/u/</span>
                                                <input
                                                    aria-label="Custom link"
                                                    value={values.slug}
                                                    onChange={(e) => {
                                                        setSlugEdited(true);
                                                        set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 50));
                                                    }}
                                                    className="input py-2 font-mono text-sm"
                                                    autoFocus
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="truncate font-mono text-sm">
                                                    {host}/u/<span className="font-semibold">{values.slug || 'your-business'}</span>
                                                </p>
                                                <button type="button" onClick={() => setEditingSlug(true)} className="shrink-0 text-xs font-semibold underline">
                                                    Customize
                                                </button>
                                            </div>
                                        )}
                                        <p
                                            className={`mt-2 text-xs font-medium ${
                                                slugStatus === 'available' ? 'text-[#1E6B40]' : slugStatus === 'taken' || slugStatus === 'invalid' ? 'text-[#D23A3A]' : 'text-muted'
                                            }`}
                                            aria-live="polite"
                                        >
                                            {slugStatus === 'checking' && 'Checking…'}
                                            {slugStatus === 'available' && '✓ Available'}
                                            {slugStatus === 'taken' && '✗ Already taken. Try adding your city or a word.'}
                                            {slugStatus === 'invalid' && 'Use at least 2 letters or numbers'}
                                            {slugStatus === 'idle' && 'This is what your QR code opens.'}
                                        </p>
                                    </div>
                                </>
                            )}

                            {step.id === 'brand' && (
                                <>
                                    <TextField
                                        id="tagline"
                                        label="What do you do?"
                                        value={values.tagline}
                                        onChange={(v) => set('tagline', v)}
                                        placeholder="Home-cooked meals, delivered in Lekki"
                                        maxLength={LIMITS.tagline}
                                        autoFocus
                                        onEnter={next}
                                    />
                                    <LogoUpload values={values} set={set} />
                                </>
                            )}

                            {step.id === 'contact' && (
                                <>
                                    <WhatsAppField values={values} set={set} autoFocus onEnter={next} />
                                    {values.whatsappNumber && <WhatsAppMessageField values={values} set={set} />}
                                    <TextField
                                        id="phone"
                                        type="tel"
                                        label="Phone for calls"
                                        value={values.phone}
                                        onChange={(v) => set('phone', v)}
                                        placeholder="+234 801 234 5678"
                                        inputMode="tel"
                                        hint="Optional. Adds a Call button."
                                        onEnter={next}
                                    />
                                    <EmailField values={values} set={set} onEnter={next} />
                                </>
                            )}

                            {step.id === 'links' && <SocialFields values={values} set={set} />}

                            {step.id === 'location' && (
                                <TextField
                                    id="address"
                                    label="Address"
                                    value={values.address}
                                    onChange={(v) => set('address', v)}
                                    placeholder="12 Admiralty Way, Lekki, Lagos"
                                    maxLength={LIMITS.address}
                                    autoFocus
                                    onEnter={next}
                                    hint="Leave empty if you’re online-only."
                                />
                            )}

                            {step.id === 'theme' && (
                                <>
                                    <ThemePicker values={values} set={set} />
                                    <div className="lg:hidden">
                                        <PhoneFrame themeId={values.theme} className="mt-4 max-w-[300px]">
                                            <ProfileCard card={card} preview />
                                        </PhoneFrame>
                                    </div>
                                </>
                            )}

                            {/* Honeypot */}
                            <input
                                type="text"
                                name="website_confirm"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                                className="hidden"
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                            />

                            {error && (
                                <p role="alert" className="rounded-xl border-2 border-[#D23A3A] bg-[#FDECEC] px-4 py-3 text-sm font-medium text-[#8A1C1C]">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                {stepIndex > 0 && (
                                    <button type="button" onClick={() => goTo(stepIndex - 1)} className="btn-secondary px-4" aria-label="Back">
                                        <ArrowLeftIcon />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting || (step.id === 'name' && slugStatus === 'checking')}
                                    className={`${isLast ? 'btn-accent' : 'btn-primary'} flex-1 text-base`}
                                >
                                    {submitting ? 'Creating your page…' : isLast ? 'Create my page & QR code' : 'Continue'}
                                    {!submitting && <ArrowRightIcon />}
                                </button>
                            </div>

                            {['brand', 'links', 'location'].includes(step.id) && (
                                <button type="button" onClick={() => goTo(stepIndex + 1)} className="btn-ghost w-full text-sm">
                                    Skip for now
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Live preview (desktop) */}
                <aside className="hidden lg:block">
                    <div className="sticky top-28">
                        <p className="eyebrow mb-4 text-center">Live preview</p>
                        <PhoneFrame themeId={values.theme}>
                            <ProfileCard card={card} preview />
                        </PhoneFrame>
                    </div>
                </aside>
            </main>

            {/* Preview sheet (mobile) */}
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
