import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const slug = (formData.get("slug") as string) || "genel";
  const bucket = (formData.get("bucket") as string) || "article-images";

  if (!file) {
    return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Dosya boyutu 10MB'dan büyük olamaz" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Sadece jpg, png, webp ve gif formatları kabul edilir" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Dosya adını temizle ve benzersiz yap
  const ext = file.name.split(".").pop() ?? "jpg";
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 60);
  const fileName = `${safeName}-${Date.now()}.${ext}`;
  const storagePath = `${slug}/${fileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const allowedBuckets = new Set(["article-images", "email-assets"]);
  const targetBucket = allowedBuckets.has(bucket) ? bucket : "article-images";

  const { error } = await admin.storage
    .from(targetBucket)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${targetBucket}/${storagePath}`;

  return NextResponse.json({ url: publicUrl, path: storagePath });
}
