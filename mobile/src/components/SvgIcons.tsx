/* ─── Harita Marker SVG İkonları (7 tip) ─── */

import React from "react";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";

type IconProps = { size?: number; color?: string };

/** Müze — klasik bina */
export function MuseumIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21h18M4 18h16M5 14v4M9 14v4M15 14v4M19 14v4M12 3L2 10h20L12 3z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Galeri — resim çerçevesi */
export function GalleryIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={3}
        width={18}
        height={18}
        rx={2}
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M3 16l5-5 4 4 3-3 6 6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={8.5} cy={8.5} r={1.5} fill={color} />
    </Svg>
  );
}

/** Konser — nota */
export function ConcertIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18V5l12-2v13"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={6} cy={18} r={3} stroke={color} strokeWidth={1.8} />
      <Circle cx={18} cy={16} r={3} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

/** Tiyatro — maske */
export function TheaterIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 4a2 2 0 012-2h5a2 2 0 012 2v5a6 6 0 01-6 6H4a2 2 0 01-2-2V4z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M5 8h.01M8 8h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M5 11a2 2 0 004 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M13 4a2 2 0 012-2h5a2 2 0 012 2v5a6 6 0 01-6 6h-1a2 2 0 01-2-2V4z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M16 8h.01M19 8h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M19 11a2 2 0 01-4 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

/** Tarihi — kale/burç */
export function HistoricIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21V8l4-4 2 2 3-3 3 3 2-2 4 4v13H3z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={8} y={14} width={3} height={7} stroke={color} strokeWidth={1.5} />
      <Rect x={13} y={14} width={3} height={4} rx={1.5} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

/** Edebiyat — kitap */
export function LiteraryIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

/** Kültürel Miras — kalkan/miras */
export function HeritageIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 8v4M12 16h.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Tip → İkon mapping */
export const TYPE_ICONS: Record<string, React.FC<IconProps>> = {
  müze: MuseumIcon,
  galeri: GalleryIcon,
  konser: ConcertIcon,
  tiyatro: TheaterIcon,
  tarihi: HistoricIcon,
  edebiyat: LiteraryIcon,
  miras: HeritageIcon,
};
