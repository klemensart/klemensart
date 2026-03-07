"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

/* ───────── Types ───────── */

type PlaceType = "müze" | "galeri" | "konser" | "tiyatro" | "tarihi" | "edebiyat" | "gastronomi";

type CulturePlace = {
  lat: number;
  lng: number;
  type: PlaceType;
  name: string;
  desc: string;
  minZoom?: number;
};

type SupabaseEvent = {
  id: string;
  title: string;
  event_date: string | null;
  end_date: string | null;
  event_type: string | null;
  venue: string | null;
  price_info: string | null;
};

type RouteStop = {
  lat: number;
  lng: number;
  name: string;
  story: string;
};

type Route = {
  id: number;
  title: string;
  icon: string;
  duration: string;
  color: string;
  desc: string;
  stops: RouteStop[];
  fx?: "xray" | "grayscale" | "noir" | "neon" | "rock";
  nightOnly?: boolean;
};

type MapMode = "explore" | "routes";

/* ───────── Constants ───────── */

const TYPE_COLORS: Record<PlaceType, string> = {
  müze: "#4A9EFF",
  galeri: "#FF6D60",
  konser: "#9B6BB0",
  tiyatro: "#4CAF50",
  tarihi: "#FFB300",
  edebiyat: "#8B5CF6",
  gastronomi: "#E91E63",
};

const TYPE_LABELS: Record<PlaceType, string> = {
  müze: "Müze",
  galeri: "Galeri",
  konser: "Konser",
  tiyatro: "Tiyatro",
  tarihi: "Tarihi",
  edebiyat: "Edebiyat",
  gastronomi: "Gastronomi",
};

