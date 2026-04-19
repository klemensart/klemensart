import Link from "next/link";
import type { PersonSummary } from "@/types/people";

function getInitials(name: string) {
  const words = name.split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Klemens varyantı — tıklanmaz */
function KlemensCard() {
  return (
    <div className="rounded-2xl bg-warm-50 p-6">
      <div className="text-xs uppercase tracking-wider text-brand-warm mb-2">
        Düzenleyen
      </div>
      <div className="font-bold text-lg text-warm-900">Klemens</div>
      <p className="text-sm text-brand-warm mt-2 leading-relaxed">
        Klemens editöryal ekibi tarafından düzenlenmektedir.
      </p>
    </div>
  );
}

/** Bağımsız eğitmen varyantı — profil linkli */
function IndependentCard({ host }: { host: PersonSummary }) {
  return (
    <Link href={`/egitmenler/${host.slug}`} className="block group">
      <div className="rounded-2xl bg-warm-50 p-6 hover:bg-warm-100 transition-colors">
        <div className="text-xs uppercase tracking-wider text-brand-warm mb-3">
          Düzenleyen
        </div>
        <div className="flex items-center gap-3">
          {host.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={host.avatar_url}
              alt={host.name}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-warm-100 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-warm font-bold text-lg">
                {getInitials(host.name)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-base text-warm-900 group-hover:text-coral transition-colors truncate">
              {host.name}
            </div>
            {host.short_bio && (
              <div className="text-xs text-brand-warm mt-1 line-clamp-1">
                {host.short_bio}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 text-sm text-coral group-hover:underline">
          Profili gör →
        </div>
      </div>
    </Link>
  );
}

export default function HostCard({
  host,
  isKlemens,
}: {
  host: PersonSummary | null;
  isKlemens: boolean;
}) {
  if (isKlemens) return <KlemensCard />;
  if (!host) return null;
  return <IndependentCard host={host} />;
}
