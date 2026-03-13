import { WeddingInvite } from "../emails/WeddingInvite";

import { resend } from "./resend";
import { getSiteUrl } from "./site-url";

type SendWeddingInviteInput = {
  to: string;
  firstName?: string | null;
  inviteCode: string;
};

export const buildRsvpUrl = (inviteCode: string) => {
  const url = new URL("/", getSiteUrl());
  url.searchParams.set("code", inviteCode);
  return url.toString();
};

export async function sendWeddingInviteEmail({
  to,
  firstName,
  inviteCode,
}: SendWeddingInviteInput) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL?.trim();

  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  const rsvpUrl = buildRsvpUrl(inviteCode);

  return resend.emails.send({
    from: fromEmail,
    to,
    replyTo: replyToEmail || undefined,
    subject: "You're invited to celebrate Mac and CJ",
    react: (
      <WeddingInvite
        firstName={firstName}
        inviteCode={inviteCode}
        rsvpUrl={rsvpUrl}
      />
    ),
  });
}
