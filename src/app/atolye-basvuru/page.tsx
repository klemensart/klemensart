import type { Metadata } from "next";
import AtolyeBasvuruClient from "./AtolyeBasvuruClient";

export const metadata: Metadata = {
  title: "Atölye Düzenleyici Başvurusu | Klemens",
  description:
    "Klemens marketplace'inde atölye düzenlemek ister misiniz? Başvuru formu ile bize ulaşın.",
};

export default function AtolyeBasvuruPage() {
  return <AtolyeBasvuruClient />;
}
