import { ServerClient, Models } from "postmark"; // Import Models

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

interface Attachment {
  Name: string; // Renamed from filename
  Content: string; // Renamed from content
  ContentType: string;
  ContentID?: string | null;
  Encoding?: 'base64' | 'None'; // Renamed from encoding, matching Models.Attachment
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Attachment[] }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments: Models.Attachment[] | undefined = attachments?.map(att => {
    let encodedContent = att.Content; // Use att.Content
    // Explicitly assert that att.Encoding exists and is of the correct type
    let encodingType: Models.Attachment["Encoding"] = (att.Encoding as Models.Attachment["Encoding"]) || "None";

    // If encoding is explicitly 'base64' or if it's HTML and we want to force base64
    if (encodingType === 'base64' || att.ContentType === 'text/html') {
      // Node.js Buffer is available in Next.js server actions
      encodedContent = Buffer.from(att.Content).toString('base64');
      encodingType = 'base64';
    }

    const transformedAttachment: Models.Attachment = {
      Name: att.Name,
      Content: encodedContent,
      ContentType: att.ContentType,
      ContentID: att.ContentID === undefined ? null : att.ContentID,
      // Explicitly assert that Encoding property exists on Models.Attachment
      Encoding: encodingType as Models.Attachment["Encoding"],
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