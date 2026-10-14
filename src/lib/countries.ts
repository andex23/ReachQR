export interface Country {
    name: string;
    code: string;
    dialCode: string;
    flag: string;
}

// Nigeria first: it's the default and the largest group of existing users.
export const countries: Country[] = [
    { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
    { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
    { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭' },
    { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
    { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
    { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
    { name: 'Cameroon', code: 'CM', dialCode: '+237', flag: '🇨🇲' },
    { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬' },
    { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: '🇹🇿' },
    { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼' },
    { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹' },
    { name: 'Senegal', code: 'SN', dialCode: '+221', flag: '🇸🇳' },
    { name: "Côte d'Ivoire", code: 'CI', dialCode: '+225', flag: '🇨🇮' },
    { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
    { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
    { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
    { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
    { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
    { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
    { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
    { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
    { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
    { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
    { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
    { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
    { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
    { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
    { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
    { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
    { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
    { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
    { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
    { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
    { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
    { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
    { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
    { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
    { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
    { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
];

export function getCountryByCode(code: string): Country | undefined {
    return countries.find((c) => c.code === code);
}

export function getDefaultCountry(): Country {
    return countries[0];
}

/**
 * Turn a country + local number into E.164 digits (no leading "+"),
 * which is the format wa.me expects. A number typed with a leading "+"
 * is treated as already international and the country is ignored.
 */
export function formatE164(country: Country, phoneNumber: string): string {
    const trimmed = phoneNumber.trim();
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return '';
    if (trimmed.startsWith('+')) return digits;

    // Drop the national trunk prefix ("0801..." -> "801...")
    const local = digits.replace(/^0+/, '');
    return `${country.dialCode.slice(1)}${local}`;
}

/**
 * Split stored E.164 digits back into a country and local number.
 * Picks the longest matching dial code; ties go to the earlier country.
 */
export function parseE164(e164: string | null | undefined): { country: Country; number: string } {
    const digits = (e164 || '').replace(/\D/g, '');
    if (!digits) return { country: getDefaultCountry(), number: '' };

    let best: Country | undefined;
    for (const c of countries) {
        const dial = c.dialCode.slice(1);
        if (digits.startsWith(dial) && (!best || dial.length > best.dialCode.length - 1)) {
            best = c;
        }
    }

    if (!best) return { country: getDefaultCountry(), number: `+${digits}` };
    return { country: best, number: digits.slice(best.dialCode.length - 1) };
}
