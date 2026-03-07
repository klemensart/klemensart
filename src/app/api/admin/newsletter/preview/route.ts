import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin-check";
import { render } from "@react-email/render";
import { templateRegistry, TemplateName } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { template, templateProps } = await req.json();

  if (!template || !(template in templateRegistry)) {
    return NextResponse.json(
      { error: "Gecersiz sablon adi." },
      { status: 400 }
    );
  }

  const entry = templateRegistry[template as TemplateName];
  const html = await render(entry.component(templateProps || {}));

  return NextResponse.json({ html });
}
