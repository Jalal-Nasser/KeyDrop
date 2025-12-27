import { ServerClient } from 'postmark';

const client = new ServerClient(process.env.POSTMARK_API_TOKEN || 'placeholder_token');
const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'admin@dropskey.com';

export async function sendEmail({
    to,
    subject,
    textBody,
    htmlBody
}: {
    to: string;
    subject: string;
    textBody?: string;
    htmlBody?: string;
}) {
    if (!process.env.POSTMARK_API_TOKEN) {
        console.warn('Postmark API token not found. Email not sent:', { to, subject });
        return;
    }

    try {
        await client.sendEmail({
            "From": FROM_EMAIL,
            "To": to,
            "Subject": subject,
            "TextBody": textBody,
            "HtmlBody": htmlBody,
            "MessageStream": "outbound"
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Failed to send email via Postmark:', error);
    }
}

export async function sendOrderStatusEmail(to: string, orderId: string, status: string) {
    const subject = `Order #${orderId.slice(0, 8)} Update: ${status}`;
    const textBody = `Your order #${orderId} status has been updated to ${status}.`;
    const htmlBody = `
        <h1>Order Update</h1>
        <p>Your order <strong>#${orderId}</strong> status has been updated to:</p>
        <h2 style="color: #4F46E5;">${status}</h2>
        <p>Thank you for shopping with us!</p>
    `;

    await sendEmail({ to, subject, textBody, htmlBody });
}

export async function sendLicenseKeyEmail(to: string, productName: string, licenseKey: string) {
    const subject = `Your License Key for ${productName}`;
    const textBody = `Here is your license key for ${productName}: ${licenseKey}\n\nThank you for your purchase!`;
    const htmlBody = `
        <h1>Your License Key</h1>
        <p>Here is your product key for <strong>${productName}</strong>:</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 18px; color: #1f2937; text-align: center; border: 1px solid #e5e7eb;">
            ${licenseKey}
        </div>
        <p style="margin-top: 20px;">Thank you for shopping with us!</p>
    `;

    await sendEmail({ to, subject, textBody, htmlBody });
}
