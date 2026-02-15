import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

type LookupRequest = {
  first_name?: string;
  last_name?: string;
};

const normalize = (value: string | undefined) => (value ?? "").trim().toLowerCase();
const escapeLike = (value: string) => value.replaceAll("%", "\\%").replaceAll("_", "\\_");

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LookupRequest;
    const firstName = normalize(body.first_name);
    const lastName = normalize(body.last_name);

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name are required." },
        { status: 400 }
      );
    }

    const escapedFirst = escapeLike(firstName);
    const escapedLast = escapeLike(lastName);

    const { data: matchedGuest, error: exactMatchError } = await supabaseServer
      .from("guests")
      .select("id, invite_group_id")
      .ilike("first_name", escapedFirst)
      .ilike("last_name", escapedLast)
      .limit(1)
      .maybeSingle();

    if (exactMatchError) {
      return NextResponse.json({ error: exactMatchError.message }, { status: 500 });
    }

    if (matchedGuest) {
      const { data: group, error: groupError } = await supabaseServer
        .from("invite_groups")
        .select("id, locked")
        .eq("id", matchedGuest.invite_group_id)
        .maybeSingle();

      if (groupError) {
        return NextResponse.json({ error: groupError.message }, { status: 500 });
      }

      if (!group) {
        return NextResponse.json({ error: "Invite group not found." }, { status: 404 });
      }

      if (group.locked) {
        return NextResponse.json({ status: "locked" });
      }

      const { data: guests, error: guestsError } = await supabaseServer
        .from("guests")
        .select(
          "id, first_name, last_name, attending, dietary_restrictions, is_plus_one"
        )
        .eq("invite_group_id", matchedGuest.invite_group_id)
        .order("is_plus_one", { ascending: true })
        .order("first_name", { ascending: true, nullsFirst: false });

      if (guestsError) {
        return NextResponse.json({ error: guestsError.message }, { status: 500 });
      }

      return NextResponse.json({
        status: "match",
        group_id: matchedGuest.invite_group_id,
        guests: guests ?? [],
      });
    }

    const matchTokens = [firstName, lastName].filter((token) => token.length > 0);
    const partialConditions = matchTokens
      .flatMap((token) => {
        const escapedToken = escapeLike(token);
        return [`first_name.ilike.${escapedToken}%`, `last_name.ilike.${escapedToken}%`];
      })
      .join(",");

    const { data: partialMatches, error: partialError } = await supabaseServer
      .from("guests")
      .select("id, first_name, last_name")
      .or(partialConditions)
      .limit(10);

    if (partialError) {
      return NextResponse.json({ error: partialError.message }, { status: 500 });
    }

    if (partialMatches && partialMatches.length > 0) {
      return NextResponse.json({
        status: "suggestions",
        matches: partialMatches,
      });
    }

    return NextResponse.json({ status: "none" });
  } catch {
    return NextResponse.json(
      { error: "Unable to process lookup request." },
      { status: 500 }
    );
  }
}
