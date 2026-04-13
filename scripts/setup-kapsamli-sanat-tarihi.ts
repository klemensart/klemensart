import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const WORKSHOP_ID = "75468e8b-5de7-4f69-95f2-c8132778cf6a";

const sessions = [
  { session_number: 1, title: "Antik Yunan ve Roma Sanatı" },
  { session_number: 2, title: "Ortaçağ: Bizans, Roman ve Gotik" },
  { session_number: 3, title: "Rönesans: Yeniden Doğuş" },
  { session_number: 4, title: "Barok ve Rokoko" },
  { session_number: 5, title: "Neoklasizm ve Romantizm" },
  { session_number: 6, title: "Realizm ve Empresyonizm" },
  { session_number: 7, title: "Post-Empresyonizm ve Art Nouveau" },
  { session_number: 8, title: "Avangard Patlamalar: Kübizm, Ekspresyonizm, Dadaizm" },
  { session_number: 9, title: "Sürrealizm'den Soyut Ekspresyonizm'e" },
  { session_number: 10, title: "Çağdaş Sanat Panoraması" },
];

async function main() {
  console.log("1) Workshop kaydı güncelleniyor...");

  const { error: wErr } = await supabase
    .from("workshops")
    .update({
      title: "Kapsamlı Sanat Tarihi Atölyesi",
      next_session_date: "2026-05-07T20:30:00+03:00",
      total_sessions: 10,
      is_live: true,
    })
    .eq("id", WORKSHOP_ID);

  if (wErr) {
    console.error("Workshop güncelleme hatası:", wErr);
    process.exit(1);
  }
  console.log("   Workshop güncellendi.");

  console.log("2) Mevcut oturumlar temizleniyor...");

  const { error: delErr } = await supabase
    .from("workshop_sessions")
    .delete()
    .eq("workshop_id", WORKSHOP_ID);

  if (delErr) {
    console.error("Session silme hatası:", delErr);
    process.exit(1);
  }
  console.log("   Mevcut oturumlar temizlendi.");

  console.log("3) Yeni oturumlar ekleniyor...");

  const rows = sessions.map((s) => ({
    workshop_id: WORKSHOP_ID,
    session_number: s.session_number,
    title: s.title,
    status: "upcoming",
    is_published: false,
  }));

  const { error: sErr } = await supabase
    .from("workshop_sessions")
    .insert(rows);

  if (sErr) {
    console.error("Session ekleme hatası:", sErr);
    process.exit(1);
  }
  console.log("   10 oturum eklendi.");

  console.log("\nTamamlandı!");
}

main();
