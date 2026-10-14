import 'server-only';
import { getServiceClient } from './supabase';
import { generateToken, hashToken } from './server-utils';
import { sendRecoveryEmail } from './email';

const RECOVERY_TTL_MS = 60 * 60 * 1000;

/**
 * Emails a one-hour recovery link for each given profile. Nothing
 * changes for the owner until they click it, so a stranger typing their
 * email can't invalidate a working edit link.
 */
export async function sendRecoveryLinks(
    email: string,
    profiles: { id: string; slug: string; business_name: string }[],
    baseUrl: string
) {
    if (profiles.length === 0) return;
    const supabase = getServiceClient();
    const expiresAt = new Date(Date.now() + RECOVERY_TTL_MS).toISOString();

    const pages = [];
    for (const profile of profiles) {
        const token = generateToken();
        const { error } = await supabase
            .from('profiles')
            .update({ recovery_token_hash: hashToken(token), recovery_expires_at: expiresAt })
            .eq('id', profile.id);
        if (error) {
            console.error('Failed to store recovery token:', error);
            continue;
        }
        pages.push({
            businessName: profile.business_name,
            recoverLink: `${baseUrl}/recover/${token}`,
            publicLink: `${baseUrl}/u/${profile.slug}`,
        });
    }

    if (pages.length > 0) await sendRecoveryEmail({ to: email, pages });
}

/**
 * Swaps a valid recovery token for a brand-new edit token.
 * Returns the raw edit token, or null if the link is invalid/expired.
 */
export async function redeemRecoveryToken(token: string): Promise<string | null> {
    if (!/^[a-f0-9]{64}$/.test(token)) return null;
    const supabase = getServiceClient();

    const recoveryHash = hashToken(token);
    const editToken = generateToken();

    // Single conditional update, so a link can only be redeemed once.
    const { data, error } = await supabase
        .from('profiles')
        .update({ edit_token_hash: hashToken(editToken), recovery_token_hash: null, recovery_expires_at: null })
        .eq('recovery_token_hash', recoveryHash)
        .gt('recovery_expires_at', new Date().toISOString())
        .select('id');

    if (error) {
        console.error('Failed to redeem recovery token:', error);
        return null;
    }
    return data && data.length > 0 ? editToken : null;
}
