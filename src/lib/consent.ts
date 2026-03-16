const KEY = "ka_consent";

export function hasConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export function setConsent(value: boolean): void {
  localStorage.setItem(KEY, String(value));
}
