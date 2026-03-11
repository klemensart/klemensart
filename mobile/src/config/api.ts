/* ─── API Konfigürasyonu ─── */

import Constants from "expo-constants";

// Expo Go fiziksel cihazda: Metro dev server'ın IP'sini otomatik al
// Emülatörde veya bulunamazsa fallback: prod URL
const devHost = Constants.expoConfig?.hostUri?.split(":")[0];

export const API_BASE_URL = __DEV__ && devHost
  ? `http://${devHost}:3000`
  : "https://klemensart.com";

export const SUPABASE_URL = "https://sgabkrzzzszfqrtgkord.supabase.co";
export const SUPABASE_ANON_KEY =
  "sb_publishable_JIP7I0tn7jJHfE8C9iPXQQ_esc316ua";
