import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEditLinkEmailParams {
    to: string;
    businessName: string;
    editLink: string;
    publicLink: string;
}

export async function sendEditLinkEmail({ to, businessName, editLink, publicLink }: SendEditLinkEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'ReachQR <onboarding@resend.dev>', // Use your verified domain in production
            to: [to],
            subject: `Your ReachQR page for ${businessName}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9F6; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #E5E5E5; padding: 40px;">
        <h1 style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #1A1A1A; margin: 0 0 8px 0;">
            Reach<span style="color: #999;">QR</span>
        </h1>
        <p style="color: #666; font-size: 14px; margin: 0 0 32px 0;">Your QR contact page is ready!</p>
        
        <div style="background: #FAF9F6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #666; font-size: 12px; text-transform: uppercase; margin: 0 0 8px 0;">Your Page</p>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 18px; color: #1A1A1A; margin: 0; font-weight: 600;">
                ${businessName}
            </p>
        </div>

        <a href="${publicLink}" style="display: block; background: #1A1A1A; color: white; text-decoration: none; padding: 16px; border-radius: 12px; text-align: center; font-weight: 500; margin-bottom: 12px;">
            View Your Public Page
        </a>

        <a href="${editLink}" style="display: block; background: white; color: #1A1A1A; text-decoration: none; padding: 16px; border-radius: 12px; text-align: center; font-weight: 500; border: 1px solid #E5E5E5;">
            Edit Your Page
        </a>

        <p style="color: #999; font-size: 12px; margin: 32px 0 0 0; text-align: center;">
            Keep this email safe - you'll need the edit link to update your page.
        </p>
    </div>
</body>
</html>
            `,
        });

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

interface SendRecoveryEmailParams {
    to: string;
    pages: Array<{ businessName: string; editLink: string; publicLink: string }>;
}

export async function sendRecoveryEmail({ to, pages }: SendRecoveryEmailParams) {
    try {
        const pagesList = pages.map(p => `
            <div style="background: #FAF9F6; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <p style="font-family: 'JetBrains Mono', monospace; font-size: 16px; color: #1A1A1A; margin: 0 0 12px 0; font-weight: 600;">
                    ${p.businessName}
                </p>
                <a href="${p.editLink}" style="color: #1A1A1A; font-size: 14px;">Edit this page →</a>
            </div>
        `).join('');

        const { data, error } = await resend.emails.send({
            from: 'ReachQR <onboarding@resend.dev>',
            to: [to],
            subject: 'Your ReachQR Edit Links',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9F6; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #E5E5E5; padding: 40px;">
        <h1 style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #1A1A1A; margin: 0 0 8px 0;">
            Reach<span style="color: #999;">QR</span>
        </h1>
        <p style="color: #666; font-size: 14px; margin: 0 0 32px 0;">Here are your edit links</p>
        
        ${pagesList}

        <p style="color: #999; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
            Keep this email safe - you'll need these links to update your pages.
        </p>
    </div>
</body>
</html>
            `,
        });

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

interface SendProfileNotificationParams {
    to: string;
    businessName: string;
    slug: string;
    baseUrl: string;
}

export async function sendProfileNotification({ to, businessName, slug, baseUrl }: SendProfileNotificationParams) {
    try {
        const publicLink = `${baseUrl}/u/${slug}`;
        const recoverLink = `${baseUrl}/recover`;

        const { data, error } = await resend.emails.send({
            from: 'ReachQR <onboarding@resend.dev>',
            to: [to],
            subject: `📱 Your ReachQR Page is Ready!`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9F6; margin: 0; padding: 40px 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #E5E5E5; padding: 40px;">
        <h1 style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #1A1A1A; margin: 0 0 8px 0;">
            Reach<span style="color: #999;">QR</span>
        </h1>
        <p style="color: #666; font-size: 14px; margin: 0 0 32px 0;">Your QR contact page is live! 🎉</p>
        
        <div style="background: #FAF9F6; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <p style="color: #666; font-size: 12px; text-transform: uppercase; margin: 0 0 8px 0;">Your Business</p>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 20px; color: #1A1A1A; margin: 0; font-weight: 600;">
                ${businessName}
            </p>
        </div>

        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #0369a1; font-size: 13px; margin: 0; font-weight: 500;">
                📋 Your Public Link
            </p>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #0c4a6e; margin: 8px 0 0 0; word-break: break-all;">
                ${publicLink}
            </p>
        </div>

        <a href="${publicLink}" style="display: block; background: #1A1A1A; color: white; text-decoration: none; padding: 16px; border-radius: 12px; text-align: center; font-weight: 500; margin-bottom: 12px;">
            View Your Page
        </a>

        <a href="${recoverLink}" style="display: block; background: white; color: #1A1A1A; text-decoration: none; padding: 16px; border-radius: 12px; text-align: center; font-weight: 500; border: 1px solid #E5E5E5;">
            Recover Your Edit Link
        </a>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E5E5;">
            <p style="color: #666; font-size: 13px; margin: 0 0 16px 0; font-weight: 500;">
                What can you do?
            </p>
            <ul style="color: #666; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Share your link with customers</li>
                <li>Print your QR code on business cards</li>
                <li>Add it to your social media bio</li>
            </ul>
        </div>

        <p style="color: #999; font-size: 11px; margin: 32px 0 0 0; text-align: center;">
            © ${new Date().getFullYear()} AVD Studios. Made with ❤️
        </p>
    </div>
</body>
</html>
            `,
        });

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
