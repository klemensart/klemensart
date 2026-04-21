import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const meta = (user.user_metadata as Record<string, unknown>) ?? {};

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? "",
      name: (meta.full_name as string) ?? (meta.name as string) ?? "",
    },
  });
}
