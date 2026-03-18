import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const EXCLUDE = [
  "test@meta.com",
  "fery04@gmail.comf",
  "aoby09@gmail.com.mesaj.atin.cebe.aramayin",
];
function isValid(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && !EXCLUDE.includes(e);
}

async function main() {
  const { data: leads } = await sb
    .from("meta_leads")
    .select("email,name,created_at")
    .order("created_at", { ascending: false });

  const { data: mcSubs } = await sb
    .from("subscribers")
    .select("email")
    .eq("source", "mailchimp_import");

  const mcEmails = new Set(
    (mcSubs || []).map((s) => s.email?.toLowerCase())
  );

  const needsMail = (leads || []).filter(
    (l) => !mcEmails.has(l.email?.toLowerCase()) && isValid(l.email)
  );
  const alreadyHad = (leads || []).filter((l) =>
    mcEmails.has(l.email?.toLowerCase())
  );

  console.log("Toplam meta lead:", leads?.length);
  console.log("Mailchimp'te zaten var (rehberi almis):", alreadyHad.length);
  console.log("Yeni kisiler (mail gonderilmesi gereken):", needsMail.length);
  console.log("");
  console.log("Son 15 yeni kisi:");
  for (const l of needsMail.slice(0, 15)) {
    console.log(
      " ",
      l.created_at?.substring(0, 16),
      "|",
      l.email,
      "|",
      l.name || "-"
    );
  }
}
main();
