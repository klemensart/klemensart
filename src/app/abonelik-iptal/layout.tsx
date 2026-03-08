import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonelikten Çıkış",
  description: "Klemens bülten aboneliğinizi iptal edin.",
  robots: { index: false, follow: false },
};

export default function AbonelikIptalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
