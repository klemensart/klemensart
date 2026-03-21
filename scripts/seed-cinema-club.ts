import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const workshops = [
  {
    id: "a1e2f3d4-5b6c-4d7e-8f9a-0b1c2d3e4f5a",
    title: "Sinema Kulübü — Tekli Oturum",
    description: "Aylık Zoom sinema buluşması (tek seferlik katılım).",
    price_cents: 40000, // 400 TL
    total_sessions: 1,
    is_live: true,
  },
  {
    id: "b2f3a4e5-6c7d-4e8f-9a0b-1c2d3e4f5a6b",
    title: "Sinema Kulübü — Tekli Oturum (Öğrenci)",
    description: "Aylık Zoom sinema buluşması — öğrenci indirimi.",
    price_cents: 15000, // 150 TL
    total_sessions: 1,
    is_live: true,
  },
  {
    id: "c3a4b5f6-7d8e-4f9a-0b1c-2d3e4f5a6b7c",
    title: "Sinema Kulübü — Yıllık Paket (12 Oturum)",
    description: "12 aylık Zoom sinema buluşması paketi (%25 indirimli).",
    price_cents: 360000, // 3.600 TL
    total_sessions: 12,
    is_live: true,
  },
  {
    id: "d4b5c6a7-8e9f-4a0b-1c2d-3e4f5a6b7c8d",
    title: "Sinema Kulübü — Yıllık Paket Öğrenci (12 Oturum)",
    description: "12 aylık Zoom sinema buluşması paketi — öğrenci indirimi (%25 indirimli).",
    price_cents: 135000, // 1.350 TL
    total_sessions: 12,
    is_live: true,
  },
];

async function main() {
  for (const w of workshops) {
    const { error } = await supabase.from("workshops").upsert(
      {
        id: w.id,
        title: w.title,
        description: w.description,
        price_cents: w.price_cents,
        total_sessions: w.total_sessions,
        is_live: w.is_live,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(`HATA [${w.title}]:`, error.message);
    } else {
      console.log(`OK: ${w.title} (${w.price_cents / 100} TL)`);
    }
  }
}

main().catch(console.error);
