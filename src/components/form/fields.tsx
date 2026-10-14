'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { countries } from '@/lib/countries';
import { cleanHandle, LIMITS, ProfileFormValues, SOCIALS, SocialKey, DEFAULT_WHATSAPP_MESSAGE } from '@/lib/profile';
import { THEMES } from '@/lib/themes';
import { CheckIcon, SOCIAL_ICONS, UploadIcon, GlobeIcon } from '../icons';

export type SetField = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => void;

interface FieldProps {
    values: ProfileFormValues;
    set: SetField;
}

// ---------------------------------------------------------------------------

export function TextField({
    id,
    label,
    value,
    onChange,
    placeholder,
    hint,
    maxLength,
    type = 'text',
    required,
    autoFocus,
    onEnter,
    inputMode,
    autoComplete,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    hint?: string;
    maxLength?: number;
    type?: string;
    required?: boolean;
    autoFocus?: boolean;
    onEnter?: () => void;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    autoComplete?: string;
}) {
    return (
        <div>
            <div className="flex items-baseline justify-between">
                <label htmlFor={id} className="label">
                    {label}
                    {required && <span className="ml-0.5 text-[#D23A3A]">*</span>}
                </label>
                {maxLength && value.length > maxLength * 0.7 && (
                    <span className="font-mono text-[11px] text-muted">
                        {value.length}/{maxLength}
                    </span>
                )}
            </div>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && onEnter) {
                        e.preventDefault();
                        onEnter();
                    }
                }}
                placeholder={placeholder}
                maxLength={maxLength}
                required={required}
                autoFocus={autoFocus}
                inputMode={inputMode}
                autoComplete={autoComplete}
                className="input"
            />
            {hint && <p className="hint">{hint}</p>}
        </div>
    );
}

// ---------------------------------------------------------------------------

export function WhatsAppField({ values, set, onEnter, autoFocus }: FieldProps & { onEnter?: () => void; autoFocus?: boolean }) {
    return (
        <div>
            <label htmlFor="whatsappNumber" className="label">
                WhatsApp number
            </label>
            <div className="flex gap-2">
                <select
                    aria-label="Country code"
                    value={values.whatsappCountry}
                    onChange={(e) => set('whatsappCountry', e.target.value)}
                    className="input w-[7.5rem] shrink-0 px-3"
                >
                    {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.flag} {c.dialCode}
                        </option>
                    ))}
                </select>
                <input
                    id="whatsappNumber"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={values.whatsappNumber}
                    onChange={(e) => set('whatsappNumber', e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && onEnter) {
                            e.preventDefault();
                            onEnter();
                        }
                    }}
                    placeholder="801 234 5678"
                    autoFocus={autoFocus}
                    className="input min-w-0 flex-1"
                />
            </div>
            <p className="hint">Customers tap once to start a chat. Leave empty if you don’t use WhatsApp.</p>
        </div>
    );
}

export function WhatsAppMessageField({ values, set }: FieldProps) {
    return (
        <TextField
            id="whatsappMessage"
            label="WhatsApp greeting"
            value={values.whatsappMessage}
            onChange={(v) => set('whatsappMessage', v)}
            placeholder={DEFAULT_WHATSAPP_MESSAGE}
            maxLength={LIMITS.whatsappMessage}
            hint="The message pre-filled when a customer opens the chat."
        />
    );
}

// ---------------------------------------------------------------------------

