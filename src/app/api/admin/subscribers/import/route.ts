import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscribers } = await req.json();

  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return NextResponse.json(
      { error: "Geçerli abone listesi gerekli." },
      { status: 400 }
    );
  }

  const rows = subscribers
    .filter((s: { email?: string }) => s.email && typeof s.email === "string")
    .map((s: { email: string; name?: string }) => ({
      email: s.email.trim().toLowerCase(),
      name: s.name?.trim() || null,
      source: "mailchimp_import",
    }));

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Geçerli e-posta bulunamadı." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("subscribers")
    .upsert(rows, { onConflict: "email", ignoreDuplicates: true })
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: `Veritabanı hatası: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `${data?.length ?? 0} abone başarıyla içe aktarıldı!`,
    imported: data?.length ?? 0,
  });
}
