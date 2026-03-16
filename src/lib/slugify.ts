import { SupabaseClient } from "@supabase/supabase-js";

const TR_MAP: Record<string, string> = {
  ğ: "g", Ğ: "G", ü: "u", Ü: "U", ş: "s", Ş: "S",
  ı: "i", İ: "I", ö: "o", Ö: "O", ç: "c", Ç: "C",
};

export function slugify(text: string): string {
  let s = text;
  for (const [from, to] of Object.entries(TR_MAP)) {
    s = s.replaceAll(from, to);
  }
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function generateUniqueSlug(
  title: string,
  publishedAt: string | null,
  supabase: SupabaseClient,
): Promise<string> {
  const base = slugify(title);
  const dateSuffix = publishedAt
    ? `-${publishedAt.slice(0, 10).replace(/-/g, "")}`
    : `-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;

  let candidate = `${base}${dateSuffix}`;

  for (let i = 0; i < 10; i++) {
    const { data } = await supabase
      .from("news_items")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) return candidate;
    candidate = `${base}${dateSuffix}-${i + 2}`;
  }

  return `${base}${dateSuffix}-${Date.now()}`;
}
