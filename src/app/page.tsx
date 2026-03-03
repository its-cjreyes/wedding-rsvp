"use client";

import { useState } from "react";
import Image from "next/image";

import { PhotoCarousel } from "@/components/PhotoCarousel";
import { RsvpModal } from "@/components/RsvpModal";
import carouselPhotos from "@/content/carousel-photos.json";
import detailsAccordionItems from "@/content/details-accordion.json";
import broadviewIllustration from "@/assets/Broadview-Hotel-Illustration.svg";
import macAndCjLogo from "@/assets/Mac-and-CJ-Logo.svg";

import styles from "./page.module.scss";

type DetailAccordionItem = {
  id: string;
  title: string;
  body: string[];
};

type CarouselPhoto = {
  src: string;
  alt: string;
  caption: string;
};

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDetailId, setOpenDetailId] = useState<string>("");

  const toggleDetail = (id: string) => {
    setOpenDetailId((currentId) => (currentId === id ? "" : id));
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero} aria-label="Wedding overview">
          <div className={styles.heroIllustration}>
            <Image
              src={broadviewIllustration}
              alt="Illustration of The Broadview Hotel"
              priority
            />
          </div>

          <div className={styles.heroContent}>
            <Image src={macAndCjLogo} alt="Mac and CJ" className={styles.wordmark} priority />

            <div className={styles.heroDetails}>
              <div className={`${styles.heroMeta} ${styles.upperText}`}>
                <p>The Broadview Hotel</p>
                <p>Friday 16 October 2026</p>
                <p>5:00PM Arrival · 5:30PM Ceremony</p>
              </div>

              <div className={styles.heroActions}>
                <button
                  type="button"
                  className={`ctaOutline ${styles.rsvpButton}`}
                  onClick={() => setIsModalOpen(true)}
                >
                  RSVP
                </button>
                <a href="#details" className={styles.detailsLink}>
                  The Details
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="details" className={styles.detailsSection} aria-label="Event details">
          <div className={styles.detailsContent}>
            <h2 className={styles.detailsTitle}>The Details</h2>

            <div className={styles.accordionList}>
              {(detailsAccordionItems as DetailAccordionItem[]).map((item) => {
                const isOpen = openDetailId === item.id;

                return (
                  <article key={item.id} className={styles.accordionItem}>
                    <button
                      type="button"
                      className={styles.accordionTrigger}
                      onClick={() => toggleDetail(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`${item.id}-panel`}
                    >
                      <span>{item.title}</span>
                      <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                    </button>

                    {isOpen ? (
                      <div id={`${item.id}-panel`} className={styles.accordionPanel}>
                        {item.body.map((paragraph, index) => (
                          <p key={`${item.id}-${index}`}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className={styles.carouselRail}>
            <PhotoCarousel photos={carouselPhotos as CarouselPhoto[]} />
          </div>
        </section>

        <section className={`${styles.footerMessage} ${styles.upperText}`} aria-label="Closing message">
          <p>We can&apos;t wait to celebrate with you.</p>
        </section>
      </main>

      <RsvpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
