import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

type SubmittedGuest = {
  id: string;
  attending: boolean;
  dietary: string | null;
  first_name?: string;
  last_name?: string;
};

type SubmitRequest = {
  group_id?: string;
  guests?: SubmittedGuest[];
};

const normalizedName = (name?: string) => {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitRequest;
    const groupId = body.group_id?.trim();
    const guestsPayload = body.guests;

    if (!groupId || !Array.isArray(guestsPayload) || guestsPayload.length === 0) {
      return NextResponse.json(
        { error: "Group ID and guests are required." },
        { status: 400 }
      );
    }

    const { data: group, error: groupError } = await supabaseServer
      .from("invite_groups")
      .select("id, locked")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 });
    }

    if (!group) {
      return NextResponse.json({ error: "Invite group not found." }, { status: 404 });
    }

    if (group.locked) {
      return NextResponse.json({ error: "This invitation is already locked." }, { status: 409 });
    }

    const payloadGuestIds = guestsPayload.map((guest) => guest.id);
    const uniqueGuestIds = new Set(payloadGuestIds);

    if (uniqueGuestIds.size !== payloadGuestIds.length) {
      return NextResponse.json(
        { error: "Duplicate guest IDs are not allowed." },
        { status: 400 }
      );
    }

    const { data: groupGuests, error: groupGuestsError } = await supabaseServer
      .from("guests")
      .select("id, first_name, last_name, is_plus_one")
      .eq("invite_group_id", groupId)
      .in("id", payloadGuestIds);

    if (groupGuestsError) {
      return NextResponse.json({ error: groupGuestsError.message }, { status: 500 });
    }

    if (!groupGuests || groupGuests.length !== payloadGuestIds.length) {
      return NextResponse.json(
        { error: "One or more guests are invalid for this invite group." },
        { status: 400 }
      );
    }

    const guestsById = new Map(groupGuests.map((guest) => [guest.id, guest]));
    const submissionId = crypto.randomUUID();

    const nowIso = new Date().toISOString();

    for (const submittedGuest of guestsPayload) {
      const originalGuest = guestsById.get(submittedGuest.id);

      if (!originalGuest) {
        return NextResponse.json({ error: "Guest lookup failed." }, { status: 400 });
      }

      const updatePayload: {
        attending: boolean;
        dietary_restrictions: string | null;
        submission_id: string;
        first_name?: string | null;
        last_name?: string | null;
      } = {
        attending: submittedGuest.attending,
        dietary_restrictions:
          submittedGuest.attending && submittedGuest.dietary?.trim()
            ? submittedGuest.dietary.trim()
            : null,
        submission_id: submissionId,
      };

      if (originalGuest.is_plus_one) {
        const incomingFirst = normalizedName(submittedGuest.first_name);
        const incomingLast = normalizedName(submittedGuest.last_name);
        const hasStoredNames = Boolean(originalGuest.first_name && originalGuest.last_name);

        if (submittedGuest.attending && !hasStoredNames && (!incomingFirst || !incomingLast)) {
          return NextResponse.json(
            { error: "Attending plus ones must include first and last name." },
            { status: 400 }
          );
        }

        if (!originalGuest.first_name && incomingFirst) {
          updatePayload.first_name = incomingFirst;
        }

        if (!originalGuest.last_name && incomingLast) {
          updatePayload.last_name = incomingLast;
        }
      }

      const { error: guestUpdateError } = await supabaseServer
        .from("guests")
        .update(updatePayload)
        .eq("id", submittedGuest.id)
        .eq("invite_group_id", groupId);

      if (guestUpdateError) {
        return NextResponse.json({ error: guestUpdateError.message }, { status: 500 });
      }
    }

    const { data: lockedRows, error: lockError } = await supabaseServer
      .from("invite_groups")
      .update({ locked: true })
      .eq("id", groupId)
      .eq("locked", false)
      .select("id");

    if (lockError) {
      return NextResponse.json({ error: lockError.message }, { status: 500 });
    }

    if (!lockedRows || lockedRows.length === 0) {
      return NextResponse.json({ error: "This invitation is already locked." }, { status: 409 });
    }

    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    const webhookFailures: string[] = [];

    if (webhookUrl) {
      const webhookResults = await Promise.allSettled(
        guestsPayload.map(async (submittedGuest) => {
          const sourceGuest = guestsById.get(submittedGuest.id);
          const firstName = normalizedName(submittedGuest.first_name) ?? sourceGuest?.first_name;
          const lastName = normalizedName(submittedGuest.last_name) ?? sourceGuest?.last_name;

          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submission_id: submissionId,
              group_id: groupId,
              first_name: firstName,
              last_name: lastName,
              attending: submittedGuest.attending,
              dietary: submittedGuest.attending ? submittedGuest.dietary ?? null : null,
              submitted_at: nowIso,
            }),
          });

          if (!response.ok) {
            throw new Error(`Webhook failed for guest ${submittedGuest.id}`);
          }
        })
      );

      webhookResults.forEach((result) => {
        if (result.status === "rejected") {
          webhookFailures.push(result.reason instanceof Error ? result.reason.message : "Unknown webhook failure");
        }
      });
    }

    return NextResponse.json({
      status: "success",
      submission_id: submissionId,
      webhook_failures: webhookFailures,
    });
  } catch {
    return NextResponse.json({ error: "Unable to submit RSVP." }, { status: 500 });
  }
}
