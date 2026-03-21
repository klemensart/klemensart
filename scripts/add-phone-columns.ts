import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

async function runSQL(sql: string) {
  // Use the Supabase REST SQL endpoint (PostgREST rpc)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  return { status: res.status, body: await res.text() };
}

async function main() {
  // Try the management API approach
  const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");
  console.log("Project ref:", projectRef);

  // Direct approach: use pg module if available, otherwise use supabase query endpoint
  const sqls = [
    "ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS phone TEXT;",
    "ALTER TABLE purchases ADD COLUMN IF NOT EXISTS phone TEXT;",
  ];

  for (const sql of sqls) {
    console.log(`\nRunning: ${sql}`);

    // Try via the SQL editor API
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ query: sql }),
    });

    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Response:", body.slice(0, 200));
  }
}
main().catch(console.error);
