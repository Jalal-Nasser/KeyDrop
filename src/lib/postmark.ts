import { ServerClient, Models } from "postmark";

// Lazy-init Postmark client at runtime to avoid build-time env access
let _postmarkClient: ServerClient | null = null;
function getPostmarkClient(): ServerClient {
  if (_postmarkClient) return _postmarkClient;
  const token = process.env.POSTMARK_API_TOKEN;
  if (!token) {
    // Don't create a client without a token
    throw new Error("POSTMARK_API_TOKEN is not configured");
  }
  _postmarkClient = new ServerClient(token);
  return _postmarkClient;
}

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
  ContentEncoding: 'base64' | 'None'; // Keep this as optional for our input
}

export async function sendMail({ to, subject, html, attachments, from, replyTo }: { to: string, subject: string, html: string, attachments?: Partial<CustomAttachment>[], from?: string, replyTo?: string }) {
  // Initialize client on demand to ensure we only require the token at runtime
  const postmarkClient = getPostmarkClient();

  const postmarkAttachments: Models.Attachment[] | undefined = attachments?.map((rawAtt) => {
    // Explicitly cast the entire object literal to CustomAttachment
    const att: CustomAttachment = {
      Name: rawAtt.Name ?? '',
      Content: rawAtt.Content ?? '',
      ContentType: rawAtt.ContentType ?? '',
      ContentID: rawAtt.ContentID,
      ContentEncoding: rawAtt.ContentEncoding ?? 'None',
    } as CustomAttachment; // Explicit cast here

    let encodedContent = att.Content;
    let encodingType = att.ContentEncoding;

    // If it's HTML, force base64 encoding for reliability
    if (att.ContentType === 'text/html' && encodingType === 'None') {
      // In Edge Runtime, we use btoa for basic strings. 
      // For more complex binary data, we'd need a different approach, 
      // but for email HTML content, btoa is usually sufficient if it's UTF-8.
      encodedContent = btoa(unescape(encodeURIComponent(att.Content)));
      encodingType = 'base64';
    }

    const transformedAttachment: PostmarkAttachment = {
      Name: att.Name,
      Content: encodedContent,
      ContentType: att.ContentType,
      ContentID: att.ContentID === undefined ? null : att.ContentID,
      ContentEncoding: encodingType,
    };
    return transformedAttachment as Models.Attachment;
  });

  const fromAddress = from ?? process.env.POSTMARK_FROM ?? 'no-reply@dropskey.com';

  return postmarkClient.sendEmail({
    From: fromAddress,
    To: to,
    Subject: subject,
    HtmlBody: html,
    ...(replyTo ? { ReplyTo: replyTo } : {}),
    Attachments: postmarkAttachments,
    MessageStream: "outbound"
  });
}