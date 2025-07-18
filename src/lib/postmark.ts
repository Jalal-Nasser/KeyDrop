import { ServerClient } from "postmark";

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

interface Attachment {
  filename: string;
  content: string; // This will be the raw HTML/file content (or base64 string if encoding is 'base64')
  ContentType: string; // e.g., 'text/html', 'application/pdf'
  ContentID?: string | null;
  encoding?: string;
  // Add ContentDisposition to the interface
  ContentDisposition?: string; 
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Attachment[] }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments = attachments?.map(att => ({
    Name: att.filename,
    Content: att.content,
    ContentType: att.ContentType,
    ContentID: att.ContentID === undefined ? null : att.ContentID,
    // Set ContentDisposition to 'inline' if ContentID is present, otherwise omit or set to 'attachment'
    ContentDisposition: att.ContentID ? 'inline' : undefined, 
  }));

  return postmarkClient.sendEmail({
    From: 'admin@dropskey.com', // Using a verified sender email
    To: to,
    Subject: subject,
    HtmlBody: html,
    Attachments: postmarkAttachments,
    MessageStream: "outbound" // Use 'outbound' for transactional emails
  });
}