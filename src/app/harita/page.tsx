"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

/* ───────── Types ───────── */

type PlaceType = "müze" | "galeri" | "konser" | "tiyatro" | "tarihi";

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
};

type MapMode = "explore" | "routes";

/* ───────── Constants ───────── */

const TYPE_COLORS: Record<PlaceType, string> = {
  müze: "#4A9EFF",
  galeri: "#FF6D60",
  konser: "#9B6BB0",
  tiyatro: "#4CAF50",
  tarihi: "#FFB300",
};

const TYPE_LABELS: Record<PlaceType, string> = {
  müze: "Müze",
  galeri: "Galeri",
  konser: "Konser",
  tiyatro: "Tiyatro",
  tarihi: "Tarihi",
};

const TYPE_SVGS: Record<PlaceType, string> = {
  müze: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M10 10h1"/><path d="M14 10h-1"/></svg>`,
  galeri: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 3a2.5 2.5 0 0 1 0 5"/><path d="M3 19.5C3 10 13.5 12 13.5 6.5"/><path d="M5.5 19.5 3 22"/><path d="M18.5 19.5 21 22"/><path d="M12 19.5a7.5 7.5 0 0 0-7.5 0h15a7.5 7.5 0 0 0-7.5 0z"/></svg>`,
  konser: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  tiyatro: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v4a8 8 0 0 1-8 8H8a8 8 0 0 1-6-3"/><circle cx="10" cy="9" r="1"/><circle cx="16" cy="9" r="1"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>`,
  tarihi: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M4 21V11l4-4 4 4 4-4 4 4v10"/><path d="M9 21v-4h6v4"/><path d="M3 11h18"/></svg>`,
};

const FILTER_OPTIONS: { key: PlaceType | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "müze", label: "Müzeler" },
  { key: "galeri", label: "Galeriler" },
  { key: "konser", label: "Konser" },
  { key: "tiyatro", label: "Tiyatro" },
  { key: "tarihi", label: "Tarihi" },
];

