import { describe, expect, it } from 'vitest';
import {
    cleanHandle,
    emptyFormValues,
    formToCard,
    generateSlug,
    isValidSlug,
    normalizeProfileInput,
    normalizeWebsite,
    ProfileRow,
    rowToCard,
    rowToFormValues,
} from '../profile';
import { formatE164, getCountryByCode, parseE164 } from '../countries';
import { buildVCard } from '../vcard';

const NG = getCountryByCode('NG')!;

function validInput(overrides: Record<string, unknown> = {}) {
    return { ...emptyFormValues(), businessName: 'Acme', email: 'Hi@Acme.com ', ...overrides };
}

describe('slugs', () => {
    it('generates clean slugs', () => {
        expect(generateSlug('Mama Tee’s Kitchen!')).toBe('mama-tees-kitchen');
        expect(generateSlug('  Café  Déjà Vu  ')).toBe('cafe-deja-vu');
        expect(generateSlug('Salt & Pepper')).toBe('salt-and-pepper');
        expect(generateSlug('---')).toBe('');
    });

    it('validates slugs', () => {
        expect(isValidSlug('ab')).toBe(true);
        expect(isValidSlug('old_style_slug')).toBe(true);
        expect(isValidSlug('a')).toBe(false);
        expect(isValidSlug('-abc')).toBe(false);
        expect(isValidSlug('ABC')).toBe(false);
        expect(isValidSlug('a/b')).toBe(false);
    });
});

describe('phone numbers', () => {
    it('formats local numbers to E.164 digits', () => {
        expect(formatE164(NG, '0801 234 5678')).toBe('2348012345678');
        expect(formatE164(NG, '+44 7700 900123')).toBe('447700900123');
        expect(formatE164(NG, '')).toBe('');
    });

    it('round-trips through parseE164 with the longest dial code', () => {
        expect(parseE164('2348012345678')).toEqual({ country: NG, number: '8012345678' });
        expect(parseE164('2335551234').country.code).toBe('GH');
        expect(parseE164('15551234567').country.code).toBe('US');
        expect(parseE164(null).number).toBe('');
    });
});

describe('social handles', () => {
    it('accepts handles, @handles and pasted URLs', () => {
        expect(cleanHandle('instagram', '@acme.co')).toBe('acme.co');
        expect(cleanHandle('instagram', 'https://www.instagram.com/acme.co/?hl=en')).toBe('acme.co');
        expect(cleanHandle('tiktok', 'https://tiktok.com/@acme')).toBe('acme');
        expect(cleanHandle('twitter', 'https://twitter.com/acme')).toBe('acme');
        expect(cleanHandle('linkedin', 'https://linkedin.com/in/jane-doe')).toBe('jane-doe');
        expect(cleanHandle('linkedin', 'https://linkedin.com/company/acme')).toBe('company/acme');
        expect(cleanHandle('telegram', 't.me/acme_bot')).toBe('acme_bot');
        expect(cleanHandle('instagram', 'bad handle!<script>')).toBe('badhandlescript');
    });
});

describe('website', () => {
    it('normalises and rejects junk', () => {
        expect(normalizeWebsite('acme.com')).toBe('https://acme.com');
        expect(normalizeWebsite('http://acme.com/shop/')).toBe('http://acme.com/shop');
        expect(normalizeWebsite('javascript:alert(1)')).toBeNull();
        expect(normalizeWebsite('localhost')).toBeNull();
        expect(normalizeWebsite('')).toBeNull();
    });
});

