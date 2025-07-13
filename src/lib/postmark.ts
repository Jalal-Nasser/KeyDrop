import { ServerClient } from "postmark";

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

interface Attachment {
  filename: string;
  content: string; // This will be the raw HTML/file content
  ContentType: string; // e.g., 'text/html', 'application/pdf'
  ContentID?: string | null; // Changed to allow null explicitly
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Attachment[] }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments = attachments?.map(att => ({
    Name: att.filename,
    Content: Buffer.from(att.content).toString('base64'),
    ContentType: att.ContentType,
    ContentID: att.ContentID === undefined ? null : att.ContentID, // Convert undefined to null
  }));

  return postmarkClient.sendEmail({
    From: 'your-verified-sender@yourdomain.com', // <--- CHANGE THIS TO YOUR VERIFIED SENDER EMAIL IN POSTMARK
    To: to,
    Subject: subject,
    HtmlBody: html,
    Attachments: postmarkAttachments,
    MessageStream: "outbound" // Use 'outbound' for transactional emails
  });
}