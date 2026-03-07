export const categoryStyles: Record<string, {
  accentBg: string;
  iconClass: string;
  linkClass: string;
  filterActive: string;
  filterInactive: string;
  badgeClass: string;
  backHover: string;
}> = {
  "odak": {
    accentBg: "bg-coral",
    iconClass: "text-coral bg-coral/10",
    linkClass: "text-coral",
    filterActive: "bg-coral border-coral text-white",
    filterInactive: "hover:border-coral hover:text-coral",
    badgeClass: "bg-coral/10 text-coral",
    backHover: "hover:text-coral",
  },
  "kultur-sanat": {
    accentBg: "bg-amber-400",
    iconClass: "text-amber-600 bg-amber-50",
    linkClass: "text-amber-600",
    filterActive: "bg-amber-400 border-amber-400 text-white",
    filterInactive: "hover:border-amber-400 hover:text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700",
    backHover: "hover:text-amber-600",
  },
  "ilham-verenler": {
    accentBg: "bg-sky-400",
    iconClass: "text-sky-600 bg-sky-50",
    linkClass: "text-sky-600",
    filterActive: "bg-sky-400 border-sky-400 text-white",
    filterInactive: "hover:border-sky-400 hover:text-sky-600",
    badgeClass: "bg-sky-50 text-sky-700",
    backHover: "hover:text-sky-600",
  },
  "kent-yasam": {
    accentBg: "bg-emerald-500",
    iconClass: "text-emerald-600 bg-emerald-50",
    linkClass: "text-emerald-600",
    filterActive: "bg-emerald-500 border-emerald-500 text-white",
    filterInactive: "hover:border-emerald-500 hover:text-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700",
    backHover: "hover:text-emerald-600",
  },
};
