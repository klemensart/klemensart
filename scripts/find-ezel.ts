import * as dotenv from "dotenv";
dotenv.config({ path: "/Volumes/PortableSSD/klemensart/.env.local" });
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
(async () => {
  // people tablosu
  const { data: people } = await supabase.from("people").select("name, email, instagram").ilike("name", "%Ezel%");
  console.log("people tablosu (Ezel):", JSON.stringify(people, null, 2));
  // articles'ta Ezel'in tüm yazılarındaki author_email
  const { data: arts } = await supabase.from("articles").select("title, author, author_email, author_ig").ilike("author", "%Ezel%");
  console.log("\narticles (Ezel):");
  for (const a of arts || []) console.log(`  ${a.author} | mail: ${a.author_email||"yok"} | ig: ${a.author_ig||"yok"} | ${a.title.slice(0,30)}`);
})();
