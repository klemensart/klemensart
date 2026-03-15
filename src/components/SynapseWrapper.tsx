"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Only import SynapseNetwork chunk on desktop — saves ~40KB+ on mobile
const SynapseNetwork = dynamic(() => import("@/components/SynapseNetwork"), {
  ssr: false,
  loading: () => null,
});

export default function SynapseWrapper() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  if (!isDesktop) return null;
  return <SynapseNetwork />;
}
