import { ServerClient, Models } from "postmark"; // Import Models

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

interface Attachment {
  filename: string;
  content: string; // This will be the raw HTML/file content (or base64 string if encoding is 'base64')
  ContentType: string; // e.g., 'text/html', 'application/pdf'
  ContentID?: string | null; // Allow string or null
  encoding?: string;
  // ContentDisposition is removed from this interface as it's not recognized by Models.Attachment in user's environment
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Attachment[] }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments: Models.Attachment[] | undefined = attachments?.map(att => {
    // Transform our Attachment to Postmark's Models.Attachment
    const transformedAttachment: Models.Attachment = {
      Name: att.filename, // Map filename to Name
      Content: att.content,
      ContentType: att.ContentType,
      // Corrected: Convert undefined to null for ContentID
      ContentID: att.ContentID === undefined ? null : att.ContentID,
      // ContentDisposition property is removed here because the compiler indicates it does not exist in Models.Attachment
      // This might mean the Postmark library version or its type definitions in your environment are older
      // and do not include this property. The email client will rely on ContentID for inline display.
    };
    return transformedAttachment;
  });

  return postmarkClient.sendEmail({
    From: 'admin@dropskey.com', // Using a verified sender email
    To: to,
    Subject: subject,
    HtmlBody: html,
    Attachments: postmarkAttachments,
    MessageStream: "outbound" // Use 'outbound' for transactional emails
  });
}