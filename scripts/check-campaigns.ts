import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data } = await sb.from("campaigns").select("id, subject, template_name, is_public, created_at").order("created_at", { ascending: false }).limit(10);
  console.log(JSON.stringify(data, null, 2));
}
main();
