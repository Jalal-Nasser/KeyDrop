import { ServerClient, Models } from "postmark";

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

// Define a local type that explicitly includes ContentEncoding, mirroring Postmark's expected structure
interface PostmarkAttachment {
  Name: string;
  Content: string;
  ContentType: string;
  ContentID?: string | null;
  ContentEncoding: 'base64' | 'None' | string; // Use string to be flexible with Postmark's internal types
}

interface CustomAttachment {
  Name: string;
  Content: string;
  ContentType: string;
  ContentID?: string | null;
  ContentEncoding?: 'base64' | 'None'; // Keep this as optional for our input
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Partial<CustomAttachment>[] }): Promise<any> { // Changed return type to Promise<any>
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments: Models.Attachment[] | undefined = attachments?.map((rawAtt) => {
    // Ensure all required properties are non-nullable strings by using ?? ''
    // Removed redundant 'as string' casts
    const att: CustomAttachment = {
      Name: rawAtt.Name ?? '',
      Content: rawAtt.Content ?? '',
      ContentType: rawAtt.ContentType ?? '',
      ContentID: rawAtt.ContentID,
      ContentEncoding: rawAtt.ContentEncoding ?? 'None',
    };

    let encodedContent = att.Content;
    let encodingType = att.ContentEncoding; // Allow TypeScript to infer the type here

    // If it's HTML, force base64 encoding for reliability
    if (att.ContentType === 'text/html' && encodingType === 'None') {
      encodedContent = Buffer.from(att.Content).toString('base64');
      encodingType = 'base64';
    }

    const transformedAttachment: PostmarkAttachment = { // Cast to our local PostmarkAttachment type
      Name: att.Name,
      Content: encodedContent,
      ContentType: att.ContentType,
      ContentID: att.ContentID === undefined ? null : att.ContentID,
      ContentEncoding: encodingType,
    };
    return transformedAttachment as Models.Attachment; // Cast the array to Postmark's expected Models.Attachment[]
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