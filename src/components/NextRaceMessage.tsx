"use client";

import { useEffect, useState } from "react";

function findFirstSaturdayInJune(year: number): number {
  const june1 = new Date(year, 5, 1);
  const dayOfWeek = june1.getDay();
  return 1 + ((6 - dayOfWeek + 7) % 7);
}

function getNextRaceDate(): { day: number; year: number } {
  const now = new Date();
  const year = now.getFullYear();
  const firstSat = findFirstSaturdayInJune(year);
  const cutoff = new Date(year, 5, firstSat, 12, 0, 0);

  if (now < cutoff) {
    return { day: firstSat, year };
  }
  return { day: findFirstSaturdayInJune(year + 1), year: year + 1 };
}

export function NextRaceMessage() {
  const [nextRace, setNextRace] = useState<{ day: number; year: number } | null>(null);

  useEffect(() => {
    setNextRace(getNextRaceDate());
  }, []);

  if (!nextRace) return null;

  return <>Håper vi ser deg lørdag {nextRace.day}. juni {nextRace.year}!</>;
}
