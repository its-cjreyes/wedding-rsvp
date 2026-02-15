"use client";

import { useState } from "react";

import { RsvpModal } from "@/components/RsvpModal";

import styles from "./page.module.scss";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <main className={styles.hero}>
        <p className={styles.kicker}>Wedding Celebration</p>
        <h1 className={styles.title}>Mac and CJ</h1>
        <div className={styles.details}>
          <p>Saturday, October 17, 2026</p>
          <p>Charleston, South Carolina</p>
        </div>

        <button
          type="button"
          className={styles.rsvpButton}
          onClick={() => setIsModalOpen(true)}
        >
          RSVP
        </button>
      </main>

      <RsvpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
