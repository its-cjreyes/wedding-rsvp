import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

const mealPreferences = [
  "Braised Beef Short Rib",
  "Stuffed Chicken Supreme",
  "Eggplant Parmigiana",
] as const;

type MealPreference = (typeof mealPreferences)[number];

type SubmittedGuest = {
  id: string;
  meal_preference: string;
  dietary: string | null;
};

type SubmitRequest = {
  group_id?: string;
  guests?: SubmittedGuest[];
};

const normalizeText = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const isMealPreference = (value: string): value is MealPreference =>
  mealPreferences.includes(value as MealPreference);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitRequest;
    const groupId = body.group_id?.trim();
    const submittedGuests = body.guests;

    if (!groupId || !Array.isArray(submittedGuests) || submittedGuests.length === 0) {
      return NextResponse.json(
        { error: "Group ID and meal selections are required." },
        { status: 400 }
      );
    }

    const guestIds = submittedGuests.map((guest) => guest.id);
    if (new Set(guestIds).size !== guestIds.length) {
      return NextResponse.json({ error: "Duplicate guest IDs are not allowed." }, { status: 400 });
    }

    for (const guest of submittedGuests) {
      if (!isMealPreference(guest.meal_preference)) {
        return NextResponse.json({ error: "Please choose a valid meal for each guest." }, { status: 400 });
      }
    }

    const { data: group, error: groupError } = await supabaseServer
      .from("invite_groups")
      .select("id, locked, meal_preferences_submitted_at")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 });
    }

    if (!group) {
      return NextResponse.json({ error: "Invite group not found." }, { status: 404 });
    }

    if (!group.locked) {
      return NextResponse.json({ error: "Please submit your RSVP before choosing meals." }, { status: 409 });
    }

    if (group.meal_preferences_submitted_at) {
      return NextResponse.json({ error: "Meal preferences have already been submitted." }, { status: 409 });
    }

    const { data: attendingGuests, error: guestsError } = await supabaseServer
      .from("guests")
      .select("id, first_name, last_name")
      .eq("invite_group_id", groupId)
      .eq("attending", true)
      .in("id", guestIds);

    if (guestsError) {
      return NextResponse.json({ error: guestsError.message }, { status: 500 });
    }

    if (!attendingGuests || attendingGuests.length !== submittedGuests.length) {
      return NextResponse.json(
        { error: "Please provide a meal selection for every attending guest." },
        { status: 400 }
      );
    }

    const submissionId = crypto.randomUUID();
    const submittedAt = new Date().toISOString();
    const guestById = new Map(attendingGuests.map((guest) => [guest.id, guest]));

    for (const submittedGuest of submittedGuests) {
      const { error: updateError } = await supabaseServer
        .from("guests")
        .update({
          meal_preference: submittedGuest.meal_preference,
          dietary_restrictions: normalizeText(submittedGuest.dietary),
          meal_preference_submission_id: submissionId,
        })
        .eq("id", submittedGuest.id)
        .eq("invite_group_id", groupId)
        .eq("attending", true);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    const { data: submittedGroups, error: groupUpdateError } = await supabaseServer
      .from("invite_groups")
      .update({ meal_preferences_submitted_at: submittedAt })
      .eq("id", groupId)
      .is("meal_preferences_submitted_at", null)
      .select("id");

    if (groupUpdateError) {
      return NextResponse.json({ error: groupUpdateError.message }, { status: 500 });
    }

    if (!submittedGroups || submittedGroups.length === 0) {
      return NextResponse.json({ error: "Meal preferences have already been submitted." }, { status: 409 });
    }

    const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
    const secret = process.env.SHEETS_WEBHOOK_SECRET;

    if (!webhookUrl || !secret) {
      return NextResponse.json({ error: "Sheets webhook is not configured." }, { status: 500 });
    }

    const webhookResults = await Promise.allSettled(
      submittedGuests.map(async (submittedGuest) => {
        const guest = guestById.get(submittedGuest.id);
        if (!guest?.first_name || !guest.last_name) {
          throw new Error(`Guest ${submittedGuest.id} is missing a name.`);
        }

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret,
            submission_type: "meal_preference",
            meal_submission_id: submissionId,
            group_id: groupId,
            first_name: guest.first_name,
            last_name: guest.last_name,
            meal_preference: submittedGuest.meal_preference,
            dietary: normalizeText(submittedGuest.dietary),
            submitted_at: submittedAt,
          }),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed for guest ${submittedGuest.id}`);
        }
      })
    );

    const webhookFailures = webhookResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) =>
        result.reason instanceof Error ? result.reason.message : "Unknown webhook failure"
      );

    return NextResponse.json({
      status: "success",
      meal_submission_id: submissionId,
      webhook_failures: webhookFailures,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit meal preferences." },
      { status: 500 }
    );
  }
}
