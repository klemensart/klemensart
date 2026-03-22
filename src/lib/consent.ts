const KEY = "ka_consent";
const ADMIN_KEY = "ka_no_track";

export function hasConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(ADMIN_KEY) === "true") return false;
  const v = localStorage.getItem(KEY);
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export function setConsent(value: boolean): void {
  localStorage.setItem(KEY, String(value));
  window.dispatchEvent(new Event("consent-changed"));
}
