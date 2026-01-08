'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { countries, Country } from '@/lib/countries';
import { formatE164 } from '@/lib/utils';
import QRCode from 'qrcode';

interface Profile {
    id: string;
    slug: string;
    business_name: string;
    tagline: string | null;
    whatsapp_e164: string;
    phone: string | null;
    email: string | null;
    logo_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    tiktok_url: string | null;
    facebook_url: string | null;
    linkedin_url: string | null;
    website_url: string | null;
    address: string | null;
}

export default function EditPage() {
    const params = useParams();
    const token = params.token as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form state
    const [businessName, setBusinessName] = useState('');
    const [tagline, setTagline] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [instagram, setInstagram] = useState('');
    const [twitter, setTwitter] = useState('');
    const [tiktok, setTiktok] = useState('');
    const [facebook, setFacebook] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [publicUrl, setPublicUrl] = useState('');

    // Extract handle from URL
    const extractHandle = (url: string | null, platform: string) => {
        if (!url) return '';
        const patterns: Record<string, RegExp> = {
            instagram: /instagram\.com\/([^\/\?]+)/,
            twitter: /(?:twitter|x)\.com\/([^\/\?]+)/,
            tiktok: /tiktok\.com\/@?([^\/\?]+)/,
            facebook: /facebook\.com\/([^\/\?]+)/,
            linkedin: /linkedin\.com\/(?:in|company)\/([^\/\?]+)/,
        };
        const match = url.match(patterns[platform]);
        return match ? match[1] : '';
    };

    const extractDomain = (url: string | null) => {
        if (!url) return '';
        return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    };

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/profiles/${token}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Unable to load your page. Please check your link.');
                    setLoading(false);
                    return;
                }

                const p = data.profile as Profile;
                setProfile(p);

                setBusinessName(p.business_name);
                setTagline(p.tagline || '');
                setPhone(p.phone || '');
                setEmail(p.email || '');
                setLogoUrl(p.logo_url || '');
                setInstagram(extractHandle(p.instagram_url, 'instagram'));
                setTwitter(extractHandle(p.twitter_url, 'twitter'));
                setTiktok(extractHandle(p.tiktok_url, 'tiktok'));
                setFacebook(extractHandle(p.facebook_url, 'facebook'));
                setLinkedin(extractHandle(p.linkedin_url, 'linkedin'));
                setWebsite(extractDomain(p.website_url));
                setAddress(p.address || '');

                if (p.whatsapp_e164) {
                    const country = countries.find((c) =>
                        p.whatsapp_e164.startsWith(c.dialCode.replace('+', ''))
                    );
                    if (country) {
                        setSelectedCountry(country);
                        const localNumber = p.whatsapp_e164.replace(country.dialCode.replace('+', ''), '');
                        setWhatsappNumber(localNumber);
                    } else {
                        setWhatsappNumber(p.whatsapp_e164);
                    }
                }

                setLoading(false);
            } catch {
                setError('Unable to connect. Please check your internet and try again.');
                setLoading(false);
            }
        }

        if (token) fetchProfile();
    }, [token]);

    // Generate QR code when profile loads
    useEffect(() => {
        if (profile && canvasRef.current && typeof window !== 'undefined') {
            const url = `${window.location.origin}/u/${profile.slug}`;
            setPublicUrl(url);
            QRCode.toCanvas(canvasRef.current, url, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#1A1A1A',
                    light: '#FAF9F6',
                },
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setError('');

        try {
            const whatsappE164 = formatE164(selectedCountry.dialCode, whatsappNumber);

            const res = await fetch(`/api/profiles/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    business_name: businessName,
                    tagline: tagline || null,
                    whatsapp_e164: whatsappE164,
                    phone: phone || null,
                    email: email || null,
                    logo_url: logoUrl || null,
                    instagram: instagram || null,
                    twitter: twitter || null,
                    tiktok: tiktok || null,
                    facebook: facebook || null,
                    linkedin: linkedin || null,
                    website: website || null,
                    address: address || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Couldn't save changes. Please try again.");
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't save changes. Please try again.");
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="text-ink/60">Loading your page...</div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="min-h-screen py-8 px-4 md:py-16">
                <div className="max-w-md mx-auto">
                    <div className="card text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-mono font-semibold mb-2">Link Not Working</h1>
                        <p className="text-ink/60 text-sm mb-6">
                            {error || 'This edit link may be expired or incorrect.'}
                        </p>
                        <div className="space-y-3">
                            <Link href="/recover" className="btn-primary block">
                                Recover Your Edit Link
                            </Link>
                            <Link href="/create" className="block py-3 text-ink/50 hover:text-ink/70 text-sm">
                                Create a New Page
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-6 px-4 md:py-12">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-mono font-semibold text-ink mb-2">
                        Edit Your Page
                    </h1>
                    <Link
                        href={`/u/${profile.slug}`}
                        className="text-ink/60 hover:text-ink text-sm"
                        target="_blank"
                    >
                        View live page →
                    </Link>
                </div>

                {/* QR Code Section */}
                <div className="card mb-6">
                    <h2 className="font-medium text-ink text-sm uppercase tracking-wide mb-4">Your QR Code</h2>
                    <div className="flex flex-col items-center gap-4">
                        <canvas ref={canvasRef} className="rounded-xl border border-border" />
                        <button
                            type="button"
                            onClick={() => {
                                if (canvasRef.current) {
                                    const link = document.createElement('a');
                                    link.download = `${profile.slug}-qr-code.png`;
                                    link.href = canvasRef.current.toDataURL('image/png');
                                    link.click();
                                }
                            }}
                            className="w-full py-3 px-6 rounded-xl bg-ink text-milk font-medium transition-all hover:bg-ink/90 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Download QR Code
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="card space-y-4">
                        <h2 className="font-medium text-ink text-sm uppercase tracking-wide">Basic Info</h2>

                        <div>
                            <label htmlFor="businessName" className="label">
                                Business Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="businessName"
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="tagline" className="label">Tagline</label>
                            <input
                                id="tagline"
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className="input-field"
                                maxLength={60}
                                placeholder="What do you do?"
                            />
                        </div>

                        <div>
                            <label htmlFor="logoUrl" className="label">Logo (optional)</label>
                            {logoUrl ? (
                                <div className="relative w-24 h-24 mb-4 border border-border rounded-xl overflow-hidden group bg-white shadow-sm">
                                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setLogoUrl('')}
                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-medium text-xs"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="relative max-w-xs">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={async (e) => {
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
                                                    setLogoUrl(data.url);
                                                } else {
                                                    setError('Upload failed: ' + (data.error || 'Unknown error'));
                                                }
                                            } catch (error) {
                                                console.error('Upload error:', error);
                                                setError('Upload failed');
                                            }
                                            setIsUploading(false);
                                        }}
                                        className="hidden"
                                        id="logo-upload-edit"
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="logo-upload-edit"
                                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-ink/5 transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        {isUploading ? (
                                            <span className="text-xs font-medium text-ink/60 animate-pulse">Uploading...</span>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6 text-ink/40 mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                </svg>
                                                <span className="text-xs font-medium text-ink/60">Upload Logo</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}
                            <p className="text-xs text-ink/50 mt-1">Square image works best (e.g. 200x200px)</p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="card space-y-4">
                        <h2 className="font-medium text-ink text-sm uppercase tracking-wide">Contact</h2>

                        <div>
                            <label htmlFor="email" className="label">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label htmlFor="whatsapp" className="label">
                                WhatsApp <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedCountry.code}
                                    onChange={(e) => {
                                        const country = countries.find((c) => c.code === e.target.value);
                                        if (country) setSelectedCountry(country);
                                    }}
                                    className="input-field w-24 md:w-28 flex-shrink-0 text-sm"
                                    aria-label="Country"
                                >
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.flag} {country.dialCode}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    id="whatsapp"
                                    type="tel"
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    className="input-field flex-1"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="label">Phone (optional)</label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="card space-y-4">
                        <h2 className="font-medium text-ink text-sm uppercase tracking-wide">Social Links</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="instagram" className="label text-xs">Instagram</label>
                                <input
                                    id="instagram"
                                    type="text"
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                                    placeholder="@handle"
                                    className="input-field text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="twitter" className="label text-xs">Twitter / X</label>
                                <input
                                    id="twitter"
                                    type="text"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                    placeholder="@handle"
                                    className="input-field text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="tiktok" className="label text-xs">TikTok</label>
                                <input
                                    id="tiktok"
                                    type="text"
                                    value={tiktok}
                                    onChange={(e) => setTiktok(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                                    placeholder="@handle"
                                    className="input-field text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="facebook" className="label text-xs">Facebook</label>
                                <input
                                    id="facebook"
                                    type="text"
                                    value={facebook}
                                    onChange={(e) => setFacebook(e.target.value.replace(/[^a-zA-Z0-9.]/g, ''))}
                                    placeholder="pagename"
                                    className="input-field text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="linkedin" className="label text-xs">LinkedIn</label>
                                <input
                                    id="linkedin"
                                    type="text"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                                    placeholder="yourname or company/name"
                                    className="input-field text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="website" className="label text-xs">Website</label>
                                <input
                                    id="website"
                                    type="text"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="www.yourbusiness.com"
                                    className="input-field text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="card space-y-4">
                        <h2 className="font-medium text-ink text-sm uppercase tracking-wide">Location</h2>
                        <div>
                            <label htmlFor="address" className="label">Address</label>
                            <input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="input-field"
                                placeholder="123 Main Street, City"
                            />
                            <p className="text-xs text-ink/50 mt-1">Adds a "Get Directions" button</p>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                    {saved && (
                        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Changes saved!
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div >
        </main >
    );
}
