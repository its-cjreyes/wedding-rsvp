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

type Suggestion = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

type LookupResponse =
  | { status: "match"; group_id: string; guests: Guest[] }
  | { status: "suggestions"; matches: Suggestion[] }
  | { status: "none" }
  | { status: "locked" }
  | { error: string };

export function LookupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const resetLookupState = () => {
    setMessage("");
    setGroupId(null);
    setGuests([]);
    setSuggestions([]);
  };

  const runLookup = async (searchFirstName: string, searchLastName: string) => {
    const normalizedFirst = searchFirstName.trim();
    const normalizedLast = searchLastName.trim();

    if (!normalizedFirst || !normalizedLast) {
      setMessage("Please enter both first and last name.");
      return;
    }

    setLoading(true);
    resetLookupState();

    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: normalizedFirst,
          last_name: normalizedLast,
        }),
      });

      const data = (await response.json()) as LookupResponse;

      if (!response.ok && "error" in data) {
        setMessage(data.error || "Something went wrong while looking up your invitation.");
        return;
      }

      if ("status" in data && data.status === "match") {
        setGroupId(data.group_id);
        setGuests(data.guests);
        return;
      }

      if ("status" in data && data.status === "suggestions") {
        setSuggestions(data.matches);
        setMessage("Did you mean one of these names?");
        return;
      }

      if ("status" in data && data.status === "locked") {
        setMessage("This invitation has already been submitted.");
        return;
      }

      setMessage("We couldn't find a matching invitation.");
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runLookup(firstName, lastName);
  };

  const onSuggestionClick = async (suggestion: Suggestion) => {
    const suggestedFirst = suggestion.first_name ?? "";
    const suggestedLast = suggestion.last_name ?? "";

    setFirstName(suggestedFirst);
    setLastName(suggestedLast);
    await runLookup(suggestedFirst, suggestedLast);
  };

  if (groupId && guests.length > 0) {
    return <GroupRsvp groupId={groupId} guests={guests} />;
  }

  return (
    <div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
          />
        </label>

        <label className={styles.field}>
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
          />
        </label>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Searching..." : "Find My Invitation"}
        </button>
      </form>

      {message ? <p className={styles.message}>{message}</p> : null}

      {suggestions.length > 0 ? (
        <ul className={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className={styles.suggestionButton}
                onClick={() => onSuggestionClick(suggestion)}
              >
                {(suggestion.first_name ?? "") + " " + (suggestion.last_name ?? "")}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
