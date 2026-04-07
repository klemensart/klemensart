"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/track";

type Props = {
  workshopId: string;
  amount: number;
  workshopTitle: string;
  workshopSlug?: string;
  label?: string;
  size?: "normal" | "large";
};

const B = { coral: "#FF6D60", dark: "#2D2926" };

export default function SatinAlButton({
  workshopId,
  amount,
  workshopTitle,
  workshopSlug,
  label = "Satın Al",
  size = "normal",
}: Props) {
  const router = useRouter();

  async function handleClick() {
    trackEvent("add_to_cart", { workshopId, workshopSlug });
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "AddToCart", {
        content_name: workshopTitle,
        content_ids: [workshopId],
        content_type: "product",
        value: amount / 100,
        currency: "TRY",
      });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const slugParam = workshopSlug ? `&slug=${encodeURIComponent(workshopSlug)}` : "";
    const payUrl = `/club/odeme/${workshopId}?amount=${amount}&title=${encodeURIComponent(workshopTitle)}${slugParam}`;

    if (!user) {
      router.push(`/club/giris?redirect=${encodeURIComponent(payUrl)}`);
      return;
    }

    router.push(payUrl);
  }

  const pad = size === "large" ? "14px 40px" : "11px 28px";
  const fontSize = size === "large" ? 17 : 15;

  return (
    <button
      onClick={handleClick}
      style={{
        background: B.coral,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: pad,
        fontSize,
        fontWeight: 700,
        cursor: "pointer",
        letterSpacing: "0.01em",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
    >
      {label}
    </button>
  );
}
