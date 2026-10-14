import { ProfileRow, SOCIALS } from './profile';

function escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

/** vCard 3.0, which iOS and Android contacts both import. */
export function buildVCard(profile: ProfileRow, pageUrl: string): string {
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${escape(profile.business_name)}`,
        `ORG:${escape(profile.business_name)}`,
    ];

    if (profile.tagline) lines.push(`TITLE:${escape(profile.tagline)}`);
    if (profile.whatsapp_e164) lines.push(`TEL;TYPE=CELL:+${profile.whatsapp_e164}`);
    if (profile.phone) lines.push(`TEL;TYPE=WORK,VOICE:${escape(profile.phone)}`);
    if (profile.email && profile.show_email !== false) lines.push(`EMAIL;TYPE=INTERNET:${escape(profile.email)}`);
    if (profile.address) lines.push(`ADR;TYPE=WORK:;;${escape(profile.address)};;;;`);
    if (profile.website_url) lines.push(`URL:${escape(profile.website_url)}`);
    lines.push(`URL:${escape(pageUrl)}`);

    for (const s of SOCIALS) {
        const url = profile[s.column as keyof ProfileRow];
        if (typeof url === 'string' && url) lines.push(`X-SOCIALPROFILE;TYPE=${s.key}:${escape(url)}`);
    }

    if (profile.logo_url) lines.push(`PHOTO;VALUE=URI:${profile.logo_url}`);
    lines.push('END:VCARD');

    return lines.join('\r\n') + '\r\n';
}
