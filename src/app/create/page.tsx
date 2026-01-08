'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { countries, getDefaultCountry, Country } from '@/lib/countries';
import { generateSlug, formatE164 } from '@/lib/utils';

type Step = {
    id: string;
    question: string;
    subtext?: string;
    type: 'text' | 'email' | 'tel' | 'social' | 'country-phone' | 'file';
    placeholder?: string;
    required?: boolean;
    skipText?: string;
    maxLength?: number;
};

const steps: Step[] = [
    { id: 'businessName', question: "What's your business name?", type: 'text', placeholder: 'Acme Design Studio', required: true },
    { id: 'tagline', question: "What do you do?", subtext: 'Example: "Graphic design & branding"', type: 'text', placeholder: 'Graphic design & branding', skipText: 'Skip', maxLength: 60 },
    { id: 'logoUrl', question: "Do you have a logo?", subtext: 'Upload your logo image (square works best)', type: 'file', placeholder: '', skipText: "I'll add it later" },
    { id: 'email', question: "What's your email?", type: 'email', placeholder: 'hello@yourbusiness.com', required: true },
    { id: 'whatsapp', question: "What's your WhatsApp number?", type: 'country-phone', placeholder: '8012345678', required: true },
    { id: 'phone', question: "Any other phone number?", type: 'tel', placeholder: '+234 801 234 5678', skipText: 'Skip' },
    { id: 'instagram', question: "Are you on Instagram?", type: 'social', placeholder: '@yourhandle', skipText: "I don't have Instagram" },
    { id: 'twitter', question: "Are you on X (Twitter)?", type: 'social', placeholder: '@yourhandle', skipText: "Skip" },
    { id: 'tiktok', question: "Are you on TikTok?", type: 'social', placeholder: '@yourhandle', skipText: "Skip" },
    { id: 'linkedin', question: "Are you on LinkedIn?", type: 'social', placeholder: 'yourname', skipText: "Skip" },
    { id: 'website', question: "Do you have a website?", type: 'text', placeholder: 'www.yourbusiness.com', skipText: "I don't have one" },
    { id: 'address', question: "Where are you located?", subtext: 'Adds a "Get Directions" button', type: 'text', placeholder: '123 Main Street, Lagos', skipText: "Skip" },
];

