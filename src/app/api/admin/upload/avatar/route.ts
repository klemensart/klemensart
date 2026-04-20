import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const personId = formData.get("personId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Dosya boyutu 5MB'dan büyük olamaz" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Sadece jpg, png ve webp formatları kabul edilir" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // If personId provided, delete old avatar
  if (personId) {
    const { data: existing } = await admin
      .from("people")
      .select("avatar_url")
      .eq("id", personId)
      .single();

    if (existing?.avatar_url) {
      const oldPath = existing.avatar_url.split("/people-avatars/")[1];
      if (oldPath) {
        await admin.storage.from("people-avatars").remove([oldPath]);
      }
    }
  }

  // Upload new avatar
  const ext = file.name.split(".").pop() ?? "jpg";
  const safeName = (personId || "temp").replace(/[^a-zA-Z0-9_-]/g, "-");
  const fileName = `${safeName}-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from("people-avatars")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/people-avatars/${fileName}`;

  // Update person's avatar_url if personId provided
  if (personId) {
    await admin
      .from("people")
      .update({ avatar_url: url, updated_at: new Date().toISOString() })
      .eq("id", personId);
  }

  return NextResponse.json({ url });
}
