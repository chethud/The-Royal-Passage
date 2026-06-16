import { useEffect, useState } from "react";
import { todayIsoDate } from "@/lib/booking-window";

/** Local calendar date (YYYY-MM-DD), refreshed periodically so the booking window rolls forward. */
export function useTodayIsoDate(): string {
  const [today, setToday] = useState(todayIsoDate);

  useEffect(() => {
    const sync = () => {
      const next = todayIsoDate();
      setToday((prev) => (prev === next ? prev : next));
    };

    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return today;
}
