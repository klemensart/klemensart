import { createAdminClient } from "@/lib/supabase-admin";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klemensart.com";

export type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
  source: string;
  weekly_subscribed: boolean;
  thematic_subscribed: boolean;
  preference_token: string;
};

export async function getSubscriberByToken(
  token: string,
): Promise<Subscriber | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("subscribers")
    .select("*")
    .eq("preference_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return data as Subscriber;
}

export async function updateSubscriberPreferences(
  token: string,
  preferences: { weekly?: boolean; thematic?: boolean },
): Promise<boolean> {
  const admin = createAdminClient();

  const weekly = preferences.weekly;
  const thematic = preferences.thematic;

  // Eğer ikisi de false → tamamen unsubscribe
  const bothFalse = weekly === false && thematic === false;

  const updatePayload: Record<string, unknown> = {};
  if (weekly !== undefined) updatePayload.weekly_subscribed = weekly;
  if (thematic !== undefined) updatePayload.thematic_subscribed = thematic;
  if (bothFalse) updatePayload.is_active = false;

  const { error } = await admin
    .from("subscribers")
    .update(updatePayload)
    .eq("preference_token", token);

  return !error;
}

export function buildPreferenceUrl(token: string): string {
  return `${BASE_URL}/bulten/tercih?token=${token}`;
}
