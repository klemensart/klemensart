"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/track";

export default function WorkshopViewTracker({
  workshopId,
  workshopSlug,
}: {
  workshopId: string;
  workshopSlug: string;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("workshop_view", { workshopId, workshopSlug });
  }, [workshopId, workshopSlug]);

  return null;
}
