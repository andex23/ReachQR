import 'server-only';
import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend | null {
    if (!process.env.RESEND_API_KEY) return null;
    if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
    return resend;
}

function fromAddress(): string {
    return process.env.EMAIL_FROM || 'ReachQR <onboarding@resend.dev>';
}

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

type SendResult = { success: true; id?: string } | { success: false; error: unknown };

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const C = { paper: '#F6F4EF', ink: '#141414', muted: '#6B6B6B', line: '#E4E1D8', accent: '#D4F25A' };

function layout(title: string, body: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:32px 16px;background:${C.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.ink};">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:2px solid ${C.ink};border-radius:20px;padding:32px;">
    <p style="margin:0 0 24px 0;font-size:20px;font-weight:800;letter-spacing:-0.02em;">
      Reach<span style="background:${C.accent};padding:0 6px;border-radius:6px;margin-left:2px;">QR</span>
    </p>
    ${body}
  </div>
  <p style="max-width:480px;margin:16px auto 0;text-align:center;font-size:11px;color:${C.muted};">
    You're receiving this because a ReachQR page was created with this email.
  </p>
</body>
</html>`;
}

function button(href: string, label: string, primary = true): string {
    const style = primary
        ? `background:${C.ink};color:#ffffff;border:2px solid ${C.ink};`
        : `background:#ffffff;color:${C.ink};border:2px solid ${C.ink};`;
    return `<a href="${escapeHtml(href)}" style="display:block;${style}text-decoration:none;padding:14px 16px;border-radius:12px;text-align:center;font-weight:600;font-size:15px;margin:0 0 10px 0;">${escapeHtml(label)}</a>`;
}

function pill(label: string, value: string): string {
    return `<div style="background:${C.paper};border-radius:12px;padding:16px;margin:0 0 20px 0;">
      <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">${escapeHtml(label)}</p>
      <p style="margin:0;font-size:17px;font-weight:700;word-break:break-word;">${escapeHtml(value)}</p>
    </div>`;
}

async function send(to: string, subject: string, html: string): Promise<SendResult> {
    const client = getResend();
    if (!client) {
        console.warn(`RESEND_API_KEY not set — skipped email "${subject}" to ${to}`);
        return { success: false, error: 'Email not configured' };
    }
    try {
        const { data, error } = await client.emails.send({ from: fromAddress(), to: [to], subject, html });
        if (error) {
            console.error('Resend error:', error);
            return { success: false, error };
        }
        return { success: true, id: data?.id };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error };
    }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function sendWelcomeEmail(p: { to: string; businessName: string; editLink: string; publicLink: string }) {
    const html = layout(
        'Your ReachQR page is live',
        `<h1 style="margin:0 0 8px 0;font-size:24px;letter-spacing:-0.02em;">You're live.</h1>
         <p style="margin:0 0 24px 0;color:${C.muted};font-size:15px;line-height:1.5;">Your contact page and QR code are ready to share.</p>
         ${pill('Your page', p.businessName)}
         ${button(p.publicLink, 'View your page')}
         ${button(p.editLink, 'Edit your page', false)}
         <p style="margin:20px 0 0 0;font-size:13px;color:${C.muted};line-height:1.5;">Keep this email. The edit button is your private key to update your page. Lost it? You can always request a new one at ReachQR.</p>`
    );
    return send(p.to, `Your ReachQR page for ${p.businessName}`, html);
}

export function sendRecoveryEmail(p: {
    to: string;
    pages: { businessName: string; recoverLink: string; publicLink: string }[];
}) {
    const items = p.pages
        .map(
            (page) => `<div style="border:1px solid ${C.line};border-radius:12px;padding:16px;margin:0 0 12px 0;">
              <p style="margin:0 0 12px 0;font-size:16px;font-weight:700;">${escapeHtml(page.businessName)}</p>
              ${button(page.recoverLink, 'Get my edit link')}
            </div>`
        )
        .join('');

    const html = layout(
        'Get back into your ReachQR page',
        `<h1 style="margin:0 0 8px 0;font-size:22px;letter-spacing:-0.02em;">Get back into your page</h1>
         <p style="margin:0 0 24px 0;color:${C.muted};font-size:15px;line-height:1.5;">Tap below to get a fresh edit link. This button works for 1 hour.</p>
         ${items}
         <p style="margin:20px 0 0 0;font-size:13px;color:${C.muted};line-height:1.5;">Didn't ask for this? You can ignore it. Your current edit link keeps working.</p>`
    );
    return send(p.to, 'Your ReachQR edit link', html);
}

function announcementHtml(p: { businessName: string; publicLink: string; recoverLink: string }) {
    return layout(
        'Your ReachQR page just got an upgrade',
        `<h1 style="margin:0 0 8px 0;font-size:22px;letter-spacing:-0.02em;">Your page just got an upgrade</h1>
         <p style="margin:0 0 24px 0;color:${C.muted};font-size:15px;line-height:1.5;">New themes, more social links, a custom WhatsApp greeting and a “Save contact” button are now available for your page.</p>
         ${pill('Your page', p.businessName)}
         ${button(p.publicLink, 'View your page')}
         ${button(p.recoverLink, 'Get my edit link', false)}`
    );
}

/** Sends in batches of 100 using Resend's batch API. */
export async function sendAnnouncementToAll(
    recipients: { email: string; businessName: string; slug: string }[],
    baseUrl: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
    const client = getResend();
    if (!client) return { sent: 0, failed: recipients.length, errors: ['RESEND_API_KEY is not set'] };

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += 100) {
        const chunk = recipients.slice(i, i + 100);
        try {
            const { error } = await client.batch.send(
                chunk.map((r) => ({
                    from: fromAddress(),
                    to: [r.email],
                    subject: '📱 Your ReachQR page just got an upgrade',
                    html: announcementHtml({
                        businessName: r.businessName,
                        publicLink: `${baseUrl}/u/${r.slug}`,
                        recoverLink: `${baseUrl}/recover`,
                    }),
                }))
            );
            if (error) {
                failed += chunk.length;
                errors.push(JSON.stringify(error));
            } else {
                sent += chunk.length;
            }
        } catch (err) {
            failed += chunk.length;
            errors.push(String(err));
        }
    }

    return { sent, failed, errors: errors.slice(0, 5) };
}
