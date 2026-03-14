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

type InviteGroupGuestRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type InviteGroupRow = {
  id: string;
  invite_code: string | null;
  round: string | number | null;
  invite_sent: boolean | null;
  guests: InviteGroupGuestRow[] | null;
};

export type InviteRecipientGroup = {
  groupId: string;
  inviteCode: string;
  round: string | number | null;
  inviteSent: boolean;
  recipients: InviteRecipient[];
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

const groupSelect =
  "id, invite_code, round, invite_sent, guests(id, first_name, last_name, email)";

const normalizeInviteRecipientGroup = (
  row: InviteGroupRow
): InviteRecipientGroup | null => {
  const inviteCode = row.invite_code?.trim();

  if (!inviteCode) {
    return null;
  }

  const recipients =
    row.guests
      ?.map((guest) => {
        const email = guest.email?.trim();

        if (!email) {
          return null;
        }

        return {
          guestId: guest.id,
          groupId: row.id,
          firstName: guest.first_name,
          lastName: guest.last_name,
          email,
          inviteCode,
        } satisfies InviteRecipient;
      })
      .filter((recipient): recipient is InviteRecipient => recipient !== null) ?? [];

  if (recipients.length === 0) {
    return null;
  }

  return {
    groupId: row.id,
    inviteCode,
    round: row.round,
    inviteSent: Boolean(row.invite_sent),
    recipients,
  };
};

export async function listInviteRecipientGroupsForRound(round: string) {
  const parsedRound = /^\d+$/.test(round) ? Number(round) : round;

  const { data, error } = await supabaseServer
    .from("invite_groups")
    .select(groupSelect)
    .eq("round", parsedRound)
    .eq("invite_sent", false)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as InviteGroupRow[] | null)
    ?.map(normalizeInviteRecipientGroup)
    .filter((group): group is InviteRecipientGroup => group !== null) ?? [];
}

export async function markInviteGroupSent(groupId: string) {
  const { error } = await supabaseServer
    .from("invite_groups")
    .update({ invite_sent: true })
    .eq("id", groupId);

  if (error) {
    throw new Error(error.message);
  }
}
