"use client";

import { FormEvent, useMemo, useState } from "react";

import styles from "./GroupRsvp.module.scss";

const mealOptions = [
  {
    name: "Braised Beef Short Rib",
    description:
      "Truffle-infused potato purée, butter-poached heirloom carrots, crisp parsnip, madeira jus (GF)",
  },
  {
    name: "Stuffed Chicken Supreme",
    description:
      "Mushroom duxelles, roasted parsnip purée, baby potatoes, mini bell pepper, mushroom jus (GF)",
  },
  {
    name: "Eggplant Parmigiana",
    description:
      "Herb-roasted eggplant, tomato sugo, melted mozzarella, roasted baby potatoes, micro basil (V)",
  },
] as const;

type Guest = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  dietary_restrictions: string | null;
  meal_preference: string | null;
};

type GuestFormState = {
  id: string;
  first_name: string;
  last_name: string;
  dietary: string;
  mealPreference: string;
};

type GroupMealPreferencesProps = {
  groupId: string;
  guests: Guest[];
  preview?: boolean;
  onSeeDetails?: () => void;
};

export function GroupMealPreferences({
  groupId,
  guests,
  preview = false,
  onSeeDetails,
}: GroupMealPreferencesProps) {
  const initialGuests = useMemo<GuestFormState[]>(
    () =>
      guests.map((guest) => ({
        id: guest.id,
        first_name: guest.first_name ?? "",
        last_name: guest.last_name ?? "",
        dietary: guest.dietary_restrictions ?? "",
        mealPreference: guest.meal_preference ?? "",
      })),
    [guests]
  );
  const [guestStates, setGuestStates] = useState(initialGuests);
  const [activeGuestId, setActiveGuestId] = useState<string | null>(
    initialGuests[0]?.id ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateGuest = (id: string, updates: Partial<GuestFormState>) => {
    setGuestStates((current) =>
      current.map((guest) => (guest.id === id ? { ...guest, ...updates } : guest))
    );
  };

  const selectMeal = (id: string, mealPreference: string) => {
    updateGuest(id, { mealPreference });
  };

  const saveGuest = (id: string) => {
    const currentIndex = guestStates.findIndex((guest) => guest.id === id);
    const guestsAfterCurrent = [
      ...guestStates.slice(currentIndex + 1),
      ...guestStates.slice(0, currentIndex),
    ];
    const nextGuest = guestsAfterCurrent.find((guest) => !guest.mealPreference);

    setActiveGuestId(nextGuest?.id ?? null);
  };

  const hasSelectedAllMeals = guestStates.every((guest) => Boolean(guest.mealPreference));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (guestStates.some((guest) => !guest.mealPreference)) {
      setError("Please choose a meal for each guest.");
      return;
    }

    setError("");

    if (preview) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/meal-preferences/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          guests: guestStates.map((guest) => ({
            id: guest.id,
            meal_preference: guest.mealPreference,
            dietary: guest.dietary.trim() || null,
          })),
        }),
      });
      const data = (await response.json()) as { error?: string; status?: string };

      if (!response.ok) {
        setError(data.error ?? "We could not submit your meal preferences. Please try again.");
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
        <p>Thank you. We&apos;ve received your meal&nbsp;preferences.</p>
        <p>If anything changes, please contact&nbsp;us&nbsp;directly.</p>
        <p>For venue info, dress code, and more, be sure to check out <strong>The&nbsp;Details</strong>.</p>
        {onSeeDetails ? (
          <button className={`ctaOutline ${styles.detailsButton}`} type="button" onClick={onSeeDetails}>
            See the Details
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <p className={styles.formIntro}>
        Please select a meal for each attending guest. You can also update dietary&nbsp;restrictions.
      </p>

      {guestStates.map((guest, index) => {
        const isActive = activeGuestId === guest.id;
        const guestName =
          guest.first_name && guest.last_name
            ? `${guest.first_name} ${guest.last_name}`
            : `Guest ${index + 1}`;

        return (
        <section className={styles.guestCard} key={guest.id}>
          <div className={styles.guestHeader}>
            <h3>{guestName}</h3>
            {!isActive && guest.mealPreference ? (
              <button
                className={styles.editButton}
                type="button"
                onClick={() => setActiveGuestId(guest.id)}
              >
                Edit
              </button>
            ) : null}
          </div>

          {isActive ? (
          <div className={styles.attendingFields}>
            <fieldset className={styles.mealChoices} aria-label={`Meal choices for ${guestName}`}>
              {mealOptions.map((meal) => (
                <label className={styles.mealChoice} key={meal.name}>
                  <input
                    type="radio"
                    name={`meal-${guest.id}`}
                    value={meal.name}
                    checked={guest.mealPreference === meal.name}
                    onChange={() => selectMeal(guest.id, meal.name)}
                    required
                  />
                  <span>
                    <strong>{meal.name}</strong>
                    <span>{meal.description}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <label>
              Dietary notes
              <input
                type="text"
                value={guest.dietary}
                onChange={(event) => updateGuest(guest.id, { dietary: event.target.value })}
                placeholder="Optional"
              />
            </label>

            <button
              className={`ctaOutline ${styles.saveMealButton}`}
              type="button"
              onClick={() => saveGuest(guest.id)}
              disabled={!guest.mealPreference}
            >
              Save
            </button>
          </div>
          ) : (
            <div className={styles.mealSummary}>
              {guest.mealPreference ? (
                <>
                  <p>{guest.mealPreference}</p>
                  {guest.dietary ? <p>Dietary notes: {guest.dietary}</p> : null}
                </>
              ) : (
                <button
                  className={styles.selectMealButton}
                  type="button"
                  onClick={() => setActiveGuestId(guest.id)}
                >
                  Select meal
                </button>
              )}
            </div>
          )}
        </section>
        );
      })}

      {error ? <p className={styles.error}>{error}</p> : null}

      {hasSelectedAllMeals && !activeGuestId ? (
        <button className={`ctaOutline ${styles.submitButton}`} type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      ) : null}
    </form>
  );
}
