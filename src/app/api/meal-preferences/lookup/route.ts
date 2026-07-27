import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

type LookupRequest = {
  invite_code?: string;
};

const normalize = (value: string | undefined) => (value ?? "").trim().toLowerCase();
const escapeLike = (value: string) => value.replaceAll("%", "\\%").replaceAll("_", "\\_");

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LookupRequest;
    const inviteCode = normalize(body.invite_code);

    if (!inviteCode) {
      return NextResponse.json({ error: "Invitation code is required." }, { status: 400 });
    }

    const { data: group, error: groupError } = await supabaseServer
      .from("invite_groups")
      .select("id, locked, meal_preferences_submitted_at")
      .ilike("invite_code", escapeLike(inviteCode))
      .limit(1)
      .maybeSingle();

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 });
    }

    if (!group) {
      return NextResponse.json({ status: "none" });
    }

    if (!group.locked) {
      return NextResponse.json({ status: "rsvp_pending" });
    }

    if (group.meal_preferences_submitted_at) {
      return NextResponse.json({ status: "submitted" });
    }

    const { data: guests, error: guestsError } = await supabaseServer
      .from("guests")
      .select("id, first_name, last_name, dietary_restrictions, meal_preference")
      .eq("invite_group_id", group.id)
      .eq("attending", true)
      .order("first_name", { ascending: true, nullsFirst: false });

    if (guestsError) {
      return NextResponse.json({ error: guestsError.message }, { status: 500 });
    }

    if (!guests || guests.length === 0) {
      return NextResponse.json({ status: "no_attendees" });
    }

    return NextResponse.json({ status: "match", group_id: group.id, guests });
  } catch {
    return NextResponse.json(
      { error: "Unable to process meal preferences." },
      { status: 500 }
    );
  }
}
