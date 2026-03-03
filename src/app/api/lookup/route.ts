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

    const escapedCode = escapeLike(inviteCode);

    const { data: group, error: groupError } = await supabaseServer
      .from("invite_groups")
      .select("id, locked")
      .ilike("invite_code", escapedCode)
      .limit(1)
      .maybeSingle();

    if (groupError) {
      return NextResponse.json({ error: groupError.message }, { status: 500 });
    }

    if (group) {
      if (group.locked) {
        return NextResponse.json({ status: "locked" });
      }

      const { data: guests, error: guestsError } = await supabaseServer
        .from("guests")
        .select(
          "id, first_name, last_name, attending, dietary_restrictions, is_plus_one"
        )
        .eq("invite_group_id", group.id)
        .order("is_plus_one", { ascending: true })
        .order("first_name", { ascending: true, nullsFirst: false });

      if (guestsError) {
        return NextResponse.json({ error: guestsError.message }, { status: 500 });
      }

      return NextResponse.json({
        status: "match",
        group_id: group.id,
        guests: guests ?? [],
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
