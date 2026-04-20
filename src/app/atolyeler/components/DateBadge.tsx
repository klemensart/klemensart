import { getTurkeyDateParts } from "@/lib/dates";

const MONTHS = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];

type Props = { date: string; endDate?: string | null; size?: "sm" | "lg" };

export default function DateBadge({ date, endDate, size = "sm" }: Props) {
  const start = getTurkeyDateParts(date);
  const end = endDate ? getTurkeyDateParts(endDate) : null;
  const isLg = size === "lg";

  const isMultiDay = end && (end.day !== start.day || end.month !== start.month);

  return (
    <div className={`flex flex-col items-center justify-center bg-coral text-white rounded-lg leading-none ${
      isLg ? "min-w-[72px] px-4 py-3" : "min-w-[44px] px-2 py-1.5"
    }`}>
      <span className={`font-semibold uppercase tracking-wide ${isLg ? "text-sm" : "text-[10px]"}`}>
        {MONTHS[start.month]}
      </span>
      <span className={`font-bold ${isLg ? "text-3xl" : "text-lg"}`}>
        {isMultiDay ? `${start.day}–${end!.day}` : start.day}
      </span>
    </div>
  );
}
