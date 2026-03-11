/* ─── Klemens Art — Tema Konfigürasyonu ─── */

export const COLORS = {
  coral: "#FF6D60",
  cream: "#FFFBF7",
  dark: "#2D2926",
  warm: "#8C857E",
  light: "#F5F0EB",
  white: "#FFFFFF",
  black: "#000000",
  success: "#4CAF50",
  error: "#E53935",
  warning: "#FFB300",

  // Tip renkleri (harita marker)
  type: {
    müze: "#4A9EFF",
    galeri: "#FF6D60",
    konser: "#9B6BB0",
    tiyatro: "#4CAF50",
    tarihi: "#FFB300",
    edebiyat: "#8B5CF6",
    miras: "#795548",
  } as Record<string, string>,
} as const;

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 32,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
