import DuyuruBulteni from "@/emails/DuyuruBulteni";
import HosGeldiniz from "@/emails/HosGeldiniz";
import SeminerHatirlatici from "@/emails/SeminerHatirlatici";
import EtkinlikTesekkur from "@/emails/EtkinlikTesekkur";
import AtolyeHazirlik from "@/emails/AtolyeHazirlik";
import AylikAjanda from "@/emails/AylikAjanda";
import YarimKalanKayit from "@/emails/YarimKalanKayit";
import AtolyeTesekkur from "@/emails/AtolyeTesekkur";
import BultenTesekkur from "@/emails/BultenTesekkur";

export type TemplateName =
  | "DuyuruBulteni"
  | "HosGeldiniz"
  | "SeminerHatirlatici"
  | "EtkinlikTesekkur"
  | "AtolyeHazirlik"
  | "AylikAjanda"
  | "YarimKalanKayit"
  | "AtolyeTesekkur"
  | "BultenTesekkur";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TemplateEntry = {
  component: (props: any) => React.ReactElement;
  defaultSubject: string;
};

export const templateRegistry: Record<TemplateName, TemplateEntry> = {
  DuyuruBulteni: {
    component: DuyuruBulteni,
    defaultSubject: "Klemens Art'tan Yeni Duyuru",
  },
  HosGeldiniz: {
    component: HosGeldiniz,
    defaultSubject: "Klemens Art'a Hos Geldiniz",
  },
  SeminerHatirlatici: {
    component: SeminerHatirlatici,
    defaultSubject: "Hatirlatma: Yarin Bulusuyoruz",
  },
  EtkinlikTesekkur: {
    component: EtkinlikTesekkur,
    defaultSubject: "Tesekkurler — Kayit ve Bibliyografya",
  },
  AtolyeHazirlik: {
    component: AtolyeHazirlik,
    defaultSubject: "Atolye Hazirlik Kiti",
  },
  AylikAjanda: {
    component: AylikAjanda,
    defaultSubject: "Bu Ay Klemens Art'ta",
  },
  YarimKalanKayit: {
    component: YarimKalanKayit,
    defaultSubject: "Kaydinizi Tamamlayin",
  },
  AtolyeTesekkur: {
    component: AtolyeTesekkur,
    defaultSubject: "Atölye Satın Alma Onayı — Klemens Art",
  },
  BultenTesekkur: {
    component: BultenTesekkur,
    defaultSubject: "E-Bültenimize Hoş Geldiniz — Klemens Art",
  },
};
