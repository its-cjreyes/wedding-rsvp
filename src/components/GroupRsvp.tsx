"use client";

import { FormEvent, useMemo, useState } from "react";

import styles from "./GroupRsvp.module.scss";

type Guest = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  attending: boolean | null;
  dietary_restrictions: string | null;
  is_plus_one: boolean;
};

type GuestFormState = {
  id: string;
  attending: boolean | null;
  dietary: string;
  first_name: string;
  last_name: string;
  is_plus_one: boolean;
  hadMissingName: boolean;
};

type GroupRsvpProps = {
  groupId: string;
  guests: Guest[];
};

export function GroupRsvp({ groupId, guests }: GroupRsvpProps) {
  const initialGuests = useMemo<GuestFormState[]>(
    () =>
      guests.map((guest) => ({
        id: guest.id,
        attending: guest.attending,
        dietary: guest.dietary_restrictions ?? "",
        first_name: guest.first_name ?? "",
        last_name: guest.last_name ?? "",
        is_plus_one: guest.is_plus_one,
        hadMissingName: guest.is_plus_one && (!guest.first_name || !guest.last_name),
      })),
    [guests]
  );

  const [guestStates, setGuestStates] = useState<GuestFormState[]>(initialGuests);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateGuest = (id: string, updates: Partial<GuestFormState>) => {
    setGuestStates((current) =>
      current.map((guest) => (guest.id === id ? { ...guest, ...updates } : guest))
    );
  };

  const validate = () => {
    for (const guest of guestStates) {
      if (guest.attending === null) {
        return "Please select attendance for each guest.";
      }

      if (guest.attending && guest.is_plus_one && guest.hadMissingName) {
        if (!guest.first_name.trim() || !guest.last_name.trim()) {
          return "Please provide a first and last name for each attending plus one.";
        }
      }
    }

    return "";
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          guests: guestStates.map((guest) => ({
            id: guest.id,
            attending: Boolean(guest.attending),
            dietary: guest.attending ? guest.dietary || null : null,
            first_name: guest.first_name.trim() || undefined,
            last_name: guest.last_name.trim() || undefined,
          })),
        }),
      });

      const data = (await response.json()) as { error?: string; status?: string };

      if (!response.ok) {
        if (response.status === 409) {
          setError("This invitation has already been submitted.");
          return;
        }

        setError(data.error ?? "We could not submit your RSVP. Please try again.");
        return;
      }

      if (data.status === "success") {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.confirmation}>
        <p>Thank you. We&apos;ve received your RSVP.</p>
        <p>If anything changes, please contact us directly.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {guestStates.map((guest, index) => (
        <section className={styles.guestCard} key={guest.id}>
          <h3>
            {guest.first_name && guest.last_name
              ? `${guest.first_name} ${guest.last_name}`
              : `Guest ${index + 1}`}
          </h3>

          <div className={styles.radioRow}>
            <label>
              <input
                type="radio"
                name={`attending-${guest.id}`}
                checked={guest.attending === true}
                onChange={() => updateGuest(guest.id, { attending: true })}
              />
              Joyfully accept
            </label>

            <label>
              <input
                type="radio"
                name={`attending-${guest.id}`}
                checked={guest.attending === false}
                onChange={() =>
                  updateGuest(guest.id, { attending: false, dietary: "" })
                }
              />
              Regretfully decline
            </label>
          </div>

          {guest.attending ? (
            <div className={styles.attendingFields}>
              {guest.is_plus_one && guest.hadMissingName ? (
                <div className={styles.plusOneFields}>
                  <label>
                    Plus One First Name
                    <input
                      type="text"
                      value={guest.first_name}
                      onChange={(event) =>
                        updateGuest(guest.id, { first_name: event.target.value })
                      }
                      required
                    />
                  </label>

                  <label>
                    Plus One Last Name
                    <input
                      type="text"
                      value={guest.last_name}
                      onChange={(event) =>
                        updateGuest(guest.id, { last_name: event.target.value })
                      }
                      required
                    />
                  </label>
                </div>
              ) : null}

              <label>
                Dietary restrictions
                <input
                  type="text"
                  value={guest.dietary}
                  onChange={(event) =>
                    updateGuest(guest.id, { dietary: event.target.value })
                  }
                  placeholder="Optional"
                />
              </label>
            </div>
          ) : null}
        </section>
      ))}

      {error ? <p className={styles.error}>{error}</p> : null}

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit RSVP"}
      </button>
    </form>
  );
}
