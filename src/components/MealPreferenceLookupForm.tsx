"use client";

import { FormEvent, useEffect, useState } from "react";

import { GroupMealPreferences } from "./GroupMealPreferences";
import styles from "./LookupForm.module.scss";

type Guest = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  dietary_restrictions: string | null;
  meal_preference: string | null;
};

type LookupResponse =
  | { status: "match"; group_id: string; guests: Guest[] }
  | { status: "none" | "rsvp_pending" | "submitted" | "no_attendees" }
  | { error: string };

type MealPreferenceLookupFormProps = {
  initialInviteCode?: string;
  onSeeDetails?: () => void;
};

const normalizeInviteCode = (value?: string) => value?.trim().toUpperCase() ?? "";

export function MealPreferenceLookupForm({
  initialInviteCode = "",
  onSeeDetails,
}: MealPreferenceLookupFormProps) {
  const [inviteCode, setInviteCode] = useState(() => normalizeInviteCode(initialInviteCode));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    setInviteCode(normalizeInviteCode(initialInviteCode));
  }, [initialInviteCode]);

  const resetLookupState = () => {
    setMessage("");
    setGroupId(null);
    setGuests([]);
  };

  const runLookup = async (code: string) => {
    const normalizedCode = normalizeInviteCode(code);

    if (!normalizedCode) {
      setMessage("Please enter your invitation code.");
      return;
    }

    setLoading(true);
    resetLookupState();

    try {
      const response = await fetch("/api/meal-preferences/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: normalizedCode }),
      });
      const data = (await response.json()) as LookupResponse;

      if (!response.ok && "error" in data) {
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      if ("status" in data && data.status === "match") {
        setGroupId(data.group_id);
        setGuests(data.guests);
        return;
      }

      if ("status" in data) {
        const messages = {
          rsvp_pending: "Please submit your RSVP before choosing meal preferences.",
          submitted:
            "Meal preferences have already been submitted. If you need to make a change, please contact us.",
          no_attendees: "There are no attending guests in this invitation group.",
          none: "We couldn't find that code. Please try again.",
        };
        setMessage(messages[data.status]);
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runLookup(inviteCode);
  };

  if (groupId && guests.length > 0) {
    return <GroupMealPreferences groupId={groupId} guests={guests} onSeeDetails={onSeeDetails} />;
  }

  return (
    <div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          Enter your invite code to continue
          <input
            type="text"
            value={inviteCode}
            onChange={(event) => setInviteCode(normalizeInviteCode(event.target.value))}
            placeholder="Invite code"
            autoComplete="off"
          />
          <span className={styles.helperText}>
            You&apos;ll find this in your meal-preference email.
          </span>
        </label>

        <button type="submit" className={`ctaOutline ${styles.submitButton}`} disabled={loading}>
          {loading ? "Continuing..." : "Continue"}
        </button>
      </form>

      {message ? <p className={styles.message}>{message}</p> : null}
    </div>
  );
}
