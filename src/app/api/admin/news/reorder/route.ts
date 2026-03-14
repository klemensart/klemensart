import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, direction } = await req.json() as { id: string; direction: "up" | "down" };

  if (!id || !["up", "down"].includes(direction)) {
    return NextResponse.json({ error: "id ve direction gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Mevcut öğeyi al
  const { data: current } = await admin
    .from("news_items")
    .select("id, newsletter_order")
    .eq("id", id)
    .single();

  if (!current) {
    return NextResponse.json({ error: "Haber bulunamadı." }, { status: 404 });
  }

  // Komşu öğeyi bul
  const { data: neighbor } = await admin
    .from("news_items")
    .select("id, newsletter_order")
    .eq("status", "published")
    .eq("sent_in_newsletter", false)
    [direction === "up" ? "lt" : "gt"]("newsletter_order", current.newsletter_order)
    .order("newsletter_order", { ascending: direction === "down" })
    .limit(1)
    .maybeSingle();

  if (!neighbor) {
    return NextResponse.json({ success: true, message: "Zaten en uçta." });
  }

  // Sıraları değiştir (swap)
  await Promise.all([
    admin.from("news_items").update({ newsletter_order: neighbor.newsletter_order }).eq("id", current.id),
    admin.from("news_items").update({ newsletter_order: current.newsletter_order }).eq("id", neighbor.id),
  ]);

  return NextResponse.json({ success: true });
}
