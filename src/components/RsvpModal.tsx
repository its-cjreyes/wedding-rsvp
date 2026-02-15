"use client";

import { useEffect } from "react";

import { LookupForm } from "./LookupForm";
import styles from "./RsvpModal.module.scss";

type RsvpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function RsvpModal({ isOpen, onClose }: RsvpModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close RSVP modal">
          x
        </button>

        <h2 className={styles.title}>RSVP</h2>
        <p className={styles.subtitle}>Find your invitation to respond for your whole party.</p>

        <LookupForm />
      </div>
    </div>
  );
}
