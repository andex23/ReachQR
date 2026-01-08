/**
 * Generate a URL-safe slug from business name
 */
export function generateSlug(businessName: string): string {
    return businessName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Spaces to hyphens
        .replace(/-+/g, '-') // Multiple hyphens to single
        .substring(0, 50); // Limit length
}

/**
 * Format phone number to E.164 format
 */
export function formatE164(countryCode: string, phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

    // Remove leading zero if present
    const normalized = digits.startsWith('0') ? digits.substring(1) : digits;

    // Combine with country code (strip the + for E.164)
    const dialCode = countryCode.startsWith('+') ? countryCode.slice(1) : countryCode;
    return `${dialCode}${normalized}`;
}

/**
 * Generate WhatsApp link with pre-filled message
 */
export function generateWhatsAppLink(e164: string): string {
    const message = encodeURIComponent('Hi I found you from your QR code');
    return `https://wa.me/${e164}?text=${message}`;
}

/**
 * Generate Google Maps search link
 */
export function generateMapsLink(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
