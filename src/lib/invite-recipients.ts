import { supabaseServer } from "./supabase-server";

type InviteGroupRelation = {
  invite_code: string | null;
};

type InviteRecipientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  invite_group_id: string;
  invite_groups: InviteGroupRelation | InviteGroupRelation[] | null;
};

export type InviteRecipient = {
  guestId: string;
  groupId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  inviteCode: string;
};

const recipientSelect =
  "id, first_name, last_name, email, invite_group_id, invite_groups!inner(invite_code)";

const normalizeRecipient = (row: InviteRecipientRow): InviteRecipient | null => {
  const email = row.email?.trim();
  const inviteGroup = Array.isArray(row.invite_groups)
    ? row.invite_groups[0]
    : row.invite_groups;
  const inviteCode = inviteGroup?.invite_code?.trim();

  if (!email || !inviteCode) {
    return null;
  }

  return {
    guestId: row.id,
    groupId: row.invite_group_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email,
    inviteCode,
  };
};

export async function listInviteRecipients() {
  const { data, error } = await supabaseServer
    .from("guests")
    .select(recipientSelect)
    .not("email", "is", null)
    .order("invite_group_id", { ascending: true })
    .order("last_name", { ascending: true, nullsFirst: false })
    .order("first_name", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as InviteRecipientRow[] | null)
    ?.map(normalizeRecipient)
    .filter((recipient): recipient is InviteRecipient => recipient !== null) ?? [];
}

export async function getInviteRecipientByGuestId(guestId: string) {
  const { data, error } = await supabaseServer
    .from("guests")
    .select(recipientSelect)
    .eq("id", guestId.trim())
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeRecipient(data as InviteRecipientRow) : null;
}

export async function getInviteRecipientByGuestEmail(email: string) {
  const normalizedEmail = email.trim();

  const { data, error } = await supabaseServer
    .from("guests")
    .select(recipientSelect)
    .eq("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeRecipient(data as InviteRecipientRow) : null;
}
