import { ServerClient, type Attachment } from "postmark";

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

// Define a local type that explicitly includes ContentEncoding, mirroring Postmark's expected structure
interface PostmarkAttachment extends Attachment {
  ContentEncoding: 'base64' | 'None' | string;
}

export async function sendMail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Partial<Attachment>[] }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  const postmarkAttachments: Attachment[] | undefined = attachments?.map((rawAtt) => {
    const att: Attachment = {
      Name: rawAtt.Name ?? '',
      Content: rawAtt.Content ?? '',
      ContentType: rawAtt.ContentType ?? '',
      ContentID: rawAtt.ContentID,
    };

    let encodedContent = att.Content;
    let encodingType: 'base64' | 'None' = 'None';

    // If it's HTML, force base64 encoding for reliability
    if (att.ContentType === 'text/html') {
      encodedContent = Buffer.from(att.Content).toString('base64');
      encodingType = 'base64';
    }

    const transformedAttachment: PostmarkAttachment = {
      ...att,
      Content: encodedContent,
      ContentEncoding: encodingType,
    };
    return transformedAttachment as Attachment;
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