export default function CreatePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [checkingSlug, setCheckingSlug] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [currentValue, setCurrentValue] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setCurrentValue(data.url);
            } else {
                setError('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Upload failed');
        }
        setIsUploading(false);
    };

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const progress = ((currentStep + 1) / steps.length) * 100;

    const slug = formData.businessName ? generateSlug(formData.businessName) : '';

    const checkSlugAvailability = useCallback(async (slugToCheck: string) => {
        if (!slugToCheck || slugToCheck.length < 2) {
            setSlugAvailable(null);
            return;
        }
        setCheckingSlug(true);
        try {
            const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slugToCheck)}`);
            const data = await res.json();
            setSlugAvailable(data.available);
        } catch {
            setSlugAvailable(null);
        }
        setCheckingSlug(false);
    }, []);

    useEffect(() => {
        if (slug) {
            const timer = setTimeout(() => checkSlugAvailability(slug), 500);
            return () => clearTimeout(timer);
        }
    }, [slug, checkSlugAvailability]);

    useEffect(() => {
        if (step) {
            setCurrentValue(formData[step.id] || '');
        }
    }, [currentStep, formData, step]);

    const handleNext = () => {
        if (step.required && !currentValue.trim()) {
            setError('This field is required');
            return;
        }

        setError('');
        setFormData(prev => ({ ...prev, [step.id]: currentValue }));

        if (isLastStep) {
            handleSubmit();
        } else {
            setCurrentStep(prev => prev + 1);
            setCurrentValue('');
        }
    };

    const handleSkip = () => {
        setError('');
        setFormData(prev => ({ ...prev, [step.id]: '' }));
        setCurrentStep(prev => prev + 1);
        setCurrentValue('');
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setError('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNext();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            const whatsappE164 = formatE164(selectedCountry.dialCode, formData.whatsapp || '');

            const res = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    business_name: formData.businessName,
                    tagline: formData.tagline || null,
                    logo_url: formData.logoUrl || null,
                    whatsapp_e164: whatsappE164,
                    phone: formData.phone || null,
                    email: formData.email,
                    instagram: formData.instagram || null,
                    twitter: formData.twitter || null,
                    tiktok: formData.tiktok || null,
                    facebook: null,
                    linkedin: formData.linkedin || null,
                    youtube: null,
                    website: formData.website || null,
                    address: formData.address || null,
                    honeypot: '',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // User-friendly error messages
                throw new Error(data.error || "Something didn't save — try again");
            }

            router.push(`/success?slug=${data.slug}&token=${data.editToken}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something didn't save — try again");
            setIsSubmitting(false);
        }
    };

    // Guard against undefined step
    if (!step) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-ink/60">Loading...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col">
            {/* Progress bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-border z-50">
                <div
                    className="h-full bg-ink transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Header */}
            <div className="pt-8 pb-4 px-4 text-center">
                <h1 className="text-2xl font-mono font-semibold text-ink">
                    Reach<span className="text-ink/40">QR</span>
                </h1>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
                <div className="w-full max-w-md">
                    {/* Step counter */}
                    <p className="text-sm text-ink/40 mb-2">
                        {currentStep + 1} of {steps.length}
                    </p>

                    {/* Question */}
                    <h2 className="text-2xl md:text-3xl font-mono font-medium text-ink mb-2">
                        {step.question}
                    </h2>

                    {/* Subtext */}
                    {step.subtext && (
                        <p className="text-ink/50 text-sm mb-6">{step.subtext}</p>
                    )}
                    {!step.subtext && <div className="mb-6" />}

                    {/* Input */}
                    {step.type === 'country-phone' ? (
                        <div className="flex gap-2 mb-4">
                            <select
                                value={selectedCountry.code}
                                onChange={(e) => {
                                    const country = countries.find((c) => c.code === e.target.value);
                                    if (country) setSelectedCountry(country);
                                }}
                                className="input-field w-32 flex-shrink-0"
                                aria-label="Country code"
                            >
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.flag} {country.dialCode}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={step.placeholder}
                                className="input-field flex-1 text-lg"
                                autoFocus
                            />
                        </div>
                    ) : step.type === 'file' ? (
                        <div className="mb-4">
                            {currentValue ? (
                                <div className="relative w-32 h-32 mx-auto mb-4 border border-border rounded-xl overflow-hidden group bg-white shadow-sm">
                                    <img src={currentValue} alt="Logo preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setCurrentValue('')}
                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="logo-upload"
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-ink/5 transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        {isUploading ? (
                                            <span className="text-sm font-medium text-ink/60 animate-pulse">Uploading...</span>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-ink/40 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                </svg>
                                                <span className="text-sm font-medium text-ink/60">Tap to upload logo</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}
                        </div>
                    ) : (
                        <input
                            type={step.type === 'social' ? 'text' : step.type}
                            value={currentValue}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (step.type === 'social') {
                                    val = val.replace(/[^a-zA-Z0-9._@]/g, '');
                                }
                                if (step.maxLength && val.length > step.maxLength) {
                                    val = val.slice(0, step.maxLength);
                                }
                                setCurrentValue(val);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={step.placeholder}
                            className="input-field w-full text-lg mb-4"
                            maxLength={step.maxLength}
                            autoFocus
                        />
                    )}

                    {/* Character count for limited fields */}
                    {step.maxLength && currentValue.length > 0 && (
                        <p className="text-xs text-ink/40 mb-4 -mt-2">
                            {currentValue.length}/{step.maxLength}
                        </p>
                    )}

                    {/* Slug preview */}
                    {step.id === 'businessName' && currentValue && (
                        <p className={`text-sm mb-4 ${checkingSlug ? 'text-ink/50' :
                            slugAvailable === true ? 'text-green-600' :
                                slugAvailable === false ? 'text-red-500' : 'text-ink/50'
                            }`}>
                            {checkingSlug ? 'Checking...' :
                                slugAvailable === true ? `✓ reachqr.com/${generateSlug(currentValue)}` :
                                    slugAvailable === false ? '✗ This name is taken, try another' :
                                        `reachqr.com/${generateSlug(currentValue)}`}
                        </p>
                    )}

                    {/* Error message */}
                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-4 rounded-xl border border-border text-ink hover:bg-ink/5 transition-colors"
                            >
                                Back
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={isSubmitting || (step.id === 'businessName' && slugAvailable === false)}
                            className="flex-1 btn-primary disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : isLastStep ? 'Generate QR Code' : 'Continue'}
                        </button>
                    </div>

                    {/* Skip button */}
                    {step.skipText && !step.required && (
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="w-full mt-4 py-3 text-ink/50 hover:text-ink/70 text-sm transition-colors"
                        >
                            {step.skipText}
                        </button>
                    )}
                </div>
            </div>

            {/* Honeypot */}
            <input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        </main>
    );
}
