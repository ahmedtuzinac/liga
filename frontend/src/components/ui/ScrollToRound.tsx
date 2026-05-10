"use client";

import { useEffect } from "react";

export default function ScrollToRound({
  roundNumber,
}: {
  roundNumber: number;
}) {
  useEffect(() => {
    const el = document.getElementById(`round-${roundNumber}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.15;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [roundNumber]);

  return null;
}
