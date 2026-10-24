"use client";

import confetti from "canvas-confetti";

export function triggerConfetti() {
  if (typeof window === "undefined") return;

  try {
    // Left explosion
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#4f46e5", "#10b981", "#f59e0b", "#ec4899"],
    });

    // Right explosion
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#4f46e5", "#10b981", "#f59e0b", "#ec4899"],
    });
  } catch (e) {
    // Ignore if canvas-confetti is not loaded
  }
}