const PLACES: CulturePlace[] = [
  { lat: 39.9381, lng: 32.8645, type: "müze", name: "Anadolu Medeniyetleri Müzesi", desc: "Paleolitik Çağ'dan Osmanlı'ya Anadolu'nun binlerce yıllık tarihi. 1997 Avrupa Yılın Müzesi ödüllü." },
  { lat: 39.9370, lng: 32.8640, type: "müze", name: "Erimtan Arkeoloji ve Sanat Müzesi", desc: "Ankara Kalesi eteklerinde arkeoloji ve sanat koleksiyonu. Özel sergiler ve etkinlikler." },
  { lat: 39.9385, lng: 32.8650, type: "müze", name: "Rahmi M. Koç Müzesi", desc: "Tarihi Çengelhan'da sanayi, ulaşım ve iletişim tarihine dair interaktif sergiler." },
  { lat: 39.9390, lng: 32.8550, type: "müze", name: "Etnografya Müzesi", desc: "Selçuklu'dan Cumhuriyet'e Türk kültürü. Atatürk'ün ilk defnedildiği yer." },
  { lat: 39.9400, lng: 32.8530, type: "müze", name: "Devlet Resim ve Heykel Müzesi", desc: "1927'den beri Türk resim sanatı. 6 salonda eserler, 3 güzel sanatlar galerisi." },
  { lat: 39.9254, lng: 32.8369, type: "müze", name: "Anıtkabir ve Atatürk Müzesi", desc: "Mustafa Kemal Atatürk'ün anıt mezarı. Kurtuluş Savaşı belgeleri ve kişisel eşyalar." },
  { lat: 39.9430, lng: 32.8540, type: "müze", name: "Kurtuluş Savaşı Müzesi (I. TBMM)", desc: "Birinci Meclis binası. Cumhuriyet'in temellerinin atıldığı tarihi mekan." },
  { lat: 39.9425, lng: 32.8545, type: "müze", name: "Cumhuriyet Müzesi (II. TBMM)", desc: "İkinci Meclis binası. İlk anayasaların yazıldığı, kritik kararların alındığı yer." },
  { lat: 39.9383, lng: 32.8655, type: "müze", name: "Gökyay Vakfı Satranç Müzesi", desc: "110 ülkeden 723 satranç takımı. Tematik bölümler ve eğitim atölyeleri." },
  { lat: 39.8673, lng: 32.7495, type: "müze", name: "Altın Köşk Müzesi", desc: "Türkiye'nin ilk mimarlık ve mobilya müzesi. 1000 form ve motiften esinlenmiş tasarım." },
  { lat: 39.9415, lng: 32.8535, type: "müze", name: "PTT Pul Müzesi", desc: "Neo-klasik binada posta tarihi. Osmanlı'dan Cumhuriyet'e pullar ve haberleşme eserleri." },
  { lat: 39.9350, lng: 32.8520, type: "müze", name: "Vakıf Eserleri Müzesi", desc: "Cami ve mescitlerden toplanan halı, kilim, Kur'an-ı Kerim ve şamdanlar." },
  { lat: 39.9360, lng: 32.8610, type: "müze", name: "SOKUM - Somut Olmayan Kültürel Miras Müzesi", desc: "Karagöz-Hacivat, meddah, ebru, kına geceleri. Türkiye'nin ilk somut olmayan miras müzesi." },
  { lat: 39.9395, lng: 32.8480, type: "galeri", name: "CerModern", desc: "Eski TCDD atölyelerinde çağdaş sanat. Sergiler, atölyeler, film gösterimleri ve konserler." },
  { lat: 39.9210, lng: 32.8560, type: "galeri", name: "Galeri Nev", desc: "Türk çağdaş sanatının öncü galerilerinden." },
  { lat: 39.9147, lng: 32.8107, type: "konser", name: "CSO Ada Ankara", desc: "Cumhurbaşkanlığı Senfoni Orkestrası'nın evi. Ziraat Ana Salon ve Bankkart Mavi Salon." },
  { lat: 39.8673, lng: 32.7495, type: "konser", name: "Bilkent Konser Salonu", desc: "Türkiye'nin akustik açıdan en iyi salonlarından biri." },
  { lat: 39.9110, lng: 32.8020, type: "konser", name: "Congresium", desc: "Büyük ölçekli konser ve etkinliklere ev sahipliği yapan merkez." },
  { lat: 39.9180, lng: 32.8590, type: "konser", name: "Atatürk Kültür Merkezi", desc: "Çankaya Belediyesi. Mavi Salon ve Kırmızı Salon'da tiyatro, opera, konser." },
  { lat: 39.9420, lng: 32.8543, type: "tiyatro", name: "Ankara Devlet Tiyatrosu", desc: "Türkiye'nin en köklü tiyatro kurumlarından biri." },
  { lat: 39.9200, lng: 32.8540, type: "tiyatro", name: "Ankara Devlet Opera ve Balesi", desc: "Opera, bale ve müzikal gösterileri." },
  { lat: 39.9408, lng: 32.8644, type: "tarihi", name: "Ankara Kalesi", desc: "MÖ 5. yüzyıldan. Galatlar, Romalılar, Selçuklular. Panoramik şehir manzarası." },
  { lat: 39.9395, lng: 32.8680, type: "tarihi", name: "Hamamönü", desc: "Restore edilmiş Osmanlı evleri, sanat atölyeleri, kafeler. Sanat Sokağı ve el sanatları.", minZoom: 14 },
  { lat: 39.9410, lng: 32.8630, type: "tarihi", name: "Hacı Bayram Camii", desc: "15. yüzyıl. Augustus Tapınağı'nın hemen yanında, Ankara'nın en önemli camileri." },
  { lat: 39.9412, lng: 32.8632, type: "tarihi", name: "Augustus Tapınağı", desc: "Roma İmparatoru Augustus döneminden. Res Gestae kitabesi dünya tarihinin önemli belgeleri." },
  { lat: 39.9440, lng: 32.8600, type: "tarihi", name: "Roma Hamamı", desc: "3. yüzyıl Roma dönemi hamamı kalıntıları. Palaestra, frigidarium ve caldarium bölümleri." },
  { lat: 39.9388, lng: 32.8670, type: "tarihi", name: "Taceddin Dergahı (Mehmet Akif Ersoy Müzesi)", desc: "İstiklal Marşı'nın yazıldığı ev. Mehmet Akif Ersoy'un yaşadığı mekan.", minZoom: 14 },
  { lat: 39.9400, lng: 32.8660, type: "tarihi", name: "Pilavoğlu Hanı", desc: "Tarihi han. Kafeler, sanat galerileri ve butik dükkanlar.", minZoom: 15 },
  { lat: 39.9405, lng: 32.8645, type: "tarihi", name: "Samanpazarı (Antikacılar)", desc: "Ankara'nın antikacılar caddesi. Nostalji meraklıları için hazine.", minZoom: 15 },
  { lat: 39.9392, lng: 32.8675, type: "tarihi", name: "Sanat Sokağı", desc: "Hamamönü'nde sanat kursları, ressam atölyeleri ve el sanatları dükkanları.", minZoom: 15 },
  { lat: 39.9398, lng: 32.8668, type: "tarihi", name: "Karacabey Hamamı", desc: "Hamamönü'ne adını veren tarihi hamam. Osmanlı dönemi sosyal merkezi.", minZoom: 15 },
];

