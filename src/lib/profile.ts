/**
 * The profile model, shared by the browser and the server:
 * form values <-> database rows <-> what the public card shows.
 * Keep this file free of Node-only imports.
 */
import { formatE164, getCountryByCode, getDefaultCountry, parseE164 } from './countries';
import { DEFAULT_THEME_ID, isThemeId } from './themes';

// ---------------------------------------------------------------------------
// Social links
// ---------------------------------------------------------------------------

export type SocialKey =
    | 'instagram'
    | 'tiktok'
    | 'twitter'
    | 'facebook'
    | 'linkedin'
    | 'youtube'
    | 'telegram';

interface SocialDef {
    key: SocialKey;
    column: `${string}_url`;
    label: string;
    placeholder: string;
    /** Characters allowed in a handle */
    invalidChars: RegExp;
    /** Pulls the handle out of a pasted URL */
    urlPattern: RegExp;
    toUrl: (handle: string) => string;
}

export const SOCIALS: SocialDef[] = [
    {
        key: 'instagram',
        column: 'instagram_url',
        label: 'Instagram',
        placeholder: 'yourhandle',
        invalidChars: /[^a-zA-Z0-9._]/g,
        urlPattern: /instagram\.com\/([^/?#]+)/i,
        toUrl: (h) => `https://instagram.com/${h}`,
    },
    {
        key: 'tiktok',
        column: 'tiktok_url',
        label: 'TikTok',
        placeholder: 'yourhandle',
        invalidChars: /[^a-zA-Z0-9._]/g,
        urlPattern: /tiktok\.com\/@?([^/?#]+)/i,
        toUrl: (h) => `https://tiktok.com/@${h}`,
    },
    {
        key: 'twitter',
        column: 'twitter_url',
        label: 'X (Twitter)',
        placeholder: 'yourhandle',
        invalidChars: /[^a-zA-Z0-9_]/g,
        urlPattern: /(?:twitter|x)\.com\/([^/?#]+)/i,
        toUrl: (h) => `https://x.com/${h}`,
    },
    {
        key: 'facebook',
        column: 'facebook_url',
        label: 'Facebook',
        placeholder: 'yourpage',
        invalidChars: /[^a-zA-Z0-9.-]/g,
        urlPattern: /facebook\.com\/([^/?#]+)/i,
        toUrl: (h) => `https://facebook.com/${h}`,
    },
    {
        key: 'linkedin',
        column: 'linkedin_url',
        label: 'LinkedIn',
        placeholder: 'yourname or company/name',
        invalidChars: /[^a-zA-Z0-9_/-]/g,
        urlPattern: /linkedin\.com\/((?:in|company)\/[^/?#]+)/i,
        toUrl: (h) => (h.startsWith('company/') ? `https://linkedin.com/${h}` : `https://linkedin.com/in/${h}`),
    },
    {
        key: 'youtube',
        column: 'youtube_url',
        label: 'YouTube',
        placeholder: 'yourchannel',
        invalidChars: /[^a-zA-Z0-9._-]/g,
        urlPattern: /youtube\.com\/@?([^/?#]+)/i,
        toUrl: (h) => `https://youtube.com/@${h}`,
    },
    {
        key: 'telegram',
        column: 'telegram_url',
        label: 'Telegram',
        placeholder: 'yourhandle',
        invalidChars: /[^a-zA-Z0-9_]/g,
        urlPattern: /t\.me\/([^/?#]+)/i,
        toUrl: (h) => `https://t.me/${h}`,
    },
];

/** Accepts "@handle", "handle" or a pasted profile URL and returns a clean handle. */
export function cleanHandle(key: SocialKey, input: string | null | undefined): string {
    const def = SOCIALS.find((s) => s.key === key)!;
    let value = (input || '').trim();
    const fromUrl = value.match(def.urlPattern);
    if (fromUrl) {
        try {
            value = decodeURIComponent(fromUrl[1]);
        } catch {
            value = fromUrl[1];
        }
    }
    if (key === 'linkedin') value = value.replace(/^in\//i, '');
    value = value.replace(/^@/, '').replace(def.invalidChars, '');
    return value.replace(/^\/+|\/+$/g, '').slice(0, 100);
}

export function handleFromUrl(key: SocialKey, url: string | null | undefined): string {
    if (!url) return '';
    return cleanHandle(key, url);
}

// ---------------------------------------------------------------------------
// Slugs
// ---------------------------------------------------------------------------

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]{1,49}$/;

export function generateSlug(businessName: string): string {
    return businessName
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50)
        .replace(/-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
    return SLUG_PATTERN.test(slug);
}

// ---------------------------------------------------------------------------
// Form values (what the create/edit UI works with)
// ---------------------------------------------------------------------------

export interface ProfileFormValues {
    slug: string;
    businessName: string;
    tagline: string;
    logoUrl: string;
    theme: string;
    email: string;
    showEmail: boolean;
    whatsappCountry: string;
    whatsappNumber: string;
    whatsappMessage: string;
    phone: string;
    website: string;
    address: string;
    socials: Record<SocialKey, string>;
}

export const LIMITS = {
    businessName: 80,
    tagline: 80,
    whatsappMessage: 200,
    address: 200,
    website: 300,
    email: 254,
    phone: 30,
};

export const DEFAULT_WHATSAPP_MESSAGE = 'Hi! I found you through your QR code.';

export function emptySocials(): Record<SocialKey, string> {
    return Object.fromEntries(SOCIALS.map((s) => [s.key, ''])) as Record<SocialKey, string>;
}

export function emptyFormValues(): ProfileFormValues {
    return {
        slug: '',
        businessName: '',
        tagline: '',
        logoUrl: '',
        theme: DEFAULT_THEME_ID,
        email: '',
        showEmail: true,
        whatsappCountry: getDefaultCountry().code,
        whatsappNumber: '',
        whatsappMessage: '',
        phone: '',
        website: '',
        address: '',
        socials: emptySocials(),
    };
}

// ---------------------------------------------------------------------------
// Database rows
// ---------------------------------------------------------------------------

export interface ProfileRow {
    id: string;
    slug: string;
    business_name: string;
    tagline: string | null;
    logo_url: string | null;
    theme: string | null;
    email: string;
    show_email: boolean | null;
    whatsapp_e164: string | null;
    whatsapp_message: string | null;
    phone: string | null;
    address: string | null;
    website_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    tiktok_url: string | null;
    facebook_url: string | null;
    linkedin_url: string | null;
    youtube_url: string | null;
    telegram_url: string | null;
    views: number | null;
    created_at: string;
    updated_at: string;
}

/** Every column except the token hashes. Use this instead of select('*'). */
export const PROFILE_COLUMNS = [
    'id',
    'slug',
    'business_name',
    'tagline',
    'logo_url',
    'theme',
    'email',
    'show_email',
    'whatsapp_e164',
    'whatsapp_message',
    'phone',
    'address',
    'website_url',
    ...SOCIALS.map((s) => s.column),
    'views',
    'created_at',
    'updated_at',
].join(', ');

export type ProfileWrite = Omit<ProfileRow, 'id' | 'slug' | 'views' | 'created_at' | 'updated_at'>;

export function rowToFormValues(row: ProfileRow): ProfileFormValues {
    const { country, number } = parseE164(row.whatsapp_e164);
    const socials = emptySocials();
    for (const s of SOCIALS) {
        socials[s.key] = handleFromUrl(s.key, row[s.column as keyof ProfileRow] as string | null);
    }
    return {
        slug: row.slug,
        businessName: row.business_name,
        tagline: row.tagline || '',
        logoUrl: row.logo_url || '',
        theme: isThemeId(row.theme) ? row.theme : DEFAULT_THEME_ID,
        email: row.email || '',
        showEmail: row.show_email !== false,
        whatsappCountry: country.code,
        whatsappNumber: number,
        whatsappMessage: row.whatsapp_message || '',
        phone: row.phone || '',
        website: (row.website_url || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
        address: row.address || '',
        socials,
    };
}

// ---------------------------------------------------------------------------
// Validation + normalisation (runs on the server for every write)
// ---------------------------------------------------------------------------

type Result<T> = { ok: true; value: T } | { ok: false; error: string; field?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number): string {
    return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export function normalizeWebsite(input: string): string | null {
    const raw = input.trim();
    if (!raw) return null;
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
        const url = new URL(withScheme);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
        if (!url.hostname.includes('.')) return null;
        return url.toString().replace(/\/$/, '');
    } catch {
        return null;
    }
}

export function normalizePhone(input: string): string {
    return input.replace(/[^\d+()\-\s]/g, '').replace(/\s+/g, ' ').trim().slice(0, LIMITS.phone);
}

/**
 * Validate untrusted input (a JSON body shaped like ProfileFormValues)
 * and turn it into the columns we write.
 */
export function normalizeProfileInput(input: unknown): Result<ProfileWrite> {
    const body = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

    const businessName = str(body.businessName, LIMITS.businessName);
    if (!businessName) return { ok: false, error: 'Please enter your business name', field: 'businessName' };

    const email = str(body.email, LIMITS.email).toLowerCase();
    if (!email) return { ok: false, error: 'Please enter your email', field: 'email' };
    if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'That email doesn’t look right', field: 'email' };

    const country = getCountryByCode(str(body.whatsappCountry, 4)) || getDefaultCountry();
    const whatsappNumber = str(body.whatsappNumber, 30);
    let whatsapp: string | null = null;
    if (whatsappNumber) {
        whatsapp = formatE164(country, whatsappNumber);
        if (whatsapp.length < 8 || whatsapp.length > 15) {
            return { ok: false, error: 'That WhatsApp number doesn’t look right', field: 'whatsappNumber' };
        }
    }

    const websiteInput = str(body.website, LIMITS.website);
    const website = normalizeWebsite(websiteInput);
    if (websiteInput && !website) return { ok: false, error: 'That website address doesn’t look right', field: 'website' };

    const logoInput = str(body.logoUrl, 500);
    let logo: string | null = null;
    if (logoInput) {
        try {
            const url = new URL(logoInput);
            if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error();
            logo = url.toString();
        } catch {
            return { ok: false, error: 'Logo upload failed, please try again', field: 'logoUrl' };
        }
    }

    const socialsInput = (body.socials && typeof body.socials === 'object' ? body.socials : {}) as Record<string, unknown>;
    const socialColumns = Object.fromEntries(
        SOCIALS.map((s) => {
            const handle = cleanHandle(s.key, typeof socialsInput[s.key] === 'string' ? (socialsInput[s.key] as string) : '');
            return [s.column, handle ? s.toUrl(handle) : null];
        })
    ) as Pick<ProfileWrite, 'instagram_url' | 'twitter_url' | 'tiktok_url' | 'facebook_url' | 'linkedin_url' | 'youtube_url' | 'telegram_url'>;

    return {
        ok: true,
        value: {
            business_name: businessName,
            tagline: str(body.tagline, LIMITS.tagline) || null,
            logo_url: logo,
            theme: isThemeId(body.theme) ? body.theme : DEFAULT_THEME_ID,
            email,
            show_email: body.showEmail !== false,
            whatsapp_e164: whatsapp,
            whatsapp_message: str(body.whatsappMessage, LIMITS.whatsappMessage) || null,
            phone: normalizePhone(str(body.phone, 60)) || null,
            address: str(body.address, LIMITS.address) || null,
            website_url: website,
            ...socialColumns,
        },
    };
}

// ---------------------------------------------------------------------------
// What the public card renders
// ---------------------------------------------------------------------------

export interface CardData {
    slug: string;
    businessName: string;
    tagline: string | null;
    logoUrl: string | null;
    theme: string;
    whatsappUrl: string | null;
    phone: string | null;
    email: string | null;
    mapsUrl: string | null;
    address: string | null;
    website: string | null;
    socials: { key: SocialKey; label: string; url: string }[];
}

export function whatsappLink(e164: string, message?: string | null): string {
    const text = encodeURIComponent((message || DEFAULT_WHATSAPP_MESSAGE).trim());
    return `https://wa.me/${e164}?text=${text}`;
}

export function mapsLink(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function telLink(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function socialList(urls: Partial<Record<SocialKey, string | null>>): CardData['socials'] {
    return SOCIALS.flatMap((s) => {
        const url = urls[s.key];
        return url ? [{ key: s.key, label: s.label, url }] : [];
    });
}

export function rowToCard(row: ProfileRow): CardData {
    return {
        slug: row.slug,
        businessName: row.business_name,
        tagline: row.tagline,
        logoUrl: row.logo_url,
        theme: isThemeId(row.theme) ? row.theme : DEFAULT_THEME_ID,
        whatsappUrl: row.whatsapp_e164 ? whatsappLink(row.whatsapp_e164, row.whatsapp_message) : null,
        phone: row.phone,
        email: row.show_email === false ? null : row.email,
        mapsUrl: row.address ? mapsLink(row.address) : null,
        address: row.address,
        website: row.website_url,
        socials: socialList(Object.fromEntries(SOCIALS.map((s) => [s.key, row[s.column as keyof ProfileRow] as string | null]))),
    };
}

/** Live preview while someone is filling in the form. */
export function formToCard(values: ProfileFormValues): CardData {
    const country = getCountryByCode(values.whatsappCountry) || getDefaultCountry();
    const e164 = values.whatsappNumber ? formatE164(country, values.whatsappNumber) : '';
    return {
        slug: values.slug,
        businessName: values.businessName.trim() || 'Your business',
        tagline: values.tagline.trim() || null,
        logoUrl: values.logoUrl || null,
        theme: values.theme,
        whatsappUrl: e164 ? whatsappLink(e164, values.whatsappMessage) : null,
        phone: values.phone.trim() || null,
        email: values.showEmail && values.email.trim() ? values.email.trim() : null,
        mapsUrl: values.address.trim() ? mapsLink(values.address) : null,
        address: values.address.trim() || null,
        website: normalizeWebsite(values.website),
        socials: socialList(
            Object.fromEntries(
                SOCIALS.map((s) => {
                    const handle = cleanHandle(s.key, values.socials[s.key]);
                    return [s.key, handle ? s.toUrl(handle) : null];
                })
            )
        ),
    };
}

export function displayUrl(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}
