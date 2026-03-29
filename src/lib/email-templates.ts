import DuyuruBulteni from "@/emails/DuyuruBulteni";

import SeminerHatirlatici from "@/emails/SeminerHatirlatici";
import EtkinlikTesekkur from "@/emails/EtkinlikTesekkur";
import AtolyeHazirlik from "@/emails/AtolyeHazirlik";
import AylikAjanda from "@/emails/AylikAjanda";
import YarimKalanKayit from "@/emails/YarimKalanKayit";
import AtolyeTesekkur from "@/emails/AtolyeTesekkur";
import BultenTesekkur from "@/emails/BultenTesekkur";
import StoryBildirimi from "@/emails/StoryBildirimi";
import HaberlerBulteni from "@/emails/HaberlerBulteni";
import DogumGunuTebrik from "@/emails/DogumGunuTebrik";

export type TemplateName =
  | "DuyuruBulteni"
  | "SeminerHatirlatici"
  | "EtkinlikTesekkur"
  | "AtolyeHazirlik"
  | "AylikAjanda"
  | "YarimKalanKayit"
  | "AtolyeTesekkur"
  | "BultenTesekkur"
  | "StoryBildirimi"
  | "HaberlerBulteni"
  | "DogumGunuTebrik";

type TemplateEntry = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: (props: any) => React.ReactElement;
  defaultSubject: string;
};

export const templateRegistry: Record<TemplateName, TemplateEntry> = {
  DuyuruBulteni: {
    component: DuyuruBulteni,
    defaultSubject: "Klemens Art'tan Yeni Duyuru",
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
  StoryBildirimi: {
    component: StoryBildirimi,
    defaultSubject: "Yeni Story'ler Hazır — Klemens Art",
  },
  HaberlerBulteni: {
    component: HaberlerBulteni,
    defaultSubject: "Haftanın Kültür Sanat Gündemi — Klemens Art",
  },
  DogumGunuTebrik: {
    component: DogumGunuTebrik,
    defaultSubject: "Doğum Günün Kutlu Olsun! ✨ — Klemens Art",
  },
};