describe('normalizeProfileInput', () => {
    it('requires a name and a valid email', () => {
        expect(normalizeProfileInput({}).ok).toBe(false);
        expect(normalizeProfileInput(validInput({ email: 'nope' })).ok).toBe(false);
        expect(normalizeProfileInput(null).ok).toBe(false);
    });

    it('produces database columns', () => {
        const result = normalizeProfileInput(
            validInput({
                whatsappNumber: '0801 234 5678',
                website: 'acme.com',
                theme: 'midnight',
                socials: { instagram: '@acme', youtube: '' },
            })
        );
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.email).toBe('hi@acme.com');
        expect(result.value.whatsapp_e164).toBe('2348012345678');
        expect(result.value.website_url).toBe('https://acme.com');
        expect(result.value.instagram_url).toBe('https://instagram.com/acme');
        expect(result.value.youtube_url).toBeNull();
        expect(result.value.theme).toBe('midnight');
        expect(result.value).not.toHaveProperty('slug');
        expect(result.value).not.toHaveProperty('edit_token_hash');
    });

    it('makes WhatsApp optional but validates it when given', () => {
        const none = normalizeProfileInput(validInput());
        expect(none.ok && none.value.whatsapp_e164).toBeNull();
        expect(normalizeProfileInput(validInput({ whatsappNumber: '12' })).ok).toBe(false);
    });

    it('falls back to the default theme and rejects bad logo URLs', () => {
        const r = normalizeProfileInput(validInput({ theme: 'nope' }));
        expect(r.ok && r.value.theme).toBe('classic');
        expect(normalizeProfileInput(validInput({ logoUrl: 'javascript:alert(1)' })).ok).toBe(false);
    });
});

const ROW: ProfileRow = {
    id: '1',
    slug: 'acme',
    business_name: 'Acme; Co',
    tagline: 'We make, things',
    logo_url: null,
    theme: null,
    email: 'hi@acme.com',
    show_email: false,
    whatsapp_e164: '2348012345678',
    whatsapp_message: null,
    phone: '0801 234 5678',
    address: null,
    website_url: 'https://acme.com',
    instagram_url: 'https://instagram.com/acme',
    twitter_url: null,
    tiktok_url: null,
    facebook_url: null,
    linkedin_url: 'https://linkedin.com/in/jane',
    youtube_url: null,
    telegram_url: null,
    views: 3,
    created_at: '',
    updated_at: '',
};

describe('row conversions', () => {
    it('row -> form values -> row is stable', () => {
        const values = rowToFormValues(ROW);
        expect(values.whatsappCountry).toBe('NG');
        expect(values.whatsappNumber).toBe('8012345678');
        expect(values.socials.instagram).toBe('acme');
        expect(values.socials.linkedin).toBe('jane');
        expect(values.website).toBe('acme.com');
        expect(values.theme).toBe('classic');

        const back = normalizeProfileInput(values);
        expect(back.ok).toBe(true);
        if (!back.ok) return;
        expect(back.value.whatsapp_e164).toBe(ROW.whatsapp_e164);
        expect(back.value.instagram_url).toBe(ROW.instagram_url);
        expect(back.value.linkedin_url).toBe(ROW.linkedin_url);
        expect(back.value.website_url).toBe(ROW.website_url);
        expect(back.value.show_email).toBe(false);
    });

    it('hides the email when show_email is off', () => {
        expect(rowToCard(ROW).email).toBeNull();
        expect(rowToCard({ ...ROW, show_email: null }).email).toBe('hi@acme.com');
    });

    it('builds a preview card from form values', () => {
        const card = formToCard({ ...emptyFormValues(), businessName: '', whatsappNumber: '8012345678' });
        expect(card.businessName).toBe('Your business');
        expect(card.whatsappUrl).toContain('https://wa.me/2348012345678?text=');
    });
});

describe('vcard', () => {
    it('escapes values and respects show_email', () => {
        const v = buildVCard(ROW, 'https://x.test/u/acme');
        expect(v).toContain('FN:Acme\\; Co');
        expect(v).toContain('TITLE:We make\\, things');
        expect(v).toContain('TEL;TYPE=CELL:+2348012345678');
        expect(v).not.toContain('EMAIL');
        expect(v.startsWith('BEGIN:VCARD\r\n')).toBe(true);
    });
});
