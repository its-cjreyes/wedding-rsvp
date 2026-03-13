"use client";

import { useEffect } from "react";

import { LookupForm } from "./LookupForm";
import styles from "./RsvpModal.module.scss";

type RsvpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialInviteCode?: string;
};

export function RsvpModal({
  isOpen,
  onClose,
  initialInviteCode = "",
}: RsvpModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close RSVP modal">
          Close
        </button>

        <h2 className={styles.title}>RSVP</h2>

        <LookupForm initialInviteCode={initialInviteCode} />
      </div>
    </div>
  );
}
