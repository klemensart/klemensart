import type { Metadata } from "next";
import { getAllArticlesMetadata } from "@/lib/markdown";
import HakkimizdaClient from "@/components/HakkimizdaClient";

export const metadata: Metadata = {
  title: "Hakkımızda — Klemens",
  description:
    "Klemens ekibini tanıyın. Sanat, kültür ve düşünce dünyasına birbirine bağlı zihinlerle yaklaşan bir kolektif.",
};

export default async function HakkimizdaPage() {
  const articles = await getAllArticlesMetadata();
  return <HakkimizdaClient articles={articles} />;
}
