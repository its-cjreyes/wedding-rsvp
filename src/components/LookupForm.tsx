"use client";

import { FormEvent, useState } from "react";

import { GroupRsvp } from "./GroupRsvp";
import styles from "./LookupForm.module.scss";

type Guest = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  attending: boolean | null;
  dietary_restrictions: string | null;
  is_plus_one: boolean;
};

type LookupResponse =
  | { status: "match"; group_id: string; guests: Guest[] }
  | { status: "none" }
  | { status: "locked" }
  | { error: string };

export function LookupForm() {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);

  const resetLookupState = () => {
    setMessage("");
    setGroupId(null);
    setGuests([]);
  };

  const runLookup = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setMessage("Please enter your invitation code.");
      return;
    }

    setLoading(true);
    resetLookupState();

    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: normalizedCode,
        }),
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

      if ("status" in data && data.status === "locked") {
        setMessage(
          "This RSVP has already been submitted. If you need to make a change, please contact us."
        );
        return;
      }

      setMessage("We couldn't find that code. Please try again.");
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
    return <GroupRsvp groupId={groupId} guests={guests} />;
  }

  return (
    <div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          Enter your invite code to continue
          <input
            type="text"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="Invite code"
            autoComplete="off"
          />
          <span className={styles.helperText}>
            You&apos;ll find this in your email invitation.
          </span>
        </label>

        <button
          type="submit"
          className={`ctaOutline ${styles.submitButton}`}
          disabled={loading}
        >
          {loading ? "Continuing..." : "Continue"}
        </button>
      </form>

      {message ? <p className={styles.message}>{message}</p> : null}
    </div>
  );
}
