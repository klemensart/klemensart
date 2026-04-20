import type { Metadata } from "next";
import { Suspense } from "react";
import TercihForm from "./TercihForm";

export const metadata: Metadata = {
  title: "Bülten Tercihlerim — Klemens Art",
  description: "Klemens Art bülten abonelik tercihlerini yönet.",
  robots: { index: false, follow: false },
};

export default function TercihPage() {
  return (
    <Suspense>
      <TercihForm />
    </Suspense>
  );
}
