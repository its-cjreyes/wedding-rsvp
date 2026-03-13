import { NextResponse } from "next/server";

import { buildRsvpUrl, sendWeddingInviteEmail } from "@/lib/invite-email";
import {
  getInviteRecipientByGuestEmail,
  getInviteRecipientByGuestId,
} from "@/lib/invite-recipients";

type SendTestInviteRequest = {
  guest_id?: string;
  guest_email?: string;
  send_to?: string;
};

const normalize = (value?: string) => value?.trim() || "";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendTestInviteRequest;
    const guestId = normalize(body.guest_id);
    const guestEmail = normalize(body.guest_email);
    const configuredTestEmail = normalize(process.env.TEST_INVITE_EMAIL);
    const requestedSendTo = normalize(body.send_to);
    const sendTo = requestedSendTo || configuredTestEmail;

    if (!configuredTestEmail) {
      return NextResponse.json(
        { error: "TEST_INVITE_EMAIL is not configured." },
        { status: 500 }
      );
    }

    if (!sendTo || sendTo.toLowerCase() !== configuredTestEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Test invites may only be sent to TEST_INVITE_EMAIL." },
        { status: 400 }
      );
    }

    if (!guestId && !guestEmail) {
      return NextResponse.json(
        { error: "Provide guest_id or guest_email to choose a test guest." },
        { status: 400 }
      );
    }

    const recipient = guestId
      ? await getInviteRecipientByGuestId(guestId)
      : await getInviteRecipientByGuestEmail(guestEmail);

    if (!recipient) {
      return NextResponse.json(
        { error: "No sendable guest was found for the provided test guest." },
        { status: 404 }
      );
    }

    const result = await sendWeddingInviteEmail({
      to: sendTo,
      firstName: recipient.firstName,
      inviteCode: recipient.inviteCode,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: "sent",
      resend_id: result.data?.id ?? null,
      original_guest_email: recipient.email,
      sent_to: sendTo,
      invite_code: recipient.inviteCode,
      rsvp_url: buildRsvpUrl(recipient.inviteCode),
      invite_group_id: recipient.groupId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to send test invitation email.",
      },
      { status: 500 }
    );
  }
}
