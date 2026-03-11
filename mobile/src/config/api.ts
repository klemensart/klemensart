/* ─── API Konfigürasyonu ─── */

import { Platform } from "react-native";

// Geliştirme: Android emülatör → 10.0.2.2, iOS simülatör → localhost
const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000`
  : "https://klemensart.com";

export const SUPABASE_URL = "https://sgabkrzzzszfqrtgkord.supabase.co";
export const SUPABASE_ANON_KEY =
  "sb_publishable_JIP7I0tn7jJHfE8C9iPXQQ_esc316ua";
