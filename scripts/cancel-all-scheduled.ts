// Tüm planlanmış mailleri iptal et (yeniden göndermeden)
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

async function main() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const mapPath = path.join(process.cwd(), "scripts/ab-test-map.json");
  const abMap = JSON.parse(await readFile(mapPath, "utf-8"));
  const allIds = [...abMap.groupA.resendIds, ...abMap.groupB.resendIds];

  console.log(`Toplam iptal edilecek: ${allIds.length} mail`);

  let cancelled = 0;
  let alreadyCancelled = 0;
  let failed = 0;

  for (let i = 0; i < allIds.length; i++) {
    try {
      await resend.emails.cancel(allIds[i]);
      cancelled++;
    } catch (e: any) {
      // Zaten iptal edilmiş olabilir
      if (e.message?.includes("already") || e.statusCode === 422) {
        alreadyCancelled++;
      } else {
        failed++;
        if (failed <= 3) console.error(`  Hata [${allIds[i]}]: ${e.message}`);
      }
    }
    if ((i + 1) % 100 === 0 || i === allIds.length - 1) {
      process.stdout.write(`\r  İlerleme: ${i + 1}/${allIds.length} (${cancelled} iptal, ${alreadyCancelled} zaten iptal, ${failed} hata)`);
    }
    if (i < allIds.length - 1) await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n\nSonuç: ${cancelled} iptal edildi, ${alreadyCancelled} zaten iptal, ${failed} hata`);

  // email_logs ve campaign temizle
  await supabase.from("email_logs").delete().eq("subject", "Tuz Bülteni — Sayı 02");
  await supabase.from("campaigns").delete().eq("subject", "Tuz Bülteni — Sayı 02");
  console.log("email_logs ve campaign kayıtları silindi.");
}

main().catch((e) => { console.error(e); process.exit(1); });
