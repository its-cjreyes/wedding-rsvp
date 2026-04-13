"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import styles from "./PhotoCarousel.module.scss";

export type CarouselPhoto = {
  src: string;
  alt: string;
  caption: string;
};

type PhotoCarouselProps = {
  photos: CarouselPhoto[];
};

const TRANSITION_MS = 340;
const CURSOR_SIZE = 50;
const SWIPE_THRESHOLD_PX = 40;
type Direction = "next" | "prev";

export function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const hasPhotos = photos.length > 0;
  const hasMultiple = photos.length > 1;

  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [slotIndices, setSlotIndices] = useState<[number, number]>([0, hasMultiple ? 1 : 0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCaptionFading, setIsCaptionFading] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [isCursorPressed, setIsCursorPressed] = useState(false);
  const [cursorDirection, setCursorDirection] = useState<Direction>("next");
  const [cursorPosition, setCursorPosition] = useState({ x: CURSOR_SIZE / 2, y: CURSOR_SIZE / 2 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  const activeIndex = slotIndices[activeSlot];
  const incomingSlot = activeSlot === 0 ? 1 : 0;
  const runTransition = (direction: Direction) => {
    if (!hasMultiple || isAnimating) {
      return;
    }

    const targetCaptionIndex =
      direction === "next"
        ? (activeIndex + 1) % photos.length
        : (activeIndex - 1 + photos.length) % photos.length;

    setSlotIndices((currentIndices) => {
      const updated: [number, number] = [...currentIndices] as [number, number];
      updated[incomingSlot] = targetCaptionIndex;
      return updated;
    });

    setIsAnimating(true);
    setIsCaptionFading(true);

    window.setTimeout(() => {
      setCaptionIndex(targetCaptionIndex);
      setIsCaptionFading(false);
    }, TRANSITION_MS / 2);

    window.setTimeout(() => {
      setActiveSlot((currentActiveSlot) => {
        const oldActiveSlot = currentActiveSlot;
        const oldIncomingSlot = oldActiveSlot === 0 ? 1 : 0;

        setSlotIndices((currentIndices) => {
          const updated: [number, number] = [...currentIndices] as [number, number];
          const promotedIndex = currentIndices[oldIncomingSlot];
          updated[oldActiveSlot] =
            direction === "next"
              ? (promotedIndex + 1) % photos.length
              : (promotedIndex - 1 + photos.length) % photos.length;
          return updated;
        });

        return oldIncomingSlot as 0 | 1;
      });

      setIsAnimating(false);
    }, TRANSITION_MS);
  };

  const updateCursorPosition = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;

    setCursorPosition({
      x: relativeX,
      y: event.clientY - rect.top,
    });

    setCursorDirection(relativeX < rect.width / 2 ? "prev" : "next");
  };

  const onStackClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (!hasMultiple) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const direction: Direction = relativeX < rect.width / 2 ? "prev" : "next";

    setCursorDirection(direction);
    runTransition(direction);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (!hasMultiple) {
      return;
    }

    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (!hasMultiple || !touchStartRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only react to intentional horizontal swipes.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    suppressClickRef.current = true;
    const direction: Direction = deltaX < 0 ? "next" : "prev";
    runTransition(direction);
  };

  if (!hasPhotos) {
    return null;
  }

  const captionPhoto = photos[captionIndex];

  return (
    <div className={styles.carousel}>
      <button
        type="button"
        className={styles.stackButton}
        onClick={onStackClick}
        onMouseEnter={(event) => {
          if (!hasMultiple) {
            return;
          }

          setIsCursorVisible(true);
          updateCursorPosition(event);
        }}
        onMouseMove={updateCursorPosition}
        onMouseLeave={() => {
          setIsCursorVisible(false);
          setIsCursorPressed(false);
        }}
        onMouseDown={() => setIsCursorPressed(true)}
        onMouseUp={() => setIsCursorPressed(false)}
        onBlur={() => setIsCursorPressed(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label="Show next photo"
      >
        {[0, 1].map((slot) => {
          const photo = photos[slotIndices[slot]];
          const isSlotActive = slot === activeSlot;
          const isSlotOutgoing = isAnimating && isSlotActive;
          const isSlotIncoming = isAnimating && slot === incomingSlot;

          return (
            <div
              key={`slot-${slot}-${photo.src}`}
              className={[
                styles.photoLayer,
                slot === 0 ? styles.tiltFront : styles.tiltBack,
                isSlotActive ? styles.active : styles.inactive,
                isSlotOutgoing ? styles.outgoing : "",
                isSlotIncoming ? styles.incoming : "",
              ].join(" ")}
            >
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 850px) 100vw, 480px" />
            </div>
          );
        })}

        {hasMultiple ? (
          <span
            className={[
              styles.customCursor,
              isCursorVisible ? styles.customCursorVisible : "",
              isCursorPressed ? styles.customCursorPressed : "",
            ].join(" ")}
            style={{ left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px` }}
            aria-hidden="true"
          >
            {cursorDirection}
          </span>
        ) : null}
      </button>

      <div className={styles.captionWrap} aria-live="polite">
        <p className={`${styles.caption} ${isCaptionFading ? styles.captionOut : styles.captionIn}`}>
          {captionPhoto.caption}
        </p>
      </div>

      {hasMultiple ? <span className={styles.nextHint} aria-hidden="true" /> : null}
    </div>
  );
}
