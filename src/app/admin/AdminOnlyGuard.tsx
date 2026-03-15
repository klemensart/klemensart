import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAdminRole } from "@/lib/admin-check";

/**
 * Server component — sadece admin rolüne sahip kullanıcılara izin verir.
 * Editor'ler uyarı mesajı görür.
 */
export default async function AdminOnlyGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/club/giris");

  const role = await getAdminRole(user.id);

  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-warm-900/40"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-warm-900">
            Yalnızca Adminlere Açık
          </h2>
          <p className="text-warm-900/50 text-sm leading-relaxed">
            Bu alan yalnızca admin yetkisine sahip kullanıcılara açıktır.
            Erişim gerekiyorsa lütfen bir admin ile iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