const TYPE_SVGS: Record<PlaceType, string> = {
  müze: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M10 10h1"/><path d="M14 10h-1"/></svg>`,
  galeri: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 3a2.5 2.5 0 0 1 0 5"/><path d="M3 19.5C3 10 13.5 12 13.5 6.5"/><path d="M5.5 19.5 3 22"/><path d="M18.5 19.5 21 22"/><path d="M12 19.5a7.5 7.5 0 0 0-7.5 0h15a7.5 7.5 0 0 0-7.5 0z"/></svg>`,
  konser: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  tiyatro: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v4a8 8 0 0 1-8 8H8a8 8 0 0 1-6-3"/><circle cx="10" cy="9" r="1"/><circle cx="16" cy="9" r="1"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>`,
  tarihi: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M4 21V11l4-4 4 4 4-4 4 4v10"/><path d="M9 21v-4h6v4"/><path d="M3 11h18"/></svg>`,
  edebiyat: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>`,
  gastronomi: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
};

const FILTER_OPTIONS: { key: PlaceType | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "müze", label: "Müzeler" },
  { key: "galeri", label: "Galeriler" },
  { key: "konser", label: "Konser" },
  { key: "tiyatro", label: "Tiyatro" },
  { key: "tarihi", label: "Tarihi" },
  { key: "edebiyat", label: "Edebiyat" },
  { key: "gastronomi", label: "Gastronomi" },
];

const PLACES: CulturePlace[] = [
  /* ── MÜZELER ── */
  { lat: 39.9381, lng: 32.8645, type: "müze", name: "Anadolu Medeniyetleri Müzesi", desc: "1921 kurulan, Paleolitik'ten Osmanlı'ya 1 milyon+ eser. 1997 Avrupa Yılın Müzesi." },
  { lat: 39.9430, lng: 32.8540, type: "müze", name: "I. TBMM Binası (Kurtuluş Savaşı Müzesi)", desc: "23 Nisan 1920'de açılan Meclis, Milli Mücadele'nin yönetildiği bina." },
  { lat: 39.9425, lng: 32.8545, type: "müze", name: "II. TBMM Binası (Cumhuriyet Müzesi)", desc: "1924-1960 parlamento binası. Mimar Vedat Tek tasarımı." },
  { lat: 39.9254, lng: 32.8369, type: "müze", name: "Anıtkabir ve Kurtuluş Savaşı Müzesi", desc: "Emin Onat ve Orhan Arda tasarımı, Atatürk'ün anıt mezarı." },
  { lat: 39.9390, lng: 32.8550, type: "müze", name: "Ankara Etnografya Müzesi", desc: "1930 açılış, Türk-İslam halk kültürü. 1938-53 Atatürk'ün geçici kabri." },
  { lat: 39.9385, lng: 32.8650, type: "müze", name: "Çengelhan Rahmi M. Koç Müzesi", desc: "1522 yapımı handa sanayi ve teknoloji tarihi." },
  { lat: 39.9370, lng: 32.8640, type: "müze", name: "Erimtan Arkeoloji ve Sanat Müzesi", desc: "2015 açılış, MÖ 3000'den Bizans'a eserler." },
  { lat: 39.9392, lng: 32.8538, type: "müze", name: "Ziraat Bankası Müzesi", desc: "Giulio Mongeri tasarımı 1929 binada, Türkiye'nin ilk banka müzesi." },
  { lat: 39.9428, lng: 32.8532, type: "müze", name: "Türkiye İş Bankası İktisadi Bağımsızlık Müzesi", desc: "Mongeri tasarımı binada ekonomi tarihi." },
  { lat: 39.9415, lng: 32.8535, type: "müze", name: "PTT Pul Müzesi", desc: "Clemens Holzmeister tasarımı binada filateli ve haberleşme tarihi." },
  { lat: 39.9383, lng: 32.8655, type: "müze", name: "Gökyay Vakfı Satranç Müzesi", desc: "110 ülkeden 700+ satranç takımı, Guinness rekoru." },
  { lat: 39.9740, lng: 32.9598, type: "müze", name: "Altınköy Açık Hava Müzesi", desc: "1930'lar Anadolu köy yaşamı, 500 dönümlük alan." },
  { lat: 39.9022, lng: 32.7986, type: "müze", name: "MTA Tabiat Tarihi Müzesi", desc: "1968 kurulan, dinozor fosillerinden meteoritlere." },
  { lat: 39.9031, lng: 32.6387, type: "müze", name: "Etimesgut Türk Tarih Müzesi", desc: "İskitlerden Cumhuriyet'e 200+ heykel, Orhun Yazıtları replikaları." },
  { lat: 39.8947, lng: 32.8610, type: "müze", name: "Pembe Köşk (İsmet İnönü Müze Evi)", desc: "2. Cumhurbaşkanı'nın 48 yıl yaşadığı ev." },
  { lat: 39.8895, lng: 32.8649, type: "müze", name: "Çankaya Köşkü (Atatürk Müze Köşkü)", desc: "1921-1932 Atatürk'ün ikameti, devrimlerin planlandığı yer." },
  { lat: 39.9360, lng: 32.8610, type: "müze", name: "Somut Olmayan Kültürel Miras Müzesi", desc: "Karagöz, meddahlık, ebru. Türkiye'nin ilk SOKÜM müzesi." },
  { lat: 40.1709, lng: 31.9178, type: "müze", name: "Beypazarı Yaşayan Müze", desc: "19. yy Abbaszade Konağı'nda halk kültürü deneyimi." },
  { lat: 40.1685, lng: 31.9195, type: "müze", name: "Türk Hamam Müzesi", desc: "Türkiye'nin ilk hamam müzesi. Roma'dan Osmanlı'ya yıkanma kültürü." },

  /* ── EDEBİYAT ── */
  { lat: 39.9426, lng: 32.8709, type: "edebiyat", name: "Kelime Müzesi", desc: "2022, Türkiye'nin ilk dil müzesi. Kelimelerin kökenlerini sanatsal anlatım." },
  { lat: 39.8769, lng: 32.8491, type: "edebiyat", name: "Cin Ali Müzesi", desc: "Rasim Kaygusuz'un kült karakterine adanmış pedagojik müze." },
  { lat: 39.9388, lng: 32.8670, type: "edebiyat", name: "Mehmet Akif Ersoy Müze Evi (Taceddin Dergahı)", desc: "İstiklal Marşı'nın yazıldığı mekan." },
  { lat: 39.9398, lng: 32.8648, type: "edebiyat", name: "Ahmet Hamdi Tanpınar Edebiyat Müze Kütüphanesi", desc: "El yazmaları ve nadir eserler." },
  { lat: 39.9245, lng: 32.8006, type: "edebiyat", name: "Cumhurbaşkanlığı Millet Kütüphanesi", desc: "2020, Selçuklu-Osmanlı-çağdaş mimari sentezi, dev kültür kompleksi." },

  /* ── GALERİLER ── */
  { lat: 39.9400, lng: 32.8530, type: "galeri", name: "Ankara Devlet Resim ve Heykel Müzesi", desc: "1927, Osman Hamdi Bey'den günümüze Türk plastik sanatları." },
  { lat: 39.9395, lng: 32.8480, type: "galeri", name: "CerModern", desc: "2010, eski TCDD atölyelerinde uluslararası çağdaş sanat merkezi." },
  { lat: 39.7930, lng: 32.6970, type: "galeri", name: "Müze Evliyagil", desc: "2015, çağdaş Türk sanatı, açık hava heykel bahçesi." },
  { lat: 39.8900, lng: 32.8587, type: "galeri", name: "Galeri Siyah Beyaz", desc: "1984'ten beri, Ankara'nın en köklü özel galerisi." },
  { lat: 39.8893, lng: 32.8508, type: "galeri", name: "Doğan Taşdelen Çağdaş Sanatlar Merkezi", desc: "Kamuya ait en kapsamlı sanat galerisi." },

  /* ── KONSER ── */
  { lat: 39.9147, lng: 32.8107, type: "konser", name: "CSO Ada Ankara", desc: "2020, fütüristik küre formlu müzik kampüsü." },
  { lat: 39.8673, lng: 32.7495, type: "konser", name: "Bilkent Konser Salonu", desc: "1994, Türkiye'nin ilk özel akademik senfoni salonu." },

  /* ── TİYATRO ── */
  { lat: 39.9352, lng: 32.8534, type: "tiyatro", name: "Büyük Tiyatro (Opera Sahnesi)", desc: "1933 Şevki Balmumcu / 1948 Paul Bonatz, anıtsal sahne." },
  { lat: 39.9386, lng: 32.8531, type: "tiyatro", name: "Küçük Tiyatro", desc: "1930 yapımı Mimar Kemaleddin eseri, 1947'den beri aktif." },
  { lat: 39.9040, lng: 32.8595, type: "tiyatro", name: "Şinasi Sahnesi", desc: "1988'den beri kült oyunların prömiyeri." },
  { lat: 39.9039, lng: 32.8593, type: "tiyatro", name: "Akün Sahnesi", desc: "1975 sinema, 2002'de tiyatroya dönüştürüldü." },

  /* ── TARİHİ & ARKEOLOJİK ── */
  { lat: 39.9408, lng: 32.8644, type: "tarihi", name: "Ankara Kalesi", desc: "MÖ 2. binyıl, Galat-Roma-Selçuklu-Osmanlı katmanları." },
  { lat: 39.6550, lng: 31.9940, type: "tarihi", name: "Gordion Antik Kenti ve Midas Tümülüsü", desc: "2023 UNESCO, MÖ 12. yy Frigya başkenti." },
  { lat: 39.9367, lng: 32.8653, type: "tarihi", name: "Arslanhane Camii", desc: "2023 UNESCO, 1290 Selçuklu şaheseri." },
  { lat: 39.9412, lng: 32.8632, type: "tarihi", name: "Augustus Tapınağı", desc: "MÖ 25-20, Res Gestae'nin en iyi korunmuş kopyası." },
  { lat: 39.9440, lng: 32.8600, type: "tarihi", name: "Roma Hamamı", desc: "MS 3. yy, İmparator Caracalla dönemi." },
  { lat: 39.9433, lng: 32.8562, type: "tarihi", name: "Julianus Sütunu", desc: "MS 362, 15m korint başlıklı Roma sütunu." },
  { lat: 39.9395, lng: 32.8680, type: "tarihi", name: "Hamamönü Tarihi Evleri", desc: "19. yy Osmanlı sivil mimarisi, restore edilmiş kültür bölgesi." },
  { lat: 39.9410, lng: 32.8630, type: "tarihi", name: "Hacı Bayram Veli Camii", desc: "1427-28, Augustus Tapınağı bitişiğinde." },
  { lat: 39.9398, lng: 32.8668, type: "tarihi", name: "Tarihi Karacabey Hamamı", desc: "1440, 580+ yıldır kesintisiz hizmet." },
  { lat: 39.9381, lng: 32.8733, type: "tarihi", name: "Ulucanlar Cezaevi Müzesi", desc: "1925-2006, Nazım Hikmet'in yattığı koğuşlar." },
  { lat: 39.5315, lng: 32.5589, type: "tarihi", name: "Gavurkale", desc: "MÖ 13. yy Hitit kabartmaları." },
  { lat: 40.0667, lng: 31.6667, type: "tarihi", name: "Juliopolis Antik Kenti", desc: "Helenistik-Roma-Bizans, kaya mezarları." },
  { lat: 40.3193, lng: 32.4649, type: "tarihi", name: "Alicin Manastırı", desc: "Erken Hristiyanlık inziva merkezi, Sümela benzeri." },
  { lat: 39.7743, lng: 32.6835, type: "tarihi", name: "Tulumtaş Mağarası", desc: "5 milyon yıllık karstik oluşum." },
  { lat: 39.5878, lng: 32.1312, type: "tarihi", name: "Sakarya Meydan Muharebesi Tarihi Milli Parkı", desc: "1921, 137 bin hektar." },
  { lat: 40.1675, lng: 31.9211, type: "tarihi", name: "Beypazarı Tarihi Konakları", desc: "Osmanlı-Türk sivil mimarisinin en iyi korunmuş dokusu." },
  { lat: 40.3575, lng: 32.5475, type: "tarihi", name: "Mahkeme Ağacın Kaya Yerleşimleri", desc: "Roma dönemi yeraltı kiliseleri." },
  { lat: 40.0972, lng: 33.4083, type: "tarihi", name: "Kalecik Kalesi", desc: "Galat ve Roma izleri, Kızılırmak vadisine hakim." },
  { lat: 39.9523, lng: 32.8261, type: "tarihi", name: "Akköprü", desc: "1222, Selçuklu dönemi, 7 kemerli taş köprü." },
  { lat: 40.1849, lng: 31.3501, type: "tarihi", name: "Nasuh Paşa Hanı", desc: "1599, 43 odalı Osmanlı ticaret hanı." },
  { lat: 40.2197, lng: 32.2448, type: "tarihi", name: "İnönü Mağaraları", desc: "Hitit'ten Bizans'a çok katlı kaya yerleşimleri." },

  /* ── GASTRONOMİ ── */
  { lat: 39.9380, lng: 32.8630, type: "gastronomi", name: "Tarihi Boğaziçi Lokantası", desc: "1956, meşhur Ankara Tavası, bakır tencerelerde." },
  { lat: 39.9420, lng: 32.8540, type: "gastronomi", name: "Tarihi Ulus Hali", desc: "1937, Robert Oerley tasarımı, geleneksel hal kültürü." },
  { lat: 39.9360, lng: 32.8030, type: "gastronomi", name: "AOÇ Merkez Lokantası", desc: "1925 kurulan çiftlikte tarihi gastronomi kampüsü." },
  { lat: 39.9380, lng: 32.8640, type: "gastronomi", name: "Zenger Paşa Konağı", desc: "18. yy konak, müze-restoran, yöresel mutfak." },
  { lat: 40.1680, lng: 31.9210, type: "gastronomi", name: "Beypazarı Taş Fırınları ve Alaaddin Sokak", desc: "Coğrafi işaretli Beypazarı Kurusu." },
  { lat: 40.1070, lng: 33.4180, type: "gastronomi", name: "Kalecik Karası Üzüm Bağları", desc: "MÖ 2000'den beri bağcılık, şarap rotası." },
  { lat: 40.2620, lng: 33.0160, type: "gastronomi", name: "Çubuk Turşu Köyü", desc: "15. yy'dan beri coğrafi işaretli Çubuk Turşusu üretimi." },

  /* ── EK MÜZELER ── */
  { lat: 39.9350, lng: 32.8500, type: "müze", name: "Ankara Palas Müzesi", desc: "1928 yapımı Cumhuriyet konukevi, Şubat 2024'te müzeye dönüştürüldü." },
  { lat: 39.9359, lng: 32.8546, type: "müze", name: "Vakıf Eserleri Müzesi", desc: "1927 yapımı Hukuk Mektebi binasında halı, kilim, vakıf eserleri." },
  { lat: 39.9366, lng: 32.8433, type: "müze", name: "Direksiyon Binası (TCDD Milli Mücadele Müzesi)", desc: "1892, Atatürk'ün ilk karargahı." },
  { lat: 39.9017, lng: 32.7713, type: "müze", name: "ODTÜ Bilim ve Teknoloji Müzesi", desc: "MÖ 3500'den bilgisayar devrimine teknoloji evrimi." },
  { lat: 39.9690, lng: 32.8623, type: "müze", name: "Meteoroloji Müzesi", desc: "1908, Atatürk'ün 6 ay karargah kullandığı bina." },
  { lat: 39.9320, lng: 32.8300, type: "müze", name: "Ankara Üniversitesi Oyuncak Müzesi", desc: "1990, Türkiye'nin ilk oyuncak müzesi." },
  { lat: 39.8680, lng: 32.8190, type: "müze", name: "TRT Yayıncılık Tarihi Müzesi", desc: "Radyo ve TV tarihi, nostaljik stüdyolar." },
  { lat: 39.9476, lng: 32.7052, type: "müze", name: "Hava Kuvvetleri Müzesi", desc: "1998, ilk uçaklardan savaş jetlerine." },
  { lat: 39.9328, lng: 32.8464, type: "müze", name: "TCDD Açık Hava Buharlı Lokomotif Müzesi", desc: "Tarihi buharlı lokomotifler." },
  { lat: 39.6200, lng: 32.1500, type: "müze", name: "Alagöz Karargâh Müzesi", desc: "Sakarya Muharebesi'nde Atatürk'ün cephe karargahı." },
  { lat: 39.7850, lng: 32.3870, type: "müze", name: "Malıköy Tren İstasyonu Müzesi", desc: "Kurtuluş Savaşı lojistik merkezi." },
  { lat: 39.9300, lng: 32.8700, type: "müze", name: "Haritacılık Müzesi", desc: "Osmanlı'dan Cumhuriyet'e haritacılık tekniklerinin evrimi." },
  { lat: 40.4930, lng: 32.4750, type: "müze", name: "Çamlıdere Doğa ve Hayvan Müzesi", desc: "Türkiye'nin en kapsamlı doğa müzesi." },

  /* ── EK GALERİLER ── */
  { lat: 39.9371, lng: 32.8641, type: "galeri", name: "Pilavoğlu Han", desc: "16. yy, sanatçı atölyelerine dönüşmüş avlulu han." },
  { lat: 39.8860, lng: 32.8530, type: "galeri", name: "Şefik Bursalı Müze Evi", desc: "Türk resim ustasının orijinal atölyesi." },
  { lat: 39.8950, lng: 32.8340, type: "galeri", name: "Mustafa Ayaz Sanat Müzesi", desc: "Çağdaş Türk resmi, genç yeteneklere alan." },
  { lat: 39.9340, lng: 32.8550, type: "galeri", name: "Hacettepe Sanat Müzesi", desc: "Çağdaş Türk resim ve heykel koleksiyonu." },
  { lat: 39.8850, lng: 32.7480, type: "galeri", name: "Fikret Otyam Sanat Merkezi", desc: "Çağdaş sanat, dijital enstalasyonlar." },
  { lat: 39.8830, lng: 32.8100, type: "galeri", name: "Zülfü Livaneli Kültür Merkezi", desc: "Sergiler, edebiyat söyleşileri, sanat filmi." },

  /* ── EK KONSER ── */
  { lat: 39.9340, lng: 32.8620, type: "konser", name: "Musiki Muallim Mektebi", desc: "1924, Cumhuriyet'in ilk müzik okulu." },
  { lat: 39.8756, lng: 32.7521, type: "konser", name: "Bilkent Odeon", desc: "Antik amfitiyatro ilhamı, 4000 kişilik açık hava arena." },
  { lat: 39.9350, lng: 32.8520, type: "konser", name: "CSO Tarihi Binası", desc: "1961-2020, kentin çoksesli müzik hafızası." },
  { lat: 39.9360, lng: 32.8252, type: "konser", name: "MEB Şura Salonu", desc: "Senfonik konser, bale, festival merkezi." },

  /* ── EK TİYATRO ── */
  { lat: 39.9650, lng: 32.7600, type: "tiyatro", name: "İrfan Şahinbaş Atölye Sahnesi", desc: "Deneysel ve yenilikçi oyunlar." },
  { lat: 39.8987, lng: 32.8575, type: "tiyatro", name: "Tatbikat Sahnesi", desc: "Avangart prodüksiyonlar, bağımsız performans." },
  { lat: 39.8700, lng: 32.7400, type: "tiyatro", name: "Cüneyt Gökçer Sahnesi", desc: "Döner sahne teknolojisi, geniş kapasiteli." },

  /* ── EK TARİHİ ── */
  { lat: 39.9431, lng: 32.8600, type: "tarihi", name: "Antik Roma Tiyatrosu", desc: "MS 1-2. yy, Ankara Kalesi eteklerinde." },
  { lat: 39.9370, lng: 32.8650, type: "tarihi", name: "Ahi Elvan Camii", desc: "1382, Selçuklu ahşap direkli cami." },
  { lat: 39.9397, lng: 32.8583, type: "tarihi", name: "Suluhan (Hasanpaşa Hanı)", desc: "1508-1511, çifte avlulu Osmanlı ticaret hanı." },
  { lat: 39.9375, lng: 32.8560, type: "tarihi", name: "Pirinç Han", desc: "18. yy, antikacılar ve sahafların mekanı." },
  { lat: 39.9350, lng: 32.8430, type: "tarihi", name: "Tarihi Ankara Garı", desc: "1937, Art Deco, Şekip Akalın tasarımı." },
  { lat: 39.9350, lng: 32.8260, type: "tarihi", name: "Gazi Üniversitesi Rektörlük Binası", desc: "1927-30, Mimar Kemaleddin eseri." },
  { lat: 39.9297, lng: 32.8556, type: "tarihi", name: "DTCF Binası", desc: "1936, Bruno Taut tasarımı." },
  { lat: 39.5900, lng: 32.1600, type: "tarihi", name: "Polatlı Duatepe Anıtı", desc: "Sakarya Muharebesi zafer noktası." },
  { lat: 39.9350, lng: 32.8540, type: "tarihi", name: "Güven Anıtı ve Güvenpark", desc: "1935, bronz ve taş rölyef kompleksi." },
  { lat: 39.9419, lng: 32.8547, type: "tarihi", name: "Ulus Zafer Anıtı", desc: "1927, Heinrich Krippel, tunç meydan heykeli." },
  { lat: 40.2386, lng: 33.0331, type: "tarihi", name: "Çubuk-1 Barajı", desc: "1936, Türkiye'nin ilk betonarme barajı." },
  { lat: 40.2140, lng: 32.2450, type: "tarihi", name: "Güdül Tarihi Kent (Cittaslow)", desc: "Sakin Şehir, otantik Osmanlı kasabası." },
  { lat: 40.0900, lng: 32.6850, type: "tarihi", name: "Karalar Galat Mezarları", desc: "MÖ 1. yy, Kelt kökenli kral mezarları." },
  { lat: 40.4333, lng: 32.4167, type: "tarihi", name: "Pelitçik Fosil Ormanı", desc: "20 milyon yıllık taşlaşmış ağaçlar." },
  { lat: 40.4930, lng: 32.4700, type: "tarihi", name: "Şeyh Ali Semerkandi Türbesi", desc: "15. yy İslam alimi, manevi turizm." },
  { lat: 39.9400, lng: 32.8550, type: "tarihi", name: "Zincirli Camii", desc: "17. yy, kırmızı tuğla ve ahşap tavan." },
  { lat: 39.9895, lng: 33.1738, type: "tarihi", name: "Hasanoğlan Köy Enstitüsü", desc: "1941, aydınlanma projesi mirası." },

  /* ── EK EDEBİYAT ── */
  { lat: 39.9210, lng: 32.8560, type: "edebiyat", name: "Adnan Ötüken İl Halk Kütüphanesi", desc: "1922, Paul Bonatz binası." },
  { lat: 39.9200, lng: 32.8550, type: "edebiyat", name: "Mülkiyeliler Birliği", desc: "1859 köklü, aydınların buluşma mekanı." },
  { lat: 39.9070, lng: 32.8600, type: "edebiyat", name: "Kuğulu Park", desc: "1958, Sevgi Soysal'ın edebi mekanı." },
  { lat: 39.9390, lng: 32.8670, type: "edebiyat", name: "Şairler ve Yazarlar Evi", desc: "Hamamönü'nde şiir dinletileri." },

  /* ── EK GASTRONOMİ ── */
  { lat: 39.9410, lng: 32.8555, type: "gastronomi", name: "Tarihi Merkez Efendi Fırını", desc: "Coğrafi işaretli Ankara Simidi." },
  { lat: 39.9410, lng: 32.8560, type: "gastronomi", name: "Ali Uzun Şekercisi", desc: "1930'lar, akide şekeri ve lokum." },
  { lat: 39.9420, lng: 32.8530, type: "gastronomi", name: "Tarihi Uludağ Kebapçısı", desc: "1950'ler, klasik esnaf lokantası." },
  { lat: 40.0900, lng: 32.6850, type: "gastronomi", name: "Kazan Kavurması Lokantaları", desc: "Coğrafi işaretli Kazan Kavurması." },
  { lat: 39.9150, lng: 32.8600, type: "gastronomi", name: "Aspava Gastronomi Kültürü", desc: "1970'ler, Ankara'ya özgü yeme-içme ritüeli." },
];

const ROUTES: Route[] = [
  {
    id: 1,
    title: "Dünyayı Giyindiren Şehir: Sof ve Kervanlar",
    icon: "\u{1F42A}",
    duration: "~2.5 saat \u{1F463}",
    color: "#D4A843",
    desc: "Ankara'nın dünyaca ünlü Sof kumaşı ticaretinin izi",
    stops: [
      { lat: 39.9397, lng: 32.8583, name: "Suluhan (Hasanpaşa Hanı)", story: "1508-1511 yılları arasında inşa edilen çifte avlulu han, Ankara'nın dünyaca ünlü Sof kumaşı ticaretinin kalbiydi. Venedik, Fransa ve İngiltere saraylarına ihraç edilen tiftik kumaşları burada depolanır, kervanlarla Batı'ya yola çıkardı." },
      { lat: 39.9375, lng: 32.8560, name: "Pirinç Han", story: "18. yüzyıl ahşap hatıllı sivil mimari. Osmanlı'nın ticaret ritmini hâlâ taşıyan bu han, bugün antikacılara ve sahaflara ev sahipliği yapıyor. Sof ticaretinin küçük esnafı burada faaliyet gösterirdi." },
      { lat: 39.9385, lng: 32.8650, name: "Çengelhan", story: "1522 yapımı görkemli ticaret hanı. Adını duvarlarına asılan çengellerden (kancalardan) alır — kumaş balyaları bu kancalara asılarak sergilenirdi. Bugün Rahmi M. Koç Müzesi olarak yaşıyor." },
      { lat: 39.9381, lng: 32.8645, name: "Kurşunlu Han (Anadolu Medeniyetleri Müzesi)", story: "15. yüzyıl yapımı kurşun kaplı çatısıyla ünlü han. Sof ticaretinin en prestijli merkeziydi. Bugün Anadolu'nun binlerce yıllık hazinesini barındıran müzeye dönüştü." },
      { lat: 39.9383, lng: 32.8647, name: "Mahmut Paşa Bedesteni", story: "Osmanlı'nın kapalı çarşı geleneğinin Ankara'daki temsilcisi. Değerli Sof kumaşları burada satışa sunulurdu. Bugün Anadolu Medeniyetleri Müzesi'nin ikinci binası." },
    ],
  },
  {
    id: 2,
    title: "Ahiler Cumhuriyeti: Ahşabın Sırrı",
    icon: "\u{1FAB5}",
    duration: "~2 saat \u{1F463}",
    color: "#8B6914",
    desc: "Ahilik geleneği ve ahşap ustalığının izinde",
    stops: [
      { lat: 39.9370, lng: 32.8650, name: "Ahi Elvan Camii", story: "1382'de ahiler tarafından inşa edildi. Pencere ve kapılarındaki zarif ahşap oymacılığı, Selçuklu döneminin en ince zanaatını yansıtır. Ahilik, Ankara'yı tarihin nadir gördüğü bir 'esnaf cumhuriyeti' olarak yönetti." },
      { lat: 39.9367, lng: 32.8653, name: "Arslanhane (Ahi Şerafeddin) Camii", story: "1290 yapımı, Eylül 2023'te UNESCO Dünya Mirası. Roma devşirme sütunlar üzerinde yükselen muazzam ahşap tavan — çivisiz kündekari tekniğiyle birbirine geçen binlerce ahşap parça. İhtişamın sadelik içindeki zirvesi." },
      { lat: 39.9400, lng: 32.8550, name: "Zincirli Camii", story: "17. yüzyıl, kırmızı tuğla işçiliği ve bitkisel nakışlı ahşap tavanıyla öne çıkar. Ahi geleneğinin Osmanlı döneminde nasıl devam ettiğinin zarif tanığı." },
      { lat: 39.9398, lng: 32.8668, name: "Tarihi Karacabey Hamamı", story: "1440'tan bu yana 580+ yıldır kesintisiz hizmet veren en eski Osmanlı hamamlarından biri. Ahilerin toplumsal yaşamda hamamı bir buluşma ve arınma ritüeline dönüştürdüğü mekan." },
      { lat: 39.9360, lng: 32.8610, name: "Somut Olmayan Kültürel Miras Müzesi", story: "Karagöz, meddahlık, ebru — ahi geleneğinin yaşattığı zanaat ve gösteri sanatlarının bugünkü evi. Ahilik sadece ticaret değil, bir yaşam felsefesiydi." },
    ],
  },
  {
    id: 3,
    title: "Antik Ancyra: Roma ve Galatlar",
    icon: "\u{1F3DB}\uFE0F",
    duration: "~2.5 saat \u{1F463}",
    color: "#FFB300",
    desc: "Roma İmparatorluğu ve Kelt Galatlarının izinde",
    stops: [
      { lat: 39.9431, lng: 32.8600, name: "Antik Roma Tiyatrosu", story: "MS 1-2. yüzyılda inşa edilen, Ankara Kalesi eteklerinde güncel arkeolojik kazılarla gün yüzüne çıkarılan antik seyir alanı. Ancyra'nın bir Roma metropolü olduğunun en canlı kanıtı." },
      { lat: 39.9412, lng: 32.8632, name: "Augustus Tapınağı", story: "MÖ 25-20 yıllarında inşa edildi. Duvarlarındaki Res Gestae — Roma İmparatoru Augustus'un siyasi vasiyetnamesi — Latince ve Yunanca olarak dünyanın en iyi korunmuş kopyası burada." },
      { lat: 39.9433, lng: 32.8562, name: "Julianus Sütunu", story: "MS 362, son pagan Roma İmparatoru Julianus'un Ankara ziyareti anısına dikilen 15 metrelik korint başlıklı monolitik sütun. Halk arasında 'Belkıs Minaresi' olarak bilinir." },
      { lat: 39.9440, lng: 32.8600, name: "Roma Hamamı", story: "MS 3. yüzyılda İmparator Caracalla döneminde Sağlık Tanrısı Asklepios adına yapıldı. Palaestra, frigidarium ve caldarium kalıntıları — antik Romalıların günlük yaşam ritüellerinin izi." },
      { lat: 39.9408, lng: 32.8644, name: "Ankara Kalesi", story: "MÖ 2. binyılda Galatlar — Anadolu'ya göç eden Kelt kavmi — tarafından kuruldu. Roma, Bizans, Selçuklu ve Osmanlı katmanlarıyla sürekli yenilenen çok katmanlı savunma kompleksi." },
      { lat: 40.0900, lng: 32.6850, name: "Karalar Galat Mezarları", story: "MÖ 1. yüzyılda Kelt kökenli Galat kralı Deiotaros'a ait anıtsal mezar. Volkanik kayalara oyulmuş Helenistik kale kalıntılarıyla birlikte Ankara'nın Kelt geçmişinin en somut kanıtı." },
    ],
  },
  {
    id: 4,
    title: "Çiçero Operasyonu: II. Dünya Savaşı Casusları",
    icon: "\u{1F575}\uFE0F",
    duration: "~2 saat \u{1F463}",
    color: "#607D8B",
    desc: "II. Dünya Savaşı'nda Ankara'nın casus sokakları",
    stops: [
      { lat: 39.9350, lng: 32.8500, name: "Ankara Palas Müzesi", story: "1928 yapımı Cumhuriyet'in efsanevi konukevi. Diplomatik balolar, gizli görüşmeler, İngiliz ve Alman ajanlarının kılıç tokuşturduğu salon. Tarafsız Türkiye'nin tam ortasında bir istihbarat satrancı." },
      { lat: 39.9419, lng: 32.8547, name: "Tarihi Ulus Meydanı", story: "Savaş yıllarında casusların buluştuğu efsanevi Karpiç Lokantası bu civardaydı. Rus göçmen Karpiç'in restoranı, elçilik mensuplarının ve ajanların gizli randevu noktasıydı." },
      { lat: 39.9350, lng: 32.8430, name: "Tarihi Ankara Garı", story: "1937 Art Deco yapı. Savaş yıllarında diplomatik posta, gizli belgeler ve ajanlar bu gardan geçti. Çiçero — İngiliz Büyükelçi'nin uşağı — çaldığı gizli belgeleri Alman istihbaratına burada teslim etti." },
      { lat: 39.8927, lng: 32.8564, name: "Eski Çankaya Elçilikler Bölgesi", story: "II. Dünya Savaşı'nda Ankara'daki yabancı elçilikler, istihbarat operasyonlarının merkeziydi. İngiliz MI6, Alman Abwehr ve Sovyet NKVD ajanları bu sessiz sokaklarda faaliyet gösterdi." },
    ],
  },
  {
    id: 5,
    title: "Mürekkep Kokulu Sokaklar: Edebi Hafıza",
    icon: "\u{1F58B}\uFE0F",
    duration: "~3 saat \u{1F463}",
    color: "#8B5CF6",
    desc: "Şairlerin, yazarların ve aydınların izinde",
    stops: [
      { lat: 39.9388, lng: 32.8670, name: "Taceddin Dergahı (Mehmet Akif Ersoy)", story: "1920-21 kışı, Ankara'nın en zor günleri. Mehmet Akif bu mütevazı odada, milletin ruhunu şiire döktü: 'Korkma, sönmez bu şafaklarda yüzen al sancak.' İstiklal Marşı burada doğdu." },
      { lat: 39.9381, lng: 32.8733, name: "Ulucanlar Cezaevi Müzesi", story: "1925-2006 arası faaliyet gösteren cezaevinin koğuşları, Türk edebiyatının en karanlık ve en parlak sayfalarına tanıklık etti. Nazım Hikmet, Necip Fazıl, Sevgi Soysal — hepsi bu duvarlara dokundu." },
      { lat: 39.9390, lng: 32.8670, name: "Şairler ve Yazarlar Evi", story: "Hamamönü'nde restore edilmiş tarihi konakta edebiyatçıların buluşma noktası. Şiir dinletileri, okuma günleri — Ankara'nın edebi kalbi hâlâ burada atıyor." },
      { lat: 39.9398, lng: 32.8648, name: "Ahmet Hamdi Tanpınar Edebiyat Müze Kütüphanesi", story: "El yazmaları, daktilolar, nadir eserler. Ankara'nın edebi hafızasının koruyucusu. Tanpınar'ın 'Huzur'u ve 'Saatleri Ayarlama Enstitüsü' bu şehrin ruhundan beslendi." },
      { lat: 39.9200, lng: 32.8550, name: "Mülkiyeliler Birliği", story: "1859 köklü Siyasal Bilgiler geleneği. Şairler, yazarlar, aydınlar burada buluştu. İkinci Yeni şiirinin tartışıldığı, daktilo seslerinin yankılandığı mekan." },
      { lat: 39.9070, lng: 32.8600, name: "Kuğulu Park", story: "1958'den beri Ankara'nın edebi parkı. Sevgi Soysal başta olmak üzere sayısız yazar ve şair bu bankların birinde oturdu, düşündü, yazdı. Viyana'dan gelen kuğular hâlâ burada." },
    ],
  },
  {
    id: 6,
    title: "Paslı Çarklardan Sanata: Endüstriyel Dönüşüm",
    icon: "\u2699\uFE0F",
    duration: "~Tam gün \u{1F697}",
    color: "#78909C",
    desc: "Demiryolu atölyelerinden sanat merkezlerine dönüşüm",
    stops: [
      { lat: 39.9395, lng: 32.8480, name: "CerModern", story: "1920'lerden kalma TCDD vagon bakım atölyelerinin endüstriyel mirasına sadık kalınarak 2010'da açıldı. Paslı raylar ve yüksek tavanlar, şimdi çağdaş sanatın beyaz küpleri. Dönüşümün en zarif örneği." },
      { lat: 39.9328, lng: 32.8464, name: "TCDD Açık Hava Buharlı Lokomotif Müzesi", story: "1900'lerin başından itibaren Anadolu'yu birbirine bağlayan devasa buharlı lokomotifler burada son durağında. Alman, İngiliz, Amerikan yapımı — her biri bir endüstri destanı." },
      { lat: 39.7850, lng: 32.3870, name: "Malıköy Tren İstasyonu Müzesi", story: "Kurtuluş Savaşı'nda Batı Cephesi'nin lojistik kalbi. Revir, cephanelik, uçak onarım atölyesi — küçük bir istasyon, büyük bir savaşın gizli kahramanı." },
      { lat: 40.2386, lng: 33.0331, name: "Çubuk-1 Barajı", story: "1936'da Atatürk'ün katılımıyla açılan Türkiye'nin ilk betonarme barajı. Genç Cumhuriyet'in 'biz de yaparız' ruhunun betona dökülmüş hali. Bugün endüstriyel miras parkı." },
    ],
  },
  {
    id: 7,
    title: "Kayalara Oyulan Sırlar: İnziva Rotası",
    icon: "\u{1F9D7}",
    duration: "~Tam gün \u{1F697}+\u{1F463}",
    color: "#4CAF50",
    desc: "Kaya kiliseleri, manastırlar ve fosil ormanları",
    stops: [
      { lat: 40.3575, lng: 32.5475, name: "Mahkeme Ağacın Kaya Yerleşimleri", story: "Roma döneminde ilk Hristiyanlar zulümden saklanmak için volkanik tüf kayaları oydu. Yeraltı kiliseleri, çok katlı mağaralar — Kapadokya'nın bilinmeyen kardeşi, Ankara'nın tam göbeğinde." },
      { lat: 40.3193, lng: 32.4649, name: "Alicin Manastırı", story: "Dik bir kanyon yamacına kayalar oyularak inşa edilmiş. Sümela Manastırı'nı andıran sarp mimarisiyle Erken Hristiyanlık döneminin en gizemli inziva merkezlerinden biri. Ulaşımı zor, keşfi unutulmaz." },
      { lat: 40.2197, lng: 32.2448, name: "İnönü Mağaraları", story: "Kirmir Çayı vadisi boyunca tüf kayalara oyulmuş. Hitit'ten Bizans'a binlerce yıl kullanılmış çok katlı kaya yerleşimleri. Güdül'ün sakin şehir atmosferiyle birleşen doğa macerası." },
      { lat: 40.4333, lng: 32.4167, name: "Pelitçik Fosil Ormanı", story: "20 milyon yıl önce volkanik patlamalarla taşlaşmış ağaç gövdeleri. Zaman burada kelimenin gerçek anlamıyla donmuş. Bilimsel koruma altındaki nadir jeolojik miras." },
    ],
  },
  {
    id: 8,
    title: "Frigya ve Gordion Efsaneleri",
    icon: "\u{1F451}",
    duration: "~Tam gün \u{1F697}",
    color: "#FFC107",
    desc: "Kral Midas'ın efsanevi başkenti ve Sakarya zafer noktası",
    stops: [
      { lat: 39.6540, lng: 31.9930, name: "Gordion Müzesi", story: "2023 UNESCO Dünya Mirası. MÖ 12. yüzyılda kurulan Frigya başkenti. Büyük İskender'in kılıcıyla kestiği efsanevi 'Gordion Düğümü' burada bağlıydı." },
      { lat: 39.6560, lng: 31.9950, name: "Midas Tümülüsü", story: "Dokunduğu her şeyi altına çeviren efsanevi Kral Midas'ın mezarı. Dünyanın bilinen en eski ahşap mezar odası — 2700 yıldır ayakta. Tümülüs 53 metre yüksekliğinde devasa bir toprak tepe." },
      { lat: 39.6550, lng: 31.9940, name: "Gordion Antik Kenti (Yassıhöyük)", story: "Kazılarla ortaya çıkan saray kalıntıları, megaron yapılar ve mozaik zeminler. Friglerin dünyaya armağan ettiği geometrik sanat burada doğdu." },
      { lat: 39.5900, lng: 32.1600, name: "Polatlı Duatepe Anıtı", story: "Dönüş yolunda — 1921 Sakarya Muharebesi'nde Türk ordusunun karşı taarruza geçtiği ilk tepe. Metin Yurdanur'un devasa anıtlarıyla taçlandırılmış zafer noktası." },
    ],
  },
  {
    id: 9,
    title: "Görünmez Şehir: Kayıp Sular",
    icon: "\u{1F4A7}",
    duration: "~2 saat \u{1F463}",
    color: "#00BCD4",
    desc: "Ankara'nın yeraltına hapsedilen kayıp nehirleri",
    fx: "xray",
    stops: [
      { lat: 39.9550, lng: 32.8200, name: "Akköprü", story: "Yeraltına hapsedilen Ankara Çayı ve İncesu Deresi'nin nihayet yeryüzüne çıkıp birleşerek altından aktığı 800 yıllık Selçuklu köprüsü. 1222 yapımı 7 kemerli taş yapı, kayıp suların son tanığı." },
      { lat: 39.9420, lng: 32.8530, name: "Bentderesi (Kayıp Vadi)", story: "1950'lere kadar şelalelerin aktığı, Roma köprülerinin bulunduğu vadinin üzeri beton ve asfaltla kapatıldı. Bugün Bentderesi Caddesi'nin altında hâlâ su akıyor — şehrin en büyük sırrı." },
      { lat: 39.9150, lng: 32.8580, name: "Kavaklıdere Su Kaynağı", story: "Semt adını gerçekten burada akan dereden aldı. Kavak ağaçlarının gölgesindeki dere bugün Kuğulu Park'ın altından besleniyor. Parkın kuğuları farkında olmadan kayıp bir nehrin üzerinde yüzüyor." },
      { lat: 39.9440, lng: 32.8600, name: "Roma Hamamı Hipokost Sistemi", story: "Antik çağda kentin sıcak su ve buhar döngüsünü sağlayan yeraltı dehliz ağı. Romalılar Ankara'nın sularını sadece içmedi, mühendislik harikasına dönüştürdü. Hipokost kanalları hâlâ zeminin altında." },
    ],
  },
  {
    id: 10,
    title: "Betonun Şiiri: Brütalist Ankara",
    icon: "\u{1F6F8}",
    duration: "~3 saat \u{1F4F8}",
    color: "#90A4AE",
    desc: "Fotoğrafçılar için brütalist mimari turu",
    fx: "grayscale",
    stops: [
      { lat: 39.9170, lng: 32.8620, name: "Cinnah 19", story: "1957'de inşa edilen, altından havuz geçen asimetrik apartman. Uzay çağı estetiğiyle Ankara'nın ilk avangart sivil yapısı. Bilimkurgu filmlerinden fırlamış gibi — fotoğrafçıların gizli cenneti." },
      { lat: 39.8910, lng: 32.7870, name: "ODTÜ Mimarlık Fakültesi", story: "Altuğ ve Behruz Çinici tasarımı. Çıplak betonun Türkiye'deki en heykelsi temsilcisi — dev geometrik formlar, gölge oyunları, brutalizmin şiiri. Le Corbusier Ankara'ya gelseydi burayı kıskanırdı." },
      { lat: 39.9210, lng: 32.8540, name: "Kızılay Emek İşhanı", story: "1959, Türkiye'nin ilk modern gökdeleni. Rasyonalist mimari ve cam giydirme cephe — dönemin 'geleceğin şehri' vizyonunun Ankara'daki somut hali." },
      { lat: 39.9130, lng: 32.8600, name: "Türk Dil Kurumu Binası", story: "Mimar Cengiz Bektaş'ın ödüllü başyapıtı. İç avlu, su ögeleri ve geometrik ışık oyunları — modernizmin Anadolu topraklarında kök salması. Beton burada şiire dönüşüyor." },
    ],
  },
  {
    id: 11,
    title: "Ankara Noir: Sis, Cinayet ve Daktilo",
    icon: "\u{1F575}\uFE0F",
    duration: "~2.5 saat \u{1F463}",
    color: "#37474F",
    desc: "Ankara'nın karanlık ve gizemli yüzü",
    fx: "noir",
    stops: [
      { lat: 39.9415, lng: 32.8530, name: "Rüzgarlı Sokak", story: "Eski matbaaların, gazetecilerin ve bürokratik sırların bir zamanlar kalbinin attığı melankolik cadde. Gece lambaları altında gölgeler uzar, daktilo sesleri yankılanırdı. Ankara noir'ın doğum yeri." },
      { lat: 39.9430, lng: 32.8700, name: "Ulucanlar Cezaevi — Dar Ağacı Avlusu", story: "Siyasi ve edebi tarihin en ağır bedellerinin ödendiği yer. Bu avluda son nefesler verildi, son mektuplar yazıldı. Duvarlar hâlâ fısıldıyor." },
      { lat: 39.9350, lng: 32.8750, name: "Cebeci Asri Mezarlığı", story: "Sisli sabahların en ürpertici adresi. Faili meçhul cinayetlere kurban giden aydınlar, yazarlar, siyasetçiler burada yatıyor. Her mezar taşı bir çözülmemiş hikaye." },
      { lat: 39.9410, lng: 32.8560, name: "İtfaiye Meydanı (Hergelen Meydanı)", story: "Eski Ankara'nın bitpazarı. Kayıp eşyaların, sahte kimliklerin ve şehrin karanlık hafızasının toplandığı asırlık meydan. Her Pazar sabahı burada bir sır satılır." },
    ],
  },
  {
    id: 12,
    title: "Gece Vardiyası: 03:00'ten Sonra Bozkır",
    icon: "\u{1F989}",
    duration: "~Gece turu \u{1F319}",
    color: "#FF9800",
    desc: "Gece kuşları için — 23:00'te açılır",
    fx: "neon",
    nightOnly: true,
    stops: [
      { lat: 39.9350, lng: 32.8100, name: "AOÇ Sabaha Karşı Kokoreç", story: "Gece yarısından sonra tüm şehir arabalarına atlayıp buraya gelir. Odun ateşinde kokoreç, semaver çayı, yıldızların altında. Ankara'nın en demokratik sofrası — CEO ile taksi şoförü aynı sırada." },
      { lat: 39.9230, lng: 32.8650, name: "Esat Caddesi Aspava Savaşları", story: "Saat 04:00, neon tabelalar yanıyor. Gece kulübü çıkışı soslu dürüm döner, ikram salata, semaverde çay. Ankara'nın uykusuz gastronomi ritüelinin en yoğun yaşandığı sokak." },
      { lat: 39.9410, lng: 32.8560, name: "İtfaiye Meydanı Gece Çorbacıları", story: "Gündüzleri bitpazarı olan sokaklar gece yarısı kepenk açar. Taksiciler ve bürokratlar yan yana kelle paça içer. Salaş plastik sandalyeler, buğulu camlar, huzur." },
      { lat: 39.9500, lng: 32.7400, name: "Şaşmaz Sanayi Gece Köftecileri", story: "Şehrin en büyük oto sanayi sitesinin ıssız sokaklarında gece yarısı beliren seyyar ateşler. İnanılmaz bir kalabalık nereden geldi bilinmez. Mangal dumanı, köfte kokusu, sanayi estetiği." },
    ],
  },
  {
    id: 13,
    title: "Bozkırın Distorsiyonu: 90'lar Rock",
    icon: "\u{1F3B8}",
    duration: "~2 saat \u{1F463}+\u{1F3B5}",
    color: "#F44336",
    desc: "Ankara rock ve metal alt kültürünün izinde",
    fx: "rock",
    stops: [
      { lat: 39.9200, lng: 32.8540, name: "Kızılay SSK İşhanı", story: "1980'ler ve 90'lar. Bu işhanının bodrum katları ve pasajları Ankara rock ve heavy metal alt kültürünün doğum yeri. Kasetçiler, fanzin dağıtıcıları, deri ceketli gençler. Pentagram, Mezarkabul buralarda filizlendi." },
      { lat: 39.9130, lng: 32.8590, name: "Tunalı Pasajları", story: "Ertuğ ve Kuğulu pasajları — sokak müzisyenlerinin, ilk stüdyoların yuvası. Şebnem Ferah'ın, Athena'nın, Dr. Skull'ın temellerinin atıldığı kült yeraltı ağı. Her pasaj kapısı bir portal." },
      { lat: 39.9210, lng: 32.8530, name: "Zafer Çarşısı Sahafları", story: "İnternet öncesi dönemde isyankar gençliğin korsan kaset, fanzin ve yasaklı kitap avına çıktığı efsanevi çarşı. Burada bir kaset bulmak, bugün Spotify'da playlist yapmaktan daha heyecanlıydı." },
      { lat: 39.9220, lng: 32.8550, name: "Sakarya Caddesi", story: "Salaş birahaneler, canlı müzik barları, korsan kasetçiler. Bozkırın gençliği gece gündüz demeden burada müzik yarattı. Ankara rock'ının ana caddesi — her köşede bir anı, her birahane bir efsane." },
    ],
  },
];

/* ───────── Route SVG Icons ───────── */

const ROUTE_ICON_PATHS: Record<number, string> = {
  1: '<path d="M5 7h11 M5 17h11 M5 7v10"/><path d="M16 7c2.5 0 4 2.2 4 5s-1.5 5-4 5"/>',
  2: '<path d="M12 3l7 4v4c0 5.5-3 9.5-7 12-4-2.5-7-6.5-7-12V7z"/>',
  3: '<path d="M6 4h12 M6 20h12 M9 4v16 M15 4v16"/>',
  4: '<path d="M4 12h16 M7 12c0-3 2.2-5 5-5s5 2 5 5"/><circle cx="8.5" cy="16" r="2"/><circle cx="15.5" cy="16" r="2"/><path d="M10.5 16h3"/>',
  5: '<path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z M15 5l4 4"/>',
  6: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1"/>',
  7: '<path d="M4 18l5-10 3 4 3-6 5 12H4z"/>',
  8: '<path d="M4 17l2-10 4 5 2-6 2 6 4-5 2 10H4z"/>',
  9: '<path d="M12 3C8 8.5 6 11.5 6 14a6 6 0 0 0 12 0c0-2.5-2-5.5-6-11z"/>',
  10: '<path d="M3 20V10h7v10 M14 20V4h7v16"/><path d="M5 13h3 M5 16h3 M16 7h3 M16 11h3 M16 15h3"/>',
  11: '<path d="M2 16h20 M5 16c0-5 3-9 7-9s7 4 7 9"/>',
  12: '<circle cx="9" cy="12" r="2.5"/><circle cx="15" cy="12" r="2.5"/><path d="M7 8l-3-3 M17 8l3-3 M11.5 12h1"/>',
  13: '<path d="M13 2L6 13h5l-2 9 7-11h-5z"/>',
};

function renderRouteIcon(id: number, color: string, size = 24) {
  const bgSize = size + 8;
  return (
    <div
      style={{
        width: bgSize, height: bgSize, borderRadius: "50%",
        background: `${color}1A`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.2s",
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = `${color}33`; }}
      onMouseOut={(e) => { e.currentTarget.style.background = `${color}1A`; }}
    >
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: ROUTE_ICON_PATHS[id] || "" }}
      />
    </div>
  );
}

/* ───────── Component ───────── */

export default function HaritaPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLayersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);
  const fxStyleRef = useRef<HTMLStyleElement | null>(null);
  const noiseOverlayRef = useRef<HTMLDivElement | null>(null);

  // Explore mode state
  const [activeFilter, setActiveFilter] = useState<PlaceType | "all">("all");
  const [selectedPlace, setSelectedPlace] = useState<CulturePlace | null>(null);
  const [panelEvents, setPanelEvents] = useState<SupabaseEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [tileStyle, setTileStyle] = useState<"voyager" | "dark">("dark");
  const [mapReady, setMapReady] = useState(false);
  const isDark = tileStyle === "dark";

  // Mode state
  const [mode, setMode] = useState<MapMode>("explore");

  // Route mode state
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [showRouteList, setShowRouteList] = useState(true);

  // Mobile panel drag state
  const [panelPct, setPanelPct] = useState(40); // percent of viewport
  const dragStartYRef = useRef(0);
  const dragStartPctRef = useRef(40);

  // Fetch events for selected place
  const fetchEvents = useCallback(async (placeName: string) => {
    setEventsLoading(true);
    setPanelEvents([]);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("events")
        .select("id, title, event_date, end_date, event_type, venue, price_info")
        .eq("status", "approved")
        .gte("event_date", now)
        .ilike("venue", `%${placeName}%`)
        .order("event_date", { ascending: true })
        .limit(5);
      setPanelEvents(data || []);
    } catch {
      setPanelEvents([]);
    }
    setEventsLoading(false);
  }, []);

  const selectPlace = useCallback((place: CulturePlace) => {
    setSelectedPlace(place);
    fetchEvents(place.name);
  }, [fetchEvents]);

  // Clear route layers from map
  const clearRouteLayers = useCallback(() => {
    routeLayersRef.current.forEach((l: { remove: () => void }) => l.remove());
    routeLayersRef.current = [];
  }, []);

  // Apply / clear map visual effects for special routes
  const applyMapEffect = useCallback((fx?: string) => {
    clearMapEffect();
    if (!fx) return;
    const container = mapContainerRef.current;
    if (!container) return;
    const tilePane = container.querySelector(".leaflet-tile-pane") as HTMLElement | null;
    if (!tilePane) return;

    // Inject CSS keyframes once
    if (!fxStyleRef.current) {
      const s = document.createElement("style");
      s.textContent = `
        @keyframes waterFlow { to { stroke-dashoffset: -64; } }
        .water-flow path { animation: waterFlow 1.5s linear infinite; }
        .water-glow path { filter: drop-shadow(0 0 6px #00E5FF); }
        @keyframes neonPulse { 0%,100%{box-shadow:0 0 8px #FF980080;} 50%{box-shadow:0 0 20px #FF9800cc;} }
      `;
      document.head.appendChild(s);
      fxStyleRef.current = s;
    }

    tilePane.style.transition = "filter 0.5s, opacity 0.5s";

    if (fx === "xray") {
      tilePane.style.opacity = "0.3";
    } else if (fx === "grayscale") {
      tilePane.style.filter = "grayscale(1) contrast(1.3)";
    } else if (fx === "noir") {
      tilePane.style.filter = "sepia(0.3)";
      // noise overlay
      const noise = document.createElement("div");
      noise.style.cssText = `position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0.06;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");`;
      container.appendChild(noise);
      noiseOverlayRef.current = noise;
    } else if (fx === "rock") {
      tilePane.style.filter = "hue-rotate(30deg) saturate(0.5)";
    }
    // "neon" has no tile effect, only marker glow — handled in drawRoute
  }, []);

  const clearMapEffect = useCallback(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const tilePane = container.querySelector(".leaflet-tile-pane") as HTMLElement | null;
    if (tilePane) {
      tilePane.style.opacity = "";
      tilePane.style.filter = "";
    }
    if (noiseOverlayRef.current) {
      noiseOverlayRef.current.remove();
      noiseOverlayRef.current = null;
    }
  }, []);

  // Compute mobile bottom padding for fitBounds
  const getMobilePanelPx = useCallback(() => {
    if (typeof window === "undefined") return 0;
    const isMob = window.innerWidth <= 640;
    return isMob ? Math.round(window.innerHeight * panelPct / 100) + 20 : 0;
  }, [panelPct]);

  // Draw route on map
  const drawRoute = useCallback((route: Route, stopIdx: number, fit?: boolean) => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf) return;

    clearRouteLayers();

    const latLngs = route.stops.map((s) => [s.lat, s.lng] as [number, number]);
    const fx = route.fx;

    // Draw polyline — style varies by fx
    if (fx === "xray") {
      // Glow underline
      const glow = Leaf.polyline(latLngs, { color: "#00BCD4", weight: 10, opacity: 0.25, className: "water-glow" }).addTo(map);
      routeLayersRef.current.push(glow);
      // Animated flowing line
      const flow = Leaf.polyline(latLngs, { color: "#00E5FF", weight: 3, opacity: 0.9, dashArray: "12, 20", className: "water-flow" }).addTo(map);
      routeLayersRef.current.push(flow);
    } else if (fx === "noir") {
      const line = Leaf.polyline(latLngs, { color: "#ffffff", weight: 2, opacity: 0.3, dashArray: "6, 10" }).addTo(map);
      routeLayersRef.current.push(line);
    } else if (fx === "rock") {
      // Zigzag polyline: insert offset midpoints
      const zigzag: [number, number][] = [];
      for (let i = 0; i < latLngs.length; i++) {
        zigzag.push(latLngs[i]);
        if (i < latLngs.length - 1) {
          const midLat = (latLngs[i][0] + latLngs[i + 1][0]) / 2 + (Math.random() - 0.5) * 0.003;
          const midLng = (latLngs[i][1] + latLngs[i + 1][1]) / 2 + (Math.random() - 0.5) * 0.003;
          zigzag.push([midLat, midLng]);
        }
      }
      const line = Leaf.polyline(zigzag, { color: "#F44336", weight: 4, opacity: 0.7 }).addTo(map);
      routeLayersRef.current.push(line);
    } else {
      // Default polyline
      const polyline = Leaf.polyline(latLngs, { color: route.color, weight: 3, opacity: 0.7, dashArray: "8, 8" }).addTo(map);
      routeLayersRef.current.push(polyline);
    }

    // Draw numbered markers — neon glow for fx=neon
    const isNeon = fx === "neon";
    route.stops.forEach((stop, i) => {
      const isActive = i === stopIdx;
      const size = isActive ? 32 : 26;
      const neonGlow = isNeon ? `0 0 14px ${route.color}, 0 0 28px ${route.color}80` : "";
      const icon = Leaf.divIcon({
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${isActive ? route.color : "rgba(30,30,30,0.9)"};
          border:2px solid ${route.color};
          display:flex;align-items:center;justify-content:center;
          color:${isActive ? "#fff" : route.color};
          font-weight:700;font-size:${isActive ? 14 : 12}px;
          cursor:pointer;
          box-shadow:${isNeon ? neonGlow : (isActive ? `0 0 12px ${route.color}80` : "none")};
          transition:all 0.2s;
          ${isNeon ? "animation:neonPulse 2s ease-in-out infinite;" : ""}
        ">${i + 1}</div>`,
      });
      const marker = Leaf.marker([stop.lat, stop.lng], { icon });
      marker.on("click", () => {
        setActiveStopIndex(i);
      });
      marker.addTo(map);
      routeLayersRef.current.push(marker);
    });

    // Fit bounds with mobile panel padding
    if (fit !== false) {
      const bottomPad = getMobilePanelPx();
      map.fitBounds(Leaf.latLngBounds(latLngs), {
        paddingTopLeft: [60, 60],
        paddingBottomRight: [60, 60 + bottomPad],
        maxZoom: 16,
      });
    }
  }, [clearRouteLayers, getMobilePanelPx]);

  // Select a route
  const selectRoute = useCallback((route: Route) => {
    setActiveRoute(route);
    setActiveStopIndex(0);
    setShowRouteList(false);
    setPanelPct(40);
    applyMapEffect(route.fx);
    drawRoute(route, 0, true);
  }, [drawRoute, applyMapEffect]);

  // Deselect route
  const deselectRoute = useCallback(() => {
    clearRouteLayers();
    clearMapEffect();
    setActiveRoute(null);
    setActiveStopIndex(0);
    setShowRouteList(true);
  }, [clearRouteLayers, clearMapEffect]);

  // When active stop changes, redraw & fly to (offset for mobile panel)
  useEffect(() => {
    if (!activeRoute || !mapRef.current) return;
    drawRoute(activeRoute, activeStopIndex, false);
    const map = mapRef.current;
    const stop = activeRoute.stops[activeStopIndex];
    const bottomPad = getMobilePanelPx();
    // Fly to stop, offset upward by half the panel height in pixels
    const targetLatLng = [stop.lat, stop.lng] as [number, number];
    map.flyTo(targetLatLng, 16, { duration: 0.5 });
    // After fly completes, nudge so marker is above panel
    if (bottomPad > 0) {
      setTimeout(() => {
        const point = map.latLngToContainerPoint(targetLatLng);
        const offset = point.add([0, bottomPad / 2]);
        const newLatLng = map.containerPointToLatLng(offset);
        map.panTo(newLatLng, { duration: 0.3 });
      }, 550);
    }
  }, [activeStopIndex, activeRoute, drawRoute, getMobilePanelPx]);

  // Switch mode
  const switchMode = useCallback((newMode: MapMode) => {
    if (newMode === mode) return;
    // Clean up current mode
    if (mode === "routes") {
      clearRouteLayers();
      clearMapEffect();
      setActiveRoute(null);
      setActiveStopIndex(0);
      setShowRouteList(true);
    }
    if (mode === "explore") {
      setSelectedPlace(null);
    }
    setMode(newMode);
    // Reset map view
    if (mapRef.current) {
      mapRef.current.flyTo([39.935, 32.860], 13, { duration: 0.5 });
    }
  }, [mode, clearRouteLayers, clearMapEffect]);

  // Initialize map (dynamic import)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    import("leaflet").then((L) => {
      leafletRef.current = L.default || L;
      const Leaf = leafletRef.current;

      if (!mapContainerRef.current) return;

      const ankaraBounds = Leaf.latLngBounds([39.4, 31.5], [40.6, 33.8]);
      const map = Leaf.map(mapContainerRef.current, {
        center: [39.935, 32.860],
        zoom: 13,
        zoomControl: false,
        maxBounds: ankaraBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 10,
        maxZoom: 18,
      });
      mapRef.current = map;

      tileLayerRef.current = Leaf.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 18,
      }).addTo(map);

      Leaf.control.zoom({ position: "bottomleft" }).addTo(map);

      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });

      setMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      link.remove();
    };
  }, []);

  // Swap tile layer when tileStyle changes
  useEffect(() => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf || !mapReady) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const urls: Record<string, string> = {
      voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    };

    tileLayerRef.current = Leaf.tileLayer(urls[tileStyle], {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    // Keep tiles behind markers
    tileLayerRef.current.setZIndex(0);
  }, [tileStyle, mapReady]);

  // Manage explore markers based on filter + zoom (only in explore mode)
  useEffect(() => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf || !mapReady) return;

    // Remove old markers
    markersRef.current.forEach((m: { remove: () => void }) => m.remove());
    markersRef.current = [];

    // Only show explore markers in explore mode
    if (mode !== "explore") return;

    const filtered = PLACES.filter((p) => {
      if (activeFilter !== "all" && p.type !== activeFilter) return false;
      if (p.minZoom && currentZoom < p.minZoom) return false;
      return true;
    });

    filtered.forEach((place) => {
      const color = TYPE_COLORS[place.type];
      const svg = TYPE_SVGS[place.type];
      const showLabel = currentZoom >= 17;
      const labelColor = isDark ? "#fff" : "#1a1a2e";
      const labelShadow = isDark ? "0 1px 4px rgba(0,0,0,0.9),0 0 8px rgba(0,0,0,0.6)" : "0 1px 3px rgba(255,255,255,0.8),0 0 6px rgba(255,255,255,0.4)";
      const markerBorder = isDark ? "none" : "2px solid #fff";
      const labelHtml = showLabel
        ? `<div style="position:absolute;left:44px;top:50%;transform:translateY(-50%);white-space:nowrap;font-size:11px;font-weight:600;color:${labelColor};text-shadow:${labelShadow};pointer-events:none;">${place.name}</div>`
        : "";
      const icon = Leaf.divIcon({
        className: "culture-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        html: `<div style="position:relative;">
          <div class="marker-circle" style="
            width:36px;height:36px;border-radius:50%;
            background:${color};border:${markerBorder};box-sizing:border-box;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.4),0 0 12px ${color}50;
            cursor:pointer;transition:transform 0.2s;
            animation:marker-glow 3s infinite;
            --glow-color:${color};
          ">${svg}</div>${labelHtml}
        </div>`,
      });

      const marker = Leaf.marker([place.lat, place.lng], { icon });
      marker.on("click", () => {
        selectPlace(place);
        map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [activeFilter, currentZoom, mapReady, selectPlace, mode, isDark]);

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  };

  const activeStop = activeRoute?.stops[activeStopIndex] ?? null;

  /* ───────── Shared panel content renderer for events ───────── */
  const renderEventsSection = (compact?: boolean) => (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: compact ? 14 : 20 }}>
      <div style={{ color: "#FF6D60", fontSize: compact ? 10 : 11, letterSpacing: 2, marginBottom: compact ? 10 : 14, fontWeight: 600 }}>
        YAKLAŞAN ETKİNLİKLER
      </div>
      {eventsLoading ? (
        <div style={{ color: "#666", fontSize: compact ? 12 : 13 }}>Yükleniyor...</div>
      ) : panelEvents.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: compact ? "12px" : "16px",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ color: "#555", fontSize: compact ? 12 : 13, textAlign: "center" }}>
            Şu an planlanmış etkinlik yok
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 10 }}>
          {panelEvents.map((ev) => (
            <div key={ev.id} style={{
              background: "rgba(255,255,255,0.03)", borderRadius: compact ? 8 : 10, padding: compact ? "10px 12px" : "14px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ color: "#fff", fontSize: compact ? 13 : 14, fontWeight: 500, marginBottom: compact ? 4 : 6 }}>
                {ev.title}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {ev.event_date && (
                  <span style={{ color: "#888", fontSize: compact ? 11 : 12 }}>
                    {formatDate(ev.event_date)}
                  </span>
                )}
                {!compact && ev.price_info && (
                  <span style={{
                    color: "#666", fontSize: 11,
                    background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "2px 8px",
                  }}>
                    {ev.price_info}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ───────── Story panel content (shared between desktop & mobile) ───────── */
  const renderStoryContent = (compact?: boolean) => {
    if (!activeRoute || !activeStop) return null;
    return (
      <>
        {/* Route title */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 12 : 16,
          paddingBottom: compact ? 10 : 12, borderBottom: `1px solid ${activeRoute.color}30`,
        }}>
          {renderRouteIcon(activeRoute.id, activeRoute.color, compact ? 16 : 20)}
          <span style={{ color: activeRoute.color, fontSize: compact ? 12 : 13, fontWeight: 600, letterSpacing: 1 }}>
            {activeRoute.title}
          </span>
        </div>

        {/* Stop number */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: compact ? 28 : 32, height: compact ? 28 : 32, borderRadius: "50%",
          background: activeRoute.color, color: "#fff",
          fontSize: compact ? 14 : 16, fontWeight: 700, marginBottom: compact ? 8 : 12,
        }}>
          {activeStopIndex + 1}
        </div>

        <h2 style={{ color: "#fff", fontSize: compact ? 18 : 22, fontWeight: 600, margin: "0 0 12px 0", lineHeight: 1.3 }}>
          {activeStop.name}
        </h2>

        <p style={{ color: "#bbb", fontSize: compact ? 13 : 14, lineHeight: 1.8, margin: "0 0 20px 0" }}>
          {activeStop.story}
        </p>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setActiveStopIndex(Math.max(0, activeStopIndex - 1))}
            disabled={activeStopIndex === 0}
            style={{
              flex: 1, padding: compact ? "10px 0" : "12px 0",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: activeStopIndex === 0 ? "#444" : "#ccc",
              fontSize: compact ? 12 : 13, fontWeight: 500, cursor: activeStopIndex === 0 ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            &larr; &Ouml;nceki
          </button>
          <button
            onClick={() => setActiveStopIndex(Math.min(activeRoute.stops.length - 1, activeStopIndex + 1))}
            disabled={activeStopIndex === activeRoute.stops.length - 1}
            style={{
              flex: 1, padding: compact ? "10px 0" : "12px 0",
              background: activeStopIndex === activeRoute.stops.length - 1 ? "rgba(255,255,255,0.05)" : `${activeRoute.color}20`,
              border: `1px solid ${activeStopIndex === activeRoute.stops.length - 1 ? "rgba(255,255,255,0.1)" : activeRoute.color + "40"}`,
              borderRadius: 8,
              color: activeStopIndex === activeRoute.stops.length - 1 ? "#444" : activeRoute.color,
              fontSize: compact ? 12 : 13, fontWeight: 600,
              cursor: activeStopIndex === activeRoute.stops.length - 1 ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            Sonraki &rarr;
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginTop: 14, display: "flex", gap: 4, justifyContent: "center" }}>
          {activeRoute.stops.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveStopIndex(i)}
              style={{
                width: i === activeStopIndex ? 20 : 8, height: 8, borderRadius: 4,
                background: i === activeStopIndex ? activeRoute.color : "rgba(255,255,255,0.1)",
                cursor: "pointer", transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Back to routes */}
        <button
          onClick={deselectRoute}
          style={{
            marginTop: 20, width: "100%", padding: compact ? "8px 0" : "10px 0",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, color: "#888", fontSize: compact ? 11 : 12,
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          &larr; Rotalara D&ouml;n
        </button>
      </>
    );
  };

  const uiText = isDark ? "#fff" : "#1a1a2e";
  const uiMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const uiSubtle = isDark ? "#666" : "#888";
  const uiContainerBg = isDark ? "#1a1a1a" : "#f2f2f2";

  return (
    <div style={{ width: "100%", height: "100vh", background: uiContainerBg, position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes marker-glow {
          0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 12px var(--glow-color, #4A9EFF)50; }
          50% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 20px var(--glow-color, #4A9EFF)80; }
        }
        .leaflet-container { background: ${uiContainerBg} !important; }
        .leaflet-tile-pane {
          filter: ${tileStyle === "dark" ? "brightness(1.3)" : "none"};
        }
        .culture-marker .marker-circle:hover { transform: scale(1.17); }
      `}</style>

      {/* Map */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: "none" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <Link
              href="/"
              style={{
                color: uiMuted, fontSize: 13, fontWeight: 500,
                textDecoration: "none", pointerEvents: "auto", transition: "color 0.2s",
              }}
              onMouseOver={(e) => { (e.target as HTMLElement).style.color = "#FF6D60"; }}
              onMouseOut={(e) => { (e.target as HTMLElement).style.color = uiMuted; }}
            >
              &larr; Ana Sayfa
            </Link>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#FF6D60", marginBottom: 2 }}>KLEMENS</div>
              <div style={{ fontSize: 16, fontWeight: 300, letterSpacing: 3, color: uiText }}>
                K&Uuml;LT&Uuml;R HARİTASI
              </div>
              <div style={{ fontSize: 10, color: uiSubtle, marginTop: 1 }}>Ankara</div>
            </div>
          </div>
        </div>

        {/* Mode tabs + Filters */}
        <div style={{ padding: "0 20px 8px", pointerEvents: "auto" }}>
          {/* Mode switch + Day/Night toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            {(["explore", "routes"] as MapMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  padding: "7px 0",
                  minWidth: 100,
                  background: isDark
                    ? (mode === m ? "rgba(255,109,96,0.25)" : "rgba(0,0,0,0.5)")
                    : (mode === m ? "#fff" : "#fff"),
                  border: isDark
                    ? `1px solid ${mode === m ? "#FF6D60" : "rgba(255,255,255,0.08)"}`
                    : `1px solid ${mode === m ? "#FF6D60" : "#e0e0e0"}`,
                  borderBottom: !isDark && mode === m ? "2px solid #FF6D60" : undefined,
                  borderRadius: 8,
                  color: isDark
                    ? (mode === m ? "#fff" : "#666")
                    : (mode === m ? "#FF6D60" : "#374151"),
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s", letterSpacing: 0.5,
                  backdropFilter: "blur(8px)",
                  boxShadow: !isDark ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {m === "explore" ? "Keşfet" : "Rotalar"}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 2, alignItems: "center" }}>
              <button onClick={() => setTileStyle("voyager")} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", transition: "all 0.2s" }} title="Gündüz">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={!isDark ? "#FF6D60" : "rgba(255,255,255,0.3)"} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              </button>
              <button onClick={() => setTileStyle("dark")} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", transition: "all 0.2s" }} title="Gece">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#FF6D60" : "rgba(0,0,0,0.25)"} strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </button>
            </div>
          </div>

          {/* Filters (explore only) */}
          {mode === "explore" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 }}>
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: isDark
                      ? `1px solid ${activeFilter === f.key
                          ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                          : "rgba(255,255,255,0.12)"}`
                      : `${activeFilter === f.key ? "2px" : "1px"} solid ${activeFilter === f.key
                          ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                          : "#e0e0e0"}`,
                    background: isDark
                      ? (activeFilter === f.key
                          ? (f.key === "all" ? "rgba(255,109,96,0.2)" : `${TYPE_COLORS[f.key as PlaceType]}20`)
                          : "rgba(0,0,0,0.6)")
                      : "#fff",
                    color: isDark
                      ? (activeFilter === f.key
                          ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                          : "#999")
                      : (activeFilter === f.key
                          ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                          : "#374151"),
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: !isDark ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  {f.key !== "all" && (
                    <span style={{
                      display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                      background: TYPE_COLORS[f.key as PlaceType],
                      marginRight: 6, verticalAlign: "middle",
                    }} />
                  )}
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend — bottom right (explore only) */}
      {mode === "explore" && (
        <div style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 10,
          background: isDark ? "rgba(0,0,0,0.7)" : "#fff",
          borderRadius: 10, padding: "10px 14px",
          backdropFilter: "blur(8px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e0e0e0"}`,
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {(Object.keys(TYPE_COLORS) as PlaceType[]).map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: t === "tarihi" ? 0 : 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: TYPE_COLORS[t],
                boxShadow: `0 0 6px ${TYPE_COLORS[t]}`,
              }} />
              <span style={{ color: isDark ? "#999" : "#374151", fontSize: 11 }}>{TYPE_LABELS[t]}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ EXPLORE MODE PANELS ═══════ */}

      {/* Desktop detail panel — slide in from right */}
      {mode === "explore" && (
        <div className="desktop-panel" style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0,
          width: selectedPlace ? 380 : 0,
          maxWidth: "100%",
          zIndex: 20,
          background: "rgba(18,18,18,0.95)",
          backdropFilter: "blur(12px)",
          borderLeft: selectedPlace ? "1px solid rgba(255,255,255,0.08)" : "none",
          transition: "width 0.3s ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {selectedPlace && (
            <div style={{ width: 380, maxWidth: "100vw", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedPlace(null)}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#999", fontSize: 18, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => { (e.currentTarget).style.color = "#fff"; }}
                  onMouseOut={(e) => { (e.currentTarget).style.color = "#999"; }}
                >
                  &times;
                </button>
              </div>
              <div style={{ padding: "0 24px 24px", flex: 1 }}>
                <div style={{
                  display: "inline-block",
                  padding: "4px 12px", borderRadius: 12,
                  background: `${TYPE_COLORS[selectedPlace.type]}20`,
                  border: `1px solid ${TYPE_COLORS[selectedPlace.type]}40`,
                  color: TYPE_COLORS[selectedPlace.type],
                  fontSize: 11, fontWeight: 600, letterSpacing: 1,
                  marginBottom: 12,
                }}>
                  {TYPE_LABELS[selectedPlace.type]}
                </div>
                <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 600, margin: "0 0 12px 0", lineHeight: 1.3 }}>
                  {selectedPlace.name}
                </h2>
                <p style={{ color: "#999", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px 0" }}>
                  {selectedPlace.desc}
                </p>
                {renderEventsSection()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explore mobile panel (bottom sheet) */}
      {mode === "explore" && selectedPlace && (
        <div
          className="mobile-panel"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 25,
            background: "rgba(18,18,18,0.97)", backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px 16px 0 0", maxHeight: "60vh",
            overflowY: "auto", padding: "20px 20px 28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
          </div>
          <button
            onClick={() => setSelectedPlace(null)}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#999", fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            &times;
          </button>
          <div style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 10,
            background: `${TYPE_COLORS[selectedPlace.type]}20`,
            border: `1px solid ${TYPE_COLORS[selectedPlace.type]}40`,
            color: TYPE_COLORS[selectedPlace.type],
            fontSize: 10, fontWeight: 600, letterSpacing: 1, marginBottom: 10,
          }}>
            {TYPE_LABELS[selectedPlace.type]}
          </div>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 600, margin: "0 0 8px 0", lineHeight: 1.3 }}>
            {selectedPlace.name}
          </h3>
          <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px 0" }}>
            {selectedPlace.desc}
          </p>
          {renderEventsSection(true)}
        </div>
      )}

      {/* ═══════ ROUTES MODE PANELS ═══════ */}

      {/* Desktop: Route list panel (left side) */}
      {mode === "routes" && showRouteList && !activeRoute && (
        <div className="desktop-panel" style={{
          position: "absolute", top: 160, left: 20, bottom: 20,
          width: 280, zIndex: 20, overflowY: "auto",
          background: "rgba(18,18,18,0.95)", backdropFilter: "blur(12px)",
          borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
          padding: "16px",
        }}>
          <div style={{ color: "#FF6D60", fontSize: 10, letterSpacing: 2, marginBottom: 14, fontWeight: 600 }}>
            ROTALAR
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ROUTES.map((route) => {
              const isNightLocked = route.nightOnly && (() => { const h = new Date().getHours(); return h >= 5 && h < 23; })();
              return (
              <button
                key={route.id}
                onClick={() => !isNightLocked && selectRoute(route)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${route.color}`,
                  cursor: isNightLocked ? "not-allowed" : "pointer", textAlign: "left",
                  transition: "all 0.2s",
                  opacity: isNightLocked ? 0.4 : 1,
                }}
                onMouseOver={(e) => { if (!isNightLocked) (e.currentTarget).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseOut={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.03)"; }}
              >
                {renderRouteIcon(route.id, route.color, 22)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {route.title}
                    {isNightLocked && <span style={{ marginLeft: 6 }}>{"\u{1F512}"}</span>}
                  </div>
                  <div style={{ color: isNightLocked ? "#FF9800" : "#888", fontSize: 11, marginBottom: 6, lineHeight: 1.4 }}>
                    {isNightLocked ? "Gece Kuşları İçin — 23:00'te Açılır" : route.desc}
                  </div>
                  <div style={{ display: "flex", gap: 8, color: "#666", fontSize: 10 }}>
                    <span>{route.stops.length} durak</span>
                    <span>&middot;</span>
                    <span>{route.duration}</span>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop: Story panel (right side, when route active) */}
      {mode === "routes" && activeRoute && activeStop && (
        <div className="desktop-panel" style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: 380, zIndex: 20,
          background: "rgba(18,18,18,0.95)", backdropFilter: "blur(12px)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ width: 380, height: "100%", overflowY: "auto", padding: "24px" }}>
            {renderStoryContent()}
          </div>
        </div>
      )}

      {/* Mobile: Route list bottom sheet */}
      {mode === "routes" && showRouteList && !activeRoute && (
        <div
          className="mobile-panel"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 25,
            background: "rgba(18,18,18,0.97)", backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px 16px 0 0", maxHeight: "55vh",
            overflowY: "auto", padding: "20px 16px 28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
          </div>
          <div style={{ color: "#FF6D60", fontSize: 10, letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>
            ROTALAR
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ROUTES.map((route) => {
              const isNightLocked = route.nightOnly && (() => { const h = new Date().getHours(); return h >= 5 && h < 23; })();
              return (
              <button
                key={route.id}
                onClick={() => !isNightLocked && selectRoute(route)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${route.color}`,
                  cursor: isNightLocked ? "not-allowed" : "pointer", textAlign: "left",
                  opacity: isNightLocked ? 0.4 : 1,
                }}
              >
                {renderRouteIcon(route.id, route.color, 18)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                    {route.title}
                    {isNightLocked && <span style={{ marginLeft: 4, fontSize: 11 }}>{"\u{1F512}"}</span>}
                  </div>
                  {isNightLocked ? (
                    <div style={{ color: "#FF9800", fontSize: 10, marginBottom: 3 }}>23:00&apos;te Açılır</div>
                  ) : (
                    <div style={{ display: "flex", gap: 6, color: "#666", fontSize: 10 }}>
                      <span>{route.stops.length} durak</span>
                      <span>&middot;</span>
                      <span>{route.duration}</span>
                    </div>
                  )}
                </div>
              </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile: Story bottom sheet (draggable) */}
      {mode === "routes" && activeRoute && activeStop && (
        <div
          className="mobile-panel"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 25,
            background: "rgba(18,18,18,0.97)", backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px 16px 0 0",
            height: `${panelPct}vh`,
            overflowY: "auto",
            transition: dragStartYRef.current ? "none" : "height 0.3s ease",
          }}
        >
          {/* Drag handle */}
          <div
            style={{ padding: "12px 16px 8px", cursor: "grab", touchAction: "none" }}
            onTouchStart={(e) => {
              dragStartYRef.current = e.touches[0].clientY;
              dragStartPctRef.current = panelPct;
            }}
            onTouchMove={(e) => {
              if (!dragStartYRef.current) return;
              const dy = dragStartYRef.current - e.touches[0].clientY;
              const deltaPct = (dy / window.innerHeight) * 100;
              const next = Math.max(30, Math.min(70, dragStartPctRef.current + deltaPct));
              setPanelPct(Math.round(next));
            }}
            onTouchEnd={() => {
              // Snap to nearest: 30, 40, 70
              const snaps = [30, 40, 70];
              const closest = snaps.reduce((a, b) => Math.abs(b - panelPct) < Math.abs(a - panelPct) ? b : a);
              setPanelPct(closest);
              dragStartYRef.current = 0;
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
            </div>
          </div>
          <div style={{ padding: "0 16px 28px", overflowY: "auto", height: "calc(100% - 40px)" }}>
            {renderStoryContent(true)}
          </div>
        </div>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-panel { display: none !important; }
        }
        @media (min-width: 641px) {
          .mobile-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
