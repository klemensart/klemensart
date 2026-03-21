import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function main() {
  // Selin Ozger icin email logu var mi?
  const { data: selinEmails } = await supabase
    .from("email_logs")
    .select("*")
    .eq("subscriber_email", "selinnozgerr@gmail.com");
  console.log("=== Selin Ozger email loglari ===");
  console.log("Kayit sayisi:", selinEmails?.length || 0);
  if (selinEmails) {
    for (const e of selinEmails) {
      console.log(JSON.stringify(e));
    }
  }

  // Tum Atolye tessekkur mailleri
  const { data: thankYou } = await supabase
    .from("email_logs")
    .select("*")
    .ilike("subject", "%tolye%");
  console.log("\n=== Tum Atolye mailleri ===");
  console.log("Kayit sayisi:", thankYou?.length || 0);
  if (thankYou) {
    for (const e of thankYou) {
      console.log(`  ${e.sent_at} | ${e.subscriber_email} | ${e.subject}`);
    }
  }

  // Toplam email log sayisi
  const { count } = await supabase
    .from("email_logs")
    .select("*", { count: "exact", head: true });
  console.log("\nToplam email log:", count);

  // Diger atolye alicilarina mail gitmis mi?
  const buyers = [
    "selinnozgerr@gmail.com",
    "drozlembuyukocak79@gmail.com",
    "ferhathmanav@gmail.com",
    "gozdenurs@gmail.com",
    "aydas.sedef@gmail.com",
  ];

  console.log("\n=== Alicilara giden tum mailler ===");
  for (const email of buyers) {
    const { data } = await supabase
      .from("email_logs")
      .select("subscriber_email, subject, sent_at")
      .eq("subscriber_email", email);
    if (data && data.length > 0) {
      for (const e of data) {
        console.log(`  ${e.subscriber_email} | ${e.subject} | ${e.sent_at}`);
      }
    } else {
      console.log(`  ${email} | HIC MAIL GITMEMIS`);
    }
  }
}
main().catch(console.error);