const ROUTES: Route[] = [
  {
    id: 1,
    title: "Cumhuriyet Yürüyüşü",
    icon: "\u{1F3DB}\uFE0F",
    duration: "~3 saat",
    color: "#FF6D60",
    desc: "Meclis'ten Anıtkabir'e, Cumhuriyet'in izinde",
    stops: [
      { lat: 39.9430, lng: 32.8540, name: "Kurtuluş Savaşı Müzesi (I. TBMM)", story: "23 Nisan 1920'de Mustafa Kemal Atatürk'ün açtığı ilk Meclis. Cumhuriyet'in temelleri bu binada atıldı. Savaş stratejileri burada belirlendi, bağımsızlık mücadelesi buradan yönetildi." },
      { lat: 39.9425, lng: 32.8545, name: "Cumhuriyet Müzesi (II. TBMM)", story: "1924-1961 arasında Meclis binası olarak kullanıldı. İlk anayasalar burada yazıldı, devrim kanunları burada kabul edildi. Orijinal Meclis sıraları ve Atatürk'ün eşyaları sergileniyor." },
      { lat: 39.9390, lng: 32.8550, name: "Etnografya Müzesi", story: "Atatürk 1938'de vefat ettiğinde naaşı ilk olarak buraya defnedildi. 15 yıl burada kaldıktan sonra 1953'te Anıtkabir'e taşındı. Selçuklu'dan Cumhuriyet'e Anadolu kültürünün izleri." },
      { lat: 39.9400, lng: 32.8530, name: "Devlet Resim ve Heykel Müzesi", story: "1927'de açılan müze, Cumhuriyet'in sanat vizyonunu yansıtır. Türk resim sanatının en kapsamlı koleksiyonu. Aynı binada opera, bale ve konser etkinlikleri de düzenlenir." },
      { lat: 39.9254, lng: 32.8369, name: "Anıtkabir", story: "Mustafa Kemal Atatürk'ün ebedi istirahatgahı. 1944'te başlanan inşaat 1953'te tamamlandı. Aslanlı Yol, Barış Parkı ve müze bölümüyle Türkiye'nin en önemli anıtı." },
    ],
  },
  {
    id: 2,
    title: "Antik Ankara",
    icon: "\u{1F3FA}",
    duration: "~2 saat",
    color: "#FFB300",
    desc: "Roma'dan Selçuklu'ya, antik medeniyetlerin izinde",
    stops: [
      { lat: 39.9440, lng: 32.8600, name: "Roma Hamamı", story: "MS 3. yüzyılda İmparator Caracalla döneminde inşa edildi. Palaestra (spor alanı), frigidarium (soğuk bölüm) ve caldarium (sıcak bölüm) kalıntıları görülebilir." },
      { lat: 39.9412, lng: 32.8632, name: "Augustus Tapınağı", story: "MÖ 25-20 yıllarında inşa edildi. Duvarlarında Roma İmparatoru Augustus'un siyasi vasiyetnamesi 'Res Gestae' yazılı — Latince ve Yunanca. Dünyadaki en iyi korunmuş kopyası." },
      { lat: 39.9410, lng: 32.8630, name: "Hacı Bayram Camii", story: "1427-1428 yıllarında inşa edildi. Augustus Tapınağı'nın hemen yanında — Roma ve Osmanlı yan yana. Ankara'nın en kutsal mekanlarından biri." },
      { lat: 39.9408, lng: 32.8644, name: "Ankara Kalesi", story: "MÖ 5. yüzyılda Galatlar tarafından kuruldu. Roma, Bizans, Selçuklu ve Osmanlı dönemlerinde yenilendi. İç kale ve dış kale olmak üzere iki bölümden oluşur. Zirvedeki Akkale burcu en yüksek nokta." },
      { lat: 39.9381, lng: 32.8645, name: "Anadolu Medeniyetleri Müzesi", story: "Osmanlı dönemi Kurşunlu Han ve Mahmut Paşa Bedesteni'nde kuruldu. Paleolitik Çağ'dan Osmanlı'ya 1 milyondan fazla eser. 1997 Avrupa Yılın Müzesi." },
    ],
  },
  {
    id: 3,
    title: "Hamamönü & Kale Kültür Turu",
    icon: "\u{1F3D8}\uFE0F",
    duration: "~2.5 saat",
    color: "#4CAF50",
    desc: "Osmanlı evleri, sanat sokakları ve tarihi hanlar",
    stops: [
      { lat: 39.9395, lng: 32.8680, name: "Hamamönü Giriş", story: "Osmanlı döneminden kalma evleri 2006'daki restorasyon projesiyle hayat buldu. Dar taş sokakları, renkli kafeleri ve sanat atölyeleriyle Ankara'nın en nostaljik köşesi." },
      { lat: 39.9398, lng: 32.8668, name: "Karacabey Hamamı", story: "Hamamönü'ne adını veren tarihi hamam. Osmanlı döneminde sosyal yaşamın merkezi. Çevresinde gelişen mahalle bugün Ankara'nın en popüler turistik alanlarından." },
      { lat: 39.9388, lng: 32.8670, name: "Taceddin Dergahı", story: "Mehmet Akif Ersoy İstiklal Marşı'nı burada yazdı. 1920-1921 kışında, Ankara'nın en zor günlerinde, bu mütevazı odada milletin ruhunu şiire döktü." },
      { lat: 39.9392, lng: 32.8675, name: "Sanat Sokağı", story: "Hamamönü restorasyonuyla oluşturulan sanat caddesi. Ressam atölyeleri, seramik dükkanları, el sanatları. Hafta sonları canlı müzik ve sokak performansları." },
      { lat: 39.9405, lng: 32.8645, name: "Samanpazarı", story: "Ankara'nın antikacılar caddesi. Osmanlı'dan kalma saatler, radyolar, bakır eşyalar. Her objenin bir hikayesi var. Nostalji meraklıları için hazine." },
      { lat: 39.9383, lng: 32.8655, name: "Pilavoğlu Hanı", story: "Tarihi Osmanlı hanı. Günümüzde sanat galerileri ve butik kafeler. Taş mimarisi ve sakin atmosferiyle kalabalıktan kaçış noktası." },
    ],
  },
  {
    id: 4,
    title: "Gastronomi Güzergahı",
    icon: "\u{1F37D}\uFE0F",
    duration: "~3 saat",
    color: "#E91E63",
    desc: "Ankara'nın lezzet durakları",
    stops: [
      { lat: 39.9395, lng: 32.8680, name: "Hamamönü Kahvaltı Sokağı", story: "Geleneksel Ankara kahvaltısı için en popüler adres. Osmanlı evlerinin avlularında serpme kahvaltı. Tahtakale Kahvecisi'nde kumda pişen dibek kahvesi kaçırılmaz." },
      { lat: 39.9420, lng: 32.8560, name: "Boğaziçi Lokantası", story: "Ankara'nın en eski ve prestijli lokantalarından. Ulus'ta, Hamamönü'ne yürüme mesafesinde. Meşhur Ankara Tavası buranın imza yemeği." },
      { lat: 39.9408, lng: 32.8644, name: "Kale İçi Kafeleri", story: "Ankara Kalesi surlarının içindeki butik kafeler. Üçüncü dalga kahve çeşitleri, kale manzarası eşliğinde. Geleneksel doku ile modern lezzet bir arada." },
      { lat: 39.9385, lng: 32.8650, name: "Çengelhan Brasserie", story: "Rahmi M. Koç Müzesi içindeki şık restoran. Tarihi handa, taş duvarlar ve nostaljik dekorasyon. Geleneksel Türk mutfağı ve dünya lezzetleri." },
      { lat: 39.9340, lng: 32.8560, name: "Kızılay Çevresi", story: "Ankara'nın modern gastronomi merkezi. Sakarya Caddesi'ndeki meyhaneler, Tunalı'daki kafeler. Her mutfaktan lezzet bir arada." },
    ],
  },
  {
    id: 5,
    title: "Edebiyat Ankara'sı",
    icon: "\u{1F4D6}",
    duration: "~2.5 saat",
    color: "#4A9EFF",
    desc: "Şairlerin ve yazarların izinde",
    stops: [
      { lat: 39.9388, lng: 32.8670, name: "Mehmet Akif Ersoy Evi", story: "İstiklal Marşı şairinin Ankara'daki evi. Milli mücadele yıllarında burada yaşadı ve milletin ruhunu dizelerine aktardı. 'Korkma, sönmez bu şafaklarda yüzen al sancak' burada doğdu." },
      { lat: 39.9430, lng: 32.8540, name: "I. TBMM — Edebiyatçılar Kürsüsü", story: "İlk Meclis'te edebiyatçı milletvekilleri de vardı. Halide Edib Adıvar cephe konuşmalarını burada yaptı. Yakup Kadri, Falih Rıfkı gibi isimler Ankara'yı eserlerine taşıdı." },
      { lat: 39.9340, lng: 32.8560, name: "Kızılay — Edebiyat Kafeleri", story: "Cumhuriyet'in ilk yıllarında Ankara'nın edebiyat çevresi Kızılay'da buluşurdu. Karpiç Lokantası efsaneydi. Bugün Dost Kitabevi ve çevresi bu geleneği sürdürüyor." },
      { lat: 39.9250, lng: 32.8600, name: "Cebeci — Dil ve Tarih-Coğrafya Fakültesi", story: "1936'da Atatürk'ün talimatıyla kurulan DTCF, Türk aydınlanmasının kalesi. Nurullah Ataç, Melih Cevdet Anday, Oktay Rifat bu koridorlarda yetişti." },
    ],
  },
];

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

  // Explore mode state
  const [activeFilter, setActiveFilter] = useState<PlaceType | "all">("all");
  const [selectedPlace, setSelectedPlace] = useState<CulturePlace | null>(null);
  const [panelEvents, setPanelEvents] = useState<SupabaseEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [mapReady, setMapReady] = useState(false);

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

    // Draw polyline
    const latLngs = route.stops.map((s) => [s.lat, s.lng] as [number, number]);
    const polyline = Leaf.polyline(latLngs, {
      color: route.color,
      weight: 3,
      opacity: 0.7,
      dashArray: "8, 8",
    }).addTo(map);
    routeLayersRef.current.push(polyline);

    // Draw numbered markers
    route.stops.forEach((stop, i) => {
      const isActive = i === stopIdx;
      const size = isActive ? 32 : 26;
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
          box-shadow:${isActive ? `0 0 12px ${route.color}80` : "none"};
          transition:all 0.2s;
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
      map.fitBounds(polyline.getBounds(), {
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
    drawRoute(route, 0, true);
  }, [drawRoute]);

  // Deselect route
  const deselectRoute = useCallback(() => {
    clearRouteLayers();
    setActiveRoute(null);
    setActiveStopIndex(0);
    setShowRouteList(true);
  }, [clearRouteLayers]);

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
  }, [mode, clearRouteLayers]);

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

      const ankaraBounds = Leaf.latLngBounds([39.6, 32.2], [40.2, 33.4]);
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

      Leaf.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
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
      const showLabel = currentZoom >= 15;
      const labelHtml = showLabel
        ? `<div style="position:absolute;left:44px;top:50%;transform:translateY(-50%);white-space:nowrap;font-size:11px;font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.9),0 0 8px rgba(0,0,0,0.6);pointer-events:none;">${place.name}</div>`
        : "";
      const icon = Leaf.divIcon({
        className: "culture-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        html: `<div style="position:relative;">
          <div class="marker-circle" style="
            width:36px;height:36px;border-radius:50%;
            background:${color};
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
  }, [activeFilter, currentZoom, mapReady, selectPlace, mode]);

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
          <span style={{ fontSize: compact ? 18 : 22 }}>{activeRoute.icon}</span>
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

  return (
    <div style={{ width: "100%", height: "100vh", background: "#1a1a1a", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes marker-glow {
          0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 12px var(--glow-color, #4A9EFF)50; }
          50% { box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 20px var(--glow-color, #4A9EFF)80; }
        }
        .leaflet-container { background: #1a1a1a !important; }
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
                color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500,
                textDecoration: "none", pointerEvents: "auto", transition: "color 0.2s",
              }}
              onMouseOver={(e) => { (e.target as HTMLElement).style.color = "#FF6D60"; }}
              onMouseOut={(e) => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
            >
              &larr; Ana Sayfa
            </Link>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#FF6D60", marginBottom: 2 }}>KLEMENS</div>
              <div style={{ fontSize: 16, fontWeight: 300, letterSpacing: 3, color: "#fff" }}>
                K&Uuml;LT&Uuml;R HARİTASI
              </div>
              <div style={{ fontSize: 10, color: "#666", marginTop: 1 }}>Ankara</div>
            </div>
          </div>
        </div>

        {/* Mode tabs + Filters */}
        <div style={{ padding: "0 20px 8px", pointerEvents: "auto" }}>
          {/* Mode switch */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {(["explore", "routes"] as MapMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  padding: "7px 0",
                  minWidth: 100,
                  background: mode === m ? "rgba(255,109,96,0.25)" : "rgba(0,0,0,0.5)",
                  border: `1px solid ${mode === m ? "#FF6D60" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8,
                  color: mode === m ? "#fff" : "#666",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s", letterSpacing: 0.5,
                  backdropFilter: "blur(8px)",
                }}
              >
                {m === "explore" ? "Keşfet" : "Rotalar"}
              </button>
            ))}
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
                    border: `1px solid ${activeFilter === f.key
                      ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                      : "rgba(255,255,255,0.12)"}`,
                    background: activeFilter === f.key
                      ? (f.key === "all" ? "rgba(255,109,96,0.2)" : `${TYPE_COLORS[f.key as PlaceType]}20`)
                      : "rgba(0,0,0,0.6)",
                    color: activeFilter === f.key
                      ? (f.key === "all" ? "#FF6D60" : TYPE_COLORS[f.key as PlaceType])
                      : "#999",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {f.key !== "all" && (
                    <span style={{
                      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
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
          background: "rgba(0,0,0,0.7)", borderRadius: 10, padding: "10px 14px",
          backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          {(Object.keys(TYPE_COLORS) as PlaceType[]).map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: t === "tarihi" ? 0 : 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[t],
                boxShadow: `0 0 6px ${TYPE_COLORS[t]}`,
              }} />
              <span style={{ color: "#999", fontSize: 11 }}>{TYPE_LABELS[t]}</span>
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
            {ROUTES.map((route) => (
              <button
                key={route.id}
                onClick={() => selectRoute(route)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${route.color}`,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseOut={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.03)"; }}
              >
                <span style={{ fontSize: 24, lineHeight: 1 }}>{route.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {route.title}
                  </div>
                  <div style={{ color: "#888", fontSize: 11, marginBottom: 6, lineHeight: 1.4 }}>
                    {route.desc}
                  </div>
                  <div style={{ display: "flex", gap: 8, color: "#666", fontSize: 10 }}>
                    <span>{route.stops.length} durak</span>
                    <span>&middot;</span>
                    <span>{route.duration}</span>
                  </div>
                </div>
              </button>
            ))}
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
            {ROUTES.map((route) => (
              <button
                key={route.id}
                onClick={() => selectRoute(route)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${route.color}`,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>{route.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                    {route.title}
                  </div>
                  <div style={{ display: "flex", gap: 6, color: "#666", fontSize: 10 }}>
                    <span>{route.stops.length} durak</span>
                    <span>&middot;</span>
                    <span>{route.duration}</span>
                  </div>
                </div>
              </button>
            ))}
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
