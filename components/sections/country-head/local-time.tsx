"use client";

import { useEffect, useState } from "react";

/**
 * The only client-side part of a country page. Rendered empty on the server
 * because the visitor's clock is not knowable there — guessing it produces a
 * hydration mismatch on every load.
 */
export function LocalTime({ utcOffset }: { utcOffset: number }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
      const there = new Date(utcMs + utcOffset * 3_600_000);
      setTime(
        `${String(there.getHours()).padStart(2, "0")}:${String(there.getMinutes()).padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [utcOffset]);

  return <span className="tabular-nums">{time ?? "--:--"}</span>;
}
