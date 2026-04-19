const MONTHS = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];

type Props = { date: string; size?: "sm" | "lg" };

export default function DateBadge({ date, size = "sm" }: Props) {
  const d = new Date(date);
  const isLg = size === "lg";
  return (
    <div className={`flex flex-col items-center justify-center bg-coral text-white rounded-lg leading-none ${
      isLg ? "min-w-[72px] px-4 py-3" : "min-w-[44px] px-2 py-1.5"
    }`}>
      <span className={`font-semibold uppercase tracking-wide ${isLg ? "text-sm" : "text-[10px]"}`}>
        {MONTHS[d.getMonth()]}
      </span>
      <span className={`font-bold ${isLg ? "text-3xl" : "text-lg"}`}>
        {d.getDate()}
      </span>
    </div>
  );
}