export function EmailField({ values, set, onEnter, autoFocus }: FieldProps & { onEnter?: () => void; autoFocus?: boolean }) {
    return (
        <div className="space-y-3">
            <TextField
                id="email"
                type="email"
                label="Email"
                value={values.email}
                onChange={(v) => set('email', v)}
                placeholder="hello@yourbusiness.com"
                required
                autoFocus={autoFocus}
                onEnter={onEnter}
                autoComplete="email"
                inputMode="email"
                maxLength={LIMITS.email}
                hint="We send your private edit link here."
            />
            <Toggle
                checked={values.showEmail}
                onChange={(v) => set('showEmail', v)}
                label="Show an Email button on my page"
            />
        </div>
    );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <label className="flex cursor-pointer items-center gap-3 text-sm">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-ink transition-colors ${checked ? 'bg-accent' : 'bg-white'}`}
            >
                <span
                    className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-ink transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                />
            </button>
            <span>{label}</span>
        </label>
    );
}

// ---------------------------------------------------------------------------

export function LogoUpload({ values, set }: FieldProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const upload = async (file: File) => {
        setUploading(true);
        setError('');
        try {
            const body = new FormData();
            body.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body });
            const data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
            set('logoUrl', data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        }
        setUploading(false);
    };

    return (
        <div>
            <span className="label">Logo or photo</span>
            <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-white">
                    {values.logoUrl ? (
                        <img src={values.logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
                    ) : (
                        <span className="font-display text-2xl font-bold text-ink/30">
                            {(values.businessName || '?').charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-start gap-1.5">
                    <label className={`btn-secondary cursor-pointer px-4 py-2 text-sm ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
                        <UploadIcon className="h-4 w-4" />
                        {uploading ? 'Uploading…' : values.logoUrl ? 'Replace' : 'Upload image'}
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="sr-only"
                            disabled={uploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) upload(file);
                                e.target.value = '';
                            }}
                        />
                    </label>
                    {values.logoUrl && (
                        <button type="button" onClick={() => set('logoUrl', '')} className="text-xs text-muted underline hover:text-ink">
                            Remove
                        </button>
                    )}
                </div>
            </div>
            <p className="hint">{error ? <span className="text-[#D23A3A]">{error}</span> : 'Square images look best. Max 5MB.'}</p>
        </div>
    );
}

// ---------------------------------------------------------------------------

export function SocialFields({ values, set }: FieldProps) {
    const update = (key: SocialKey, value: string) => set('socials', { ...values.socials, [key]: value });

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICONS[s.key];
                return (
                    <div key={s.key}>
                        <label htmlFor={`social-${s.key}`} className="sr-only">
                            {s.label}
                        </label>
                        <div className="flex items-center rounded-xl border-2 border-line bg-white transition-colors focus-within:border-ink">
                            <span className="flex h-12 w-11 shrink-0 items-center justify-center text-ink/60" title={s.label}>
                                <Icon className="h-[18px] w-[18px]" />
                            </span>
                            <input
                                id={`social-${s.key}`}
                                value={values.socials[s.key]}
                                onChange={(e) => update(s.key, e.target.value)}
                                onBlur={(e) => update(s.key, cleanHandle(s.key, e.target.value))}
                                placeholder={`${s.label} — ${s.placeholder}`}
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                className="h-12 min-w-0 flex-1 bg-transparent pr-3 text-[15px] outline-none placeholder:text-ink/35"
                            />
                        </div>
                    </div>
                );
            })}
            <div className="sm:col-span-2">
                <label htmlFor="website" className="sr-only">
                    Website
                </label>
                <div className="flex items-center rounded-xl border-2 border-line bg-white transition-colors focus-within:border-ink">
                    <span className="flex h-12 w-11 shrink-0 items-center justify-center text-ink/60">
                        <GlobeIcon className="h-[18px] w-[18px]" />
                    </span>
                    <input
                        id="website"
                        value={values.website}
                        onChange={(e) => set('website', e.target.value)}
                        placeholder="Website — www.yourbusiness.com"
                        inputMode="url"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className="h-12 min-w-0 flex-1 bg-transparent pr-3 text-[15px] outline-none placeholder:text-ink/35"
                    />
                </div>
            </div>
            <p className="hint sm:col-span-2">Type your handle or paste a profile link. Leave any blank to hide it.</p>
        </div>
    );
}

// ---------------------------------------------------------------------------

export function ThemePicker({ values, set }: FieldProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => {
                const active = values.theme === t.id;
                return (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => set('theme', t.id)}
                        aria-pressed={active}
                        className={`group relative rounded-2xl border-2 border-ink p-2 text-left transition-all ${
                            active ? 'shadow-hard -translate-x-0.5 -translate-y-0.5' : 'hover:shadow-hard-sm'
                        }`}
                        style={{ background: t.bg }}
                    >
                        <div className="rounded-xl p-2.5" style={{ background: t.card, border: `2px solid ${t.border}` }}>
                            <div className="mx-auto mb-2 h-5 w-5 rounded-full" style={{ background: t.accent }} />
                            <div className="mx-auto mb-1.5 h-1.5 w-3/4 rounded-full" style={{ background: t.text }} />
                            <div className="h-3 rounded-md" style={{ background: t.accent }} />
                        </div>
                        <span className="mt-1.5 block text-center text-xs font-semibold" style={{ color: t.id === 'midnight' ? '#F4F4F5' : '#141414' }}>
                            {t.name}
                        </span>
                        {active && (
                            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-accent">
                                <CheckIcon className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------

export function useOrigin() {
    const [origin, setOrigin] = useState('');
    useEffect(() => setOrigin(window.location.origin), []);
    return origin;
}
