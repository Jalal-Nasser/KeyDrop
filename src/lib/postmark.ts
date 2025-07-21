import { ServerClient, Models } from "postmark"; // Import Models

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

interface CustomAttachment {
  Name: string;
  Content: string;
  ContentType: string;
  ContentID?: string | null;
  ContentEncoding: 'base64' | 'None'; // Made non-optional to ensure it always exists
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Partial<CustomAttachment>[] }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments: Models.Attachment[] | undefined = attachments?.map((rawAtt) => {
    // Ensure rawAtt has ContentEncoding, defaulting if necessary
    const att: CustomAttachment = {
      ...rawAtt,
      ContentEncoding: rawAtt.ContentEncoding ?? 'None' // Provide default if missing
    } as CustomAttachment; // Cast to ensure it's seen as CustomAttachment

    let encodedContent = att.Content;
    let encodingType: 'base64' | 'None' = att.ContentEncoding; // Now it's guaranteed to exist

    // If it's HTML, force base64 encoding for reliability
    if (att.ContentType === 'text/html' && encodingType === 'None') {
      encodedContent = Buffer.from(att.Content).toString('base64');
      encodingType = 'base64';
    }

    const transformedAttachment: Models.Attachment = {
      Name: att.Name,
      Content: encodedContent,
      ContentType: att.ContentType,
      ContentID: att.ContentID === undefined ? null : att.ContentID,
      ContentEncoding: encodingType as Models.Attachment["ContentEncoding"], // Explicitly cast here to resolve TS2353
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