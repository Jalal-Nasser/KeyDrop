import { ServerClient, Models } from "postmark"; // Import Models

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

interface Attachment {
  Name: string;
  Content: string;
  ContentType: string;
  ContentID?: string | null;
  ContentEncoding?: 'base64' | 'None'; // This property is crucial
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Attachment[] }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments: Models.Attachment[] | undefined = attachments?.map(att => {
    let encodedContent = att.Content;
    // Explicitly cast to Models.Attachment["ContentEncoding"] | undefined to satisfy the type system
    // and use nullish coalescing for safety.
    let encodingType: Models.Attachment["ContentEncoding"] = (att.ContentEncoding as Models.Attachment["ContentEncoding"] | undefined) ?? "None";

    // If encoding is explicitly 'base64' or if it's HTML and we want to force base64
    if (encodingType === 'base64' || att.ContentType === 'text/html') {
      // Node.js Buffer is available in Next.js server actions
      encodedContent = Buffer.from(att.Content).toString('base64');
      encodingType = 'base64';
    }

    // The target type is Models.Attachment, which *does* have ContentEncoding.
    // The error TS2353 is likely a red herring if TS2339 is the primary issue.
    // Ensuring `encodingType` is correctly typed should resolve both.
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
    From: 'admin@dropskey.com',
    To: to,
    Subject: subject,
    HtmlBody: html,
    Attachments: postmarkAttachments,
    MessageStream: "outbound"
  });
}