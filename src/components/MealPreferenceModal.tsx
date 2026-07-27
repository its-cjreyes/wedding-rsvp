"use client";

import { useEffect } from "react";

import { GroupMealPreferences } from "./GroupMealPreferences";
import { MealPreferenceLookupForm } from "./MealPreferenceLookupForm";
import styles from "./RsvpModal.module.scss";

type MealPreferenceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialInviteCode?: string;
  preview?: boolean;
};

export function MealPreferenceModal({
  isOpen,
  onClose,
  initialInviteCode = "",
  preview = false,
}: MealPreferenceModalProps) {
  const goToDetails = () => {
    onClose();
    window.location.hash = "details";
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close meal preferences modal">
          Close
        </button>

        <h2 className={styles.title}>Select your meal</h2>
        {preview ? (
          <GroupMealPreferences
            groupId="preview"
            guests={[
              {
                id: "preview-guest-1",
                first_name: "Guest",
                last_name: "One",
                dietary_restrictions: null,
                meal_preference: null,
              },
              {
                id: "preview-guest-2",
                first_name: "Guest",
                last_name: "Two",
                dietary_restrictions: null,
                meal_preference: null,
              },
              {
                id: "preview-guest-3",
                first_name: "Guest",
                last_name: "Three",
                dietary_restrictions: null,
                meal_preference: null,
              },
            ]}
            preview
            onSeeDetails={goToDetails}
          />
        ) : (
          <MealPreferenceLookupForm
            initialInviteCode={initialInviteCode}
            onSeeDetails={goToDetails}
          />
        )}
      </div>
    </div>
  );
}
