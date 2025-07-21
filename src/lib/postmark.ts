import { ServerClient, Models } from "postmark"; // Import Models

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

interface Attachment {
  Name: string;
  Content: string;
  ContentType: string;
  ContentID?: string | null;
  ContentEncoding?: 'base64' | 'None';
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Attachment[] }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments: Models.Attachment[] | undefined = attachments?.map(att => {
    let encodedContent = att.Content;
    // Explicitly cast 'att' to Models.Attachment to ensure 'ContentEncoding' is recognized
    let encodingType: Models.Attachment["ContentEncoding"] = (att as Models.Attachment).ContentEncoding || "None";

    // If encoding is explicitly 'base64' or if it's HTML and we want to force base64
    if (encodingType === 'base64' || att.ContentType === 'text/html') {
      // Node.js Buffer is available in Next.js server actions
      encodedContent = Buffer.from(att.Content).toString('base64');
      encodingType = 'base64';
    }

    // Explicitly cast the object literal to Models.Attachment
    const transformedAttachment: Models.Attachment = {
      Name: att.Name,
      Content: encodedContent,
      ContentType: att.ContentType,
      ContentID: att.ContentID === undefined ? null : att.ContentID,
      ContentEncoding: encodingType,
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