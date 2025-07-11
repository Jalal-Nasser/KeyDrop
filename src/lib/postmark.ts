import { ServerClient } from "postmark";

// You must set POSTMARK_API_TOKEN in your environment variables
const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN || "");

export async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!process.env.POSTMARK_API_TOKEN) {
    console.error("POSTMARK_API_TOKEN is not set. Email will not be sent.");
    throw new Error("PostMark API token is not configured.");
  }

  return postmarkClient.sendEmail({
    From: 'no-reply@yourdomain.com', // Change to your verified sender in PostMark
    To: to,
    Subject: subject,
    HtmlBody: html,
    MessageStream: "outbound" // Use 'outbound' for transactional emails
  });
}