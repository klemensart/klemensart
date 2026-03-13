"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

/* ── Tema: Koyu Müze Ambiyansı ── */
const T = {
  bg: "#1a1714",
  bgCard: "#252220",
  text: "#f0ebe4",
  textSec: "#d4cfc8",
  muted: "#9B918A",
  accent: "#C9A84C",
  accentBg: "rgba(201,168,76,0.12)",
  correct: "#22c55e",
  correctBg: "rgba(34,197,94,0.12)",
  wrong: "#ef4444",
  wrongBg: "rgba(239,68,68,0.12)",
  hint: "#f59e0b",
  hintBg: "rgba(245,158,11,0.12)",
  border: "#3a302a",
};

const ease = "cubic-bezier(.4,0,.2,1)";
const TIMER_SECONDS = 15;

/* ── Veri Modeli ── */
type QuizItem = {
  id: number;
  image: string;
  title: string;
  artist: string;
  year: string;
  info: string;
  questionType: "artist" | "title";
  question: string;
  correctAnswer: string;
  options: string[];
  hint: string;
};

type ResultRow = { item: QuizItem; correct: boolean; hintUsed: boolean; userAnswer: string };
type LeaderboardEntry = {
  display_name: string;
  score: number;
  badge: string;
  mode: string;
  time_seconds: number | null;
  created_at: string;
};

type Difficulty = "kolay" | "orta" | "zor";

const DIFFICULTY_META: Record<Difficulty, { label: string; desc: string; color: string; colorBg: string }> = {
  kolay: { label: "Kolay", desc: "Herkesin bildiği başyapıtlar", color: "#22c55e", colorBg: "rgba(34,197,94,0.12)" },
  orta:  { label: "Orta",  desc: "Daha az bilinen ama önemli eserler", color: "#f59e0b", colorBg: "rgba(245,158,11,0.12)" },
  zor:   { label: "Zor",   desc: "Uzman seviye, niş eserler", color: "#ef4444", colorBg: "rgba(239,68,68,0.12)" },
};

/* ── KOLAY ── */
const EASY_ITEMS: QuizItem[] = [
  { id: 1, image: "/images/testler/ronesans/mona-lisa.webp", title: "Mona Lisa", artist: "Leonardo da Vinci", year: "1503–1519", info: "Dünyanın en ünlü portresi. Paris Louvre Müzesi'nde sergilenen bu tablo, gizemli gülümsemesiyle yüzyıllardır insanları büyülemektedir.", questionType: "artist", question: "Bu ünlü portre kime aittir?", correctAnswer: "Leonardo da Vinci", options: ["Leonardo da Vinci", "Raffaello Sanzio", "Michelangelo", "Sandro Botticelli"], hint: "Bu sanatçı aynı zamanda bir mucit, mühendis ve anatomisttir." },
  { id: 2, image: "/images/testler/ronesans/ademin-yaratilisi.webp", title: "Adem'in Yaratılışı", artist: "Michelangelo", year: "1508–1512", info: "Sistine Şapeli tavanındaki en ikonik sahne. Tanrı'nın Adem'e hayat verdiği an, sanat tarihinin en çok tanınan imgelerinden biridir.", questionType: "artist", question: "Bu ünlü fresk kime aittir?", correctAnswer: "Michelangelo", options: ["Michelangelo", "Leonardo da Vinci", "Raffaello Sanzio", "Tiziano"], hint: "Bu sanatçı aynı zamanda Davut heykelinin de yaratıcısıdır." },
  { id: 3, image: "/images/testler/ronesans/atina-okulu.webp", title: "Atina Okulu", artist: "Raffaello Sanzio", year: "1509–1511", info: "Vatikan'daki Stanza della Segnatura'da bulunan bu fresk, Platon ve Aristoteles başta olmak üzere antik Yunan filozoflarını bir arada gösterir.", questionType: "title", question: "Raffaello'nun bu ünlü freskinin adı nedir?", correctAnswer: "Atina Okulu", options: ["Atina Okulu", "Son Akşam Yemeği", "Parnassos", "Cennetin Kapıları"], hint: "Fresk, antik Yunan filozoflarını büyük bir yapının altında bir arada gösterir." },
  { id: 4, image: "/images/testler/ronesans/venusun-dogusu.webp", title: "Venüs'ün Doğuşu", artist: "Sandro Botticelli", year: "c. 1485", info: "Floransa Uffizi Galerisi'nin en değerli eserlerinden biri. Aşk tanrıçası Venüs'ün deniz köpüklerinden doğuşunu tasvir eder.", questionType: "title", question: "Botticelli'nin bu başyapıtının adı nedir?", correctAnswer: "Venüs'ün Doğuşu", options: ["Venüs'ün Doğuşu", "Primavera", "Galatea'nın Zaferi", "Flora"], hint: "Mitolojik bir tanrıça dev bir deniz kabuğunun üzerinde kıyıya varır." },
  { id: 5, image: "/images/testler/ronesans/son-aksam-yemegi.webp", title: "Son Akşam Yemeği", artist: "Leonardo da Vinci", year: "1495–1498", info: "Milano'daki Santa Maria delle Grazie kilisesinin yemekhanesinde bulunan bu duvar resmi, İsa'nın havarileriyle son yemeğini tasvir eder.", questionType: "title", question: "Leonardo'nun bu duvar resminin adı nedir?", correctAnswer: "Son Akşam Yemeği", options: ["Son Akşam Yemeği", "Son Yargı", "Kaana Düğünü", "Emmaus'ta Akşam Yemeği"], hint: "İsa ve 12 havarisi uzun bir masanın etrafında oturmaktadır." },
  { id: 6, image: "/images/testler/ronesans/davut.webp", title: "Davut", artist: "Michelangelo", year: "1501–1504", info: "5.17 metre yüksekliğindeki bu mermer heykel, Floransa Accademia Galerisi'ndedir. Tevrat'taki Davut ve Golyat hikâyesini temsil eder.", questionType: "artist", question: "Bu ünlü heykeli kim yapmıştır?", correctAnswer: "Michelangelo", options: ["Michelangelo", "Donatello", "Gian Lorenzo Bernini", "Benvenuto Cellini"], hint: "Bu sanatçı Sistine Şapeli'nin tavanını da boyamıştır." },
  { id: 7, image: "/images/testler/ronesans/primavera.webp", title: "Primavera (İlkbahar)", artist: "Sandro Botticelli", year: "c. 1480", info: "Floransa Uffizi Galerisi'nde sergilenen bu tablo, antik mitolojiden figürlerle baharın gelişini kutlar.", questionType: "artist", question: "Bu eseri kim yapmıştır?", correctAnswer: "Sandro Botticelli", options: ["Sandro Botticelli", "Raffaello Sanzio", "Filippo Lippi", "Domenico Ghirlandaio"], hint: "Venüs'ün Doğuşu tablosunun da ressamıdır." },
  { id: 8, image: "/images/testler/ronesans/arnolfini.webp", title: "Arnolfini'nin Evliliği", artist: "Jan van Eyck", year: "1434", info: "Londra Ulusal Galerisi'nde sergilenen bu tablo, Kuzey Rönesansı'nın başyapıtlarındandır. Arkadaki dışbükey aynada ressamın yansıması görülür.", questionType: "artist", question: "Bu eseri kim yapmıştır?", correctAnswer: "Jan van Eyck", options: ["Jan van Eyck", "Hans Holbein", "Albrecht Dürer", "Rogier van der Weyden"], hint: "Kuzey Rönesansı'nın öncüsü olan bu Flaman usta, yağlıboya tekniğinde devrim yapmıştır." },
  { id: 9, image: "/images/testler/ronesans/son-yargi.webp", title: "Son Yargı", artist: "Michelangelo", year: "1536–1541", info: "Sistine Şapeli'nin mihrap duvarındaki bu dev fresk, kıyamet gününü tasvir eder. 300'den fazla figür içerir.", questionType: "title", question: "Michelangelo'nun Sistine Şapeli'ndeki bu dev freskinin adı nedir?", correctAnswer: "Son Yargı", options: ["Son Yargı", "Adem'in Yaratılışı", "Son Akşam Yemeği", "Cennetin Kapıları"], hint: "Bu fresk, kıyamet gününü ve ruhların akıbetini tasvir eder." },
  { id: 10, image: "/images/testler/ronesans/galatea.webp", title: "Galatea'nın Zaferi", artist: "Raffaello Sanzio", year: "c. 1514", info: "Roma'daki Villa Farnesina'da bulunan bu fresk, deniz perisi Galatea'yı bir deniz kabuğu arabası üzerinde tasvir eder.", questionType: "artist", question: "Bu eseri kim yapmıştır?", correctAnswer: "Raffaello Sanzio", options: ["Raffaello Sanzio", "Sandro Botticelli", "Tiziano Vecellio", "Correggio"], hint: "Atina Okulu freskinin de yaratıcısı olan bu sanatçı, Rönesans'ın üç büyük ustasından biridir." },
];

/* ── ORTA ── */
const MEDIUM_ITEMS: QuizItem[] = [
  { id: 11, image: "/images/testler/ronesans/sistine-madonna.webp", title: "Sistine Madonna", artist: "Raffaello Sanzio", year: "1512–1514", info: "Dresden Eski Ustalar Galerisi'nde sergilenir. Tablonun alt kısmındaki iki küçük melek (putto), dünyanın en çok reprodüksiyonu yapılan figürleri arasındadır.", questionType: "artist", question: "Bu tablodaki iki küçük melek dünyaca ünlüdür. Eserin sanatçısı kimdir?", correctAnswer: "Raffaello Sanzio", options: ["Raffaello Sanzio", "Correggio", "Perugino", "Fra Angelico"], hint: "Vatikan'daki Atina Okulu freskini de bu sanatçı yapmıştır." },
  { id: 12, image: "/images/testler/ronesans/olu-isa.webp", title: "Ölü İsa'ya Ağıt", artist: "Andrea Mantegna", year: "c. 1480", info: "Milano Brera Sanat Galerisi'ndedir. Cesur kısaltılmış perspektif (foreshortening) kullanımıyla sanat tarihinde devrim niteliğindedir.", questionType: "artist", question: "Cesur perspektif kullanımıyla ünlü bu eseri kim yapmıştır?", correctAnswer: "Andrea Mantegna", options: ["Andrea Mantegna", "Giovanni Bellini", "Giotto di Bondone", "Masaccio"], hint: "Padova'da çalışan bu Kuzey İtalyan sanatçı, perspektif ve anatomi konusunda öncüdür." },
  { id: 13, image: "/images/testler/ronesans/urbino-venusu.webp", title: "Urbino Venüsü", artist: "Tiziano Vecellio", year: "1538", info: "Floransa Uffizi Galerisi'nde sergilenir. Venedik Okulu'nun en önemli nü çalışmalarından biridir ve Manet'nin Olympia'sına ilham vermiştir.", questionType: "artist", question: "Venedik Okulu'nun bu önemli eserini kim yapmıştır?", correctAnswer: "Tiziano Vecellio", options: ["Tiziano Vecellio", "Giorgione", "Sandro Botticelli", "Lorenzo Lotto"], hint: "Bu Venedikli usta, Avrupa'nın en güçlü hükümdarlarının portrelerini yapmıştır." },
  { id: 14, image: "/images/testler/ronesans/kayaliklar-meryemi.webp", title: "Kayalıklar Meryemi", artist: "Leonardo da Vinci", year: "1483–1486", info: "Louvre Müzesi'ndeki bu tablo, Meryem, bebek İsa, melek Uriel ve bebek Yahya'yı kayalık bir mağarada gösterir. Leonardo'nun sfumato tekniğinin en güzel örneklerindendir.", questionType: "title", question: "Leonardo da Vinci'nin bu ünlü tablosunun adı nedir?", correctAnswer: "Kayalıklar Meryemi", options: ["Kayalıklar Meryemi", "Kutsal Aile", "Meryem'in Göğe Yükselişi", "Sistine Madonna"], hint: "Figürler gizemli bir mağara ortamında tasvir edilmiştir." },
  { id: 15, image: "/images/testler/ronesans/isanin-vaftizi.webp", title: "İsa'nın Vaftizi", artist: "Andrea del Verrocchio", year: "c. 1472–1475", info: "Floransa Uffizi Galerisi'ndedir. Genç Leonardo da Vinci bu tablodaki soldaki meleği boyamıştır — hocasını gölgede bırakan ilk eseri.", questionType: "artist", question: "Bu eserin ana sanatçısı kimdir? (Genç öğrencisi de tabloya katkıda bulunmuştur)", correctAnswer: "Andrea del Verrocchio", options: ["Andrea del Verrocchio", "Leonardo da Vinci", "Domenico Ghirlandaio", "Perugino"], hint: "Leonardo da Vinci'nin hocası olan bu Floransalı usta, hem ressam hem heykeltıraştır." },
  { id: 16, image: "/images/testler/ronesans/meryemin-yukselisi.webp", title: "Meryem'in Göğe Yükselişi", artist: "Tiziano Vecellio", year: "1516–1518", info: "Venedik'teki Santa Maria Gloriosa dei Frari kilisesindedir. 6.9 metre yüksekliğindeki bu dev tablo, Tiziano'nun ününü Avrupa çapına taşımıştır.", questionType: "title", question: "Tiziano'nun Venedik'teki dev altar tablosunun adı nedir?", correctAnswer: "Meryem'in Göğe Yükselişi", options: ["Meryem'in Göğe Yükselişi", "Son Yargı", "Sistine Madonna", "Meryem'in Doğumu"], hint: "Meryem melekler eşliğinde gökyüzüne yükselirken tasvir edilmiştir." },
  { id: 17, image: "/images/testler/ronesans/kutsal-dunya-ask.webp", title: "Kutsal ve Dünyevi Aşk", artist: "Tiziano Vecellio", year: "c. 1514", info: "Roma Borghese Galerisi'nde sergilenir. İki kadın figürü — biri giyinik, diğeri çıplak — kutsal ve dünyevi aşkı simgeler.", questionType: "title", question: "Tiziano'nun bu alegorik tablosunun adı nedir?", correctAnswer: "Kutsal ve Dünyevi Aşk", options: ["Kutsal ve Dünyevi Aşk", "Venüs'ün Doğuşu", "İlkbahar Alegorisi", "Flora"], hint: "İki kadın figürü bir çeşmenin iki yanında, aşkın farklı yüzlerini temsil eder." },
  { id: 18, image: "/images/testler/ronesans/pieta.webp", title: "Pietà", artist: "Michelangelo", year: "1498–1499", info: "Vatikan'daki Aziz Petrus Bazilikası'nda sergilenir. Michelangelo bu şaheserini sadece 24 yaşındayken tamamlamıştır. İmzasını taşıyan tek eseridir.", questionType: "artist", question: "Vatikan'daki bu ünlü mermer heykeli kim yapmıştır?", correctAnswer: "Michelangelo", options: ["Michelangelo", "Donatello", "Gian Lorenzo Bernini", "Andrea del Verrocchio"], hint: "Bu sanatçı eseri tamamladığında henüz 24 yaşındaydı ve Davut heykelini de o yapmıştır." },
  { id: 19, image: "/images/testler/ronesans/doge-loredan.webp", title: "Doge Leonardo Loredan", artist: "Giovanni Bellini", year: "c. 1501", info: "Londra Ulusal Galerisi'ndedir. Venedik doge'sinin resmi töreni kıyafetleriyle gösterildiği bu portre, Bellini'nin en tanınmış eseridir.", questionType: "artist", question: "Bu Venedik Doge'si portresini kim yapmıştır?", correctAnswer: "Giovanni Bellini", options: ["Giovanni Bellini", "Tiziano Vecellio", "Vittore Carpaccio", "Gentile Bellini"], hint: "Tiziano'nun hocası olan bu Venedikli usta, Venedik resim okulunun kurucusu sayılır." },
  { id: 20, image: "/images/testler/ronesans/firtina.webp", title: "Fırtına (La Tempesta)", artist: "Giorgione", year: "c. 1508", info: "Venedik Accademia Galerisi'ndedir. Konusu hâlâ tartışılan bu tablo, Batı sanatında 'saf manzara resmi'nin ilk örneklerinden sayılır.", questionType: "artist", question: "Rönesans'ın en gizemli tablolarından biri olan bu eseri kim yapmıştır?", correctAnswer: "Giorgione", options: ["Giorgione", "Tiziano Vecellio", "Giovanni Bellini", "Lorenzo Lotto"], hint: "Genç yaşta ölen bu Venedikli sanatçının çok az eseri günümüze ulaşmıştır." },
];

/* ── ZOR ── */
const HARD_ITEMS: QuizItem[] = [
  { id: 21, image: "/images/testler/ronesans/isanin-kirbaclenmasi.webp", title: "İsa'nın Kırbaçlanması", artist: "Piero della Francesca", year: "c. 1455", info: "Urbino Ulusal Galerisi'ndedir. Gizemli kompozisyonu ve matematiksel perspektifi yüzyıllardır tartışılmaktadır.", questionType: "artist", question: "Matematiksel perspektifin ustası olan bu eserin sanatçısı kimdir?", correctAnswer: "Piero della Francesca", options: ["Piero della Francesca", "Andrea Mantegna", "Masaccio", "Paolo Uccello"], hint: "Bu sanatçı aynı zamanda matematikçiydi ve perspektif üzerine kitaplar yazmıştır." },
  { id: 22, image: "/images/testler/ronesans/san-romano.webp", title: "San Romano Savaşı", artist: "Paolo Uccello", year: "c. 1438–1440", info: "Üç panelden oluşan bu seri, Londra, Floransa ve Paris müzelerinde sergilenir. Uccello'nun perspektife olan tutkusunun en görkemli örneğidir.", questionType: "artist", question: "Perspektif kullanımıyla ünlü bu savaş sahnesini kim yapmıştır?", correctAnswer: "Paolo Uccello", options: ["Paolo Uccello", "Andrea del Castagno", "Piero della Francesca", "Benozzo Gozzoli"], hint: "Bu sanatçının adı İtalyanca'da 'kuş' anlamına gelir ve perspektif konusunda neredeyse saplantılıydı." },
  { id: 23, image: "/images/testler/ronesans/cennetin-kapilari.webp", title: "Cennetin Kapıları", artist: "Lorenzo Ghiberti", year: "1425–1452", info: "Floransa Vaftizhanesi'nin doğu kapıları. 27 yıl süren bu projede 10 bronz panelde Eski Ahit sahneleri anlatılır. Michelangelo kapılara bu adı vermiştir.", questionType: "artist", question: "Floransa Vaftizhanesi'ndeki bu bronz kapıları kim yapmıştır?", correctAnswer: "Lorenzo Ghiberti", options: ["Lorenzo Ghiberti", "Filippo Brunelleschi", "Donatello", "Luca della Robbia"], hint: "Bu sanatçı, kapılar için düzenlenen yarışmayı Brunelleschi'yi yenerek kazanmıştır." },
  { id: 24, image: "/images/testler/ronesans/kutsal-uclu.webp", title: "Kutsal Üçlü (Trinità)", artist: "Masaccio", year: "c. 1427", info: "Floransa'daki Santa Maria Novella kilisesindedir. Doğrusal perspektifin resimde ilk büyük uygulaması olarak kabul edilir.", questionType: "artist", question: "Perspektifin resimde ilk büyük örneği sayılan bu freski kim yapmıştır?", correctAnswer: "Masaccio", options: ["Masaccio", "Giotto di Bondone", "Fra Angelico", "Filippo Lippi"], hint: "Sadece 27 yaşına kadar yaşayan bu sanatçı, Erken Rönesans'ın en etkili ressamıdır." },
  { id: 25, image: "/images/testler/ronesans/elciler.webp", title: "Elçiler", artist: "Hans Holbein the Younger", year: "1533", info: "Londra Ulusal Galerisi'ndedir. Tablonun alt kısmındaki çarpık (anamorfik) kuru kafa, ancak yandan bakıldığında tanınabilir.", questionType: "title", question: "Alt kısmında anamorfik bir kuru kafa gizlenen bu tablonun adı nedir?", correctAnswer: "Elçiler", options: ["Elçiler", "Arnolfini'nin Evliliği", "Doge Loredan Portresi", "Erasmus Portresi"], hint: "İki diplomat bilimsel aletlerle çevrili şekilde tasvir edilmiştir." },
  { id: 26, image: "/images/testler/ronesans/mujdeleme.webp", title: "Müjdeleme (Annunciazione)", artist: "Fra Angelico", year: "c. 1438–1445", info: "Floransa'daki San Marco Manastırı'nda, merdivenin başında yer alır. Fra Angelico bu freski keşişlerin meditasyonu için yapmıştır.", questionType: "artist", question: "Floransa San Marco Manastırı'ndaki bu ünlü freski kim yapmıştır?", correctAnswer: "Fra Angelico", options: ["Fra Angelico", "Filippo Lippi", "Benozzo Gozzoli", "Perugino"], hint: "Dominiken keşişi olan bu sanatçı, 1982'de Papa II. Jean Paul tarafından kutsanmıştır." },
  { id: 27, image: "/images/testler/ronesans/gattamelata.webp", title: "Gattamelata", artist: "Donatello", year: "1453", info: "Padova'daki Basilica di Sant'Antonio önünde yer alır. Roma İmparatorluğu'ndan sonra yapılan ilk büyük atlı bronz heykeldir.", questionType: "artist", question: "Padova'daki bu ünlü atlı bronz heykeli kim yapmıştır?", correctAnswer: "Donatello", options: ["Donatello", "Andrea del Verrocchio", "Benvenuto Cellini", "Michelangelo"], hint: "Bu Floransalı heykeltıraş, bronz Davut heykeliyle de tanınır — Rönesans'ın ilk çıplak heykellerinden biri." },
  { id: 28, image: "/images/testler/ronesans/melankoli.webp", title: "Melencolia I", artist: "Albrecht Dürer", year: "1514", info: "Bu bakır gravür, Batı sanatının en analiz edilen eserlerinden biridir. Geometri, simya ve melankoli arasındaki ilişkiyi araştırır.", questionType: "artist", question: "Bu ünlü gravürü kim yapmıştır?", correctAnswer: "Albrecht Dürer", options: ["Albrecht Dürer", "Hans Holbein", "Lucas Cranach", "Martin Schongauer"], hint: "Nürnbergli bu Alman sanatçı, Kuzey Rönesansı'nın en büyük ustasıdır ve monogramı 'AD'dir." },
  { id: 29, image: "/images/testler/ronesans/kovulus.webp", title: "Cennet'ten Kovuluş", artist: "Masaccio", year: "c. 1427", info: "Floransa'daki Brancacci Şapeli'ndedir. Adem ve Havva'nın acı ve utanç dolu ifadeleri, duygu aktarımında devrim niteliğindedir.", questionType: "artist", question: "Brancacci Şapeli'ndeki bu dramatik freski kim yapmıştır?", correctAnswer: "Masaccio", options: ["Masaccio", "Masolino da Panicale", "Filippino Lippi", "Fra Angelico"], hint: "Aynı kilisede 'Kutsal Üçlü' freskini de yapmış olan erken Rönesans ustası." },
  { id: 30, image: "/images/testler/ronesans/ideal-sehir.webp", title: "İdeal Şehir", artist: "Piero della Francesca Çevresi", year: "c. 1470–1490", info: "Urbino Ulusal Galerisi'ndedir. Rönesans'ın matematiksel uyum ve perspektif idealini en saf haliyle yansıtan bu tablonun kesin sanatçısı hâlâ tartışmalıdır.", questionType: "title", question: "Rönesans perspektif idealini yansıtan bu tablonun adı nedir?", correctAnswer: "İdeal Şehir", options: ["İdeal Şehir", "Atina Okulu", "Kutsal Üçlü", "İsa'nın Kırbaçlanması"], hint: "Tabloda hiçbir insan figürü yoktur, sadece mükemmel simetriyle dizilmiş binalar görülür." },
];

const ALL_ITEMS: Record<Difficulty, QuizItem[]> = {
  kolay: EASY_ITEMS,
  orta: MEDIUM_ITEMS,
  zor: HARD_ITEMS,
};

/* ── Yardımcılar ── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getBadge(score: number, timed: boolean, diff: Difficulty = "kolay"): { name: string; desc: string } {
  const suffixes: string[] = [];
  if (diff !== "kolay") suffixes.push(DIFFICULTY_META[diff].label);
  if (timed) suffixes.push("Hızlı");
  const suffix = suffixes.length > 0 ? ` (${suffixes.join(" · ")})` : "";
  if (score >= 9) return { name: `Rönesans Ustası${suffix}`, desc: "Sanat tarihine hakimsiniz!" };
  if (score >= 7) return { name: `Sanat Tarihçisi${suffix}`, desc: "Rönesans bilginiz etkileyici." };
  if (score >= 5) return { name: `Koleksiyoner${suffix}`, desc: "İyi bir sanat kültürünüz var." };
  if (score >= 3) return { name: `Meraklı${suffix}`, desc: "Potansiyel var, biraz daha çalışma!" };
  return { name: `Çırak${suffix}`, desc: "Rönesans dünyasını keşfetmeye yeni başlıyorsunuz." };
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}dk ${sec}sn` : `${sec}sn`;
}

/* ── Progress Bar ── */
function ProgressBar({
  current, total, score, timeLeft, timed,
}: {
  current: number; total: number; score: number; timeLeft: number; timed: boolean;
}) {
  const pct = (current / total) * 100;
  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>
          Soru {current + 1}/{total}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {timed && (
            <span style={{
              fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums",
              color: timeLeft <= 5 ? T.wrong : T.hint,
              transition: `color .3s ${ease}`,
            }}>
              {timeLeft}sn
            </span>
          )}
          <span style={{ fontSize: 13, color: T.accent, fontWeight: 700 }}>
            {score} puan
          </span>
        </div>
      </div>
      <div style={{ height: 4, background: T.border, borderRadius: 99, position: "relative" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: T.accent,
          borderRadius: 99, transition: `width 0.5s ${ease}`,
        }} />
        {timed && (
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
            background: timeLeft <= 5 ? T.wrong : T.hint,
            borderRadius: 99, transition: `width 1s linear, background .3s`,
            opacity: 0.5,
          }} />
        )}
      </div>
    </div>
  );
}

/* ── Share Buttons ── */
function ShareButtons({ score, badge }: { score: number; badge: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Rönesans Sanat Quizi'nde ${score}/10 puan alarak "${badge}" rozetini kazandım!`;
  const url = "https://klemensart.com/testler/ronesans-quiz";

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
  };
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };
  const copyLink = () => {
    navigator.clipboard.writeText(text + "\n" + url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const btnStyle: React.CSSProperties = {
    flex: 1, padding: "12px 8px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", border: `1px solid ${T.border}`,
    background: T.bgCard, color: T.text, transition: `all .2s ${ease}`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  };

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      <button onClick={shareWhatsApp} style={{ ...btnStyle, color: "#25D366", borderColor: "rgba(37,211,102,0.3)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </button>
      <button onClick={shareTwitter} style={{ ...btnStyle, color: "#1DA1F2", borderColor: "rgba(29,161,242,0.3)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X
      </button>
      <button onClick={copyLink} style={{ ...btnStyle, color: copied ? T.correct : T.muted }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        {copied ? "Kopyalandi!" : "Kopyala"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ANA BİLEŞEN
   ══════════════════════════════════════════════════════════════════════════════ */
export default function RonesansQuiz() {
  /* ── State ── */
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("kolay");
  const [mode, setMode] = useState<"normal" | "timed">("normal");
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [imgError, setImgError] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const startTimeRef = useRef(0);
  const totalTimeRef = useRef(0);

  // Auth & save
  const [user, setUser] = useState<User | null>(null);
  const savedRef = useRef(false);

  // Email results (non-member)
  const [email, setEmail] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "done" | "error" | "registered">("idle");

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Game key — forces clean remount on replay
  const [gameKey, setGameKey] = useState(0);

  /* ── Auth check ── */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
  }, []);

  /* ── Browser back prevention ── */
  useEffect(() => {
    if (phase !== "quiz") return;
    // Replace current entry instead of pushing (prevents history buildup)
    history.replaceState({ quiz: true }, "");
    const handler = (e: PopStateEvent) => {
      if (phase === "quiz") {
        history.pushState({ quiz: true }, "");
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [phase]);

  /* ── Timer (timed mode) ── */
  useEffect(() => {
    if (phase !== "quiz" || mode !== "timed" || selectedAnswer !== null) return;
    if (timeLeft <= 0) {
      // Time's up — auto-wrong
      const q = questions[current];
      setSelectedAnswer("__timeout__");
      setIsCorrect(false);
      setResults((prev) => [...prev, { item: q, correct: false, hintUsed, userAnswer: "__timeout__" }]);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase, mode, selectedAnswer, current, questions, hintUsed]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ── Start game ── */
  const startGame = useCallback((m: "normal" | "timed", diff?: Difficulty) => {
    const d = diff ?? difficulty;
    if (diff) setDifficulty(d);
    const shuffled = shuffle(ALL_ITEMS[d]);
    setMode(m);
    setQuestions(shuffled);
    setShuffledOptions(shuffle(shuffled[0].options));
    setCurrent(0);
    setScore(0);
    setShowHint(false);
    setHintUsed(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setResults([]);
    setFadeIn(true);
    setImgError(false);
    setTimeLeft(TIMER_SECONDS);
    startTimeRef.current = Date.now();
    totalTimeRef.current = 0;
    savedRef.current = false;
    setEmailStatus("idle");
    setEmail("");
    setKvkkChecked(false);
    setGameKey((k) => k + 1);
    setPhase("quiz");
    scrollTop();
  }, [difficulty]);

  /* ── Handle answer ── */
  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer) return;
    const q = questions[current];
    const correct = answer === q.correctAnswer;
    const pts = correct ? (hintUsed ? 0.5 : 1) : 0;

    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setScore((prev) => prev + pts);
    setResults((prev) => [...prev, { item: q, correct, hintUsed, userAnswer: answer }]);
  }, [selectedAnswer, questions, current, hintUsed]);

  /* ── Next question ── */
  const nextQuestion = useCallback(() => {
    if (current + 1 >= questions.length) {
      totalTimeRef.current = Math.round((Date.now() - startTimeRef.current) / 1000);
      setPhase("result");
      scrollTop();
      return;
    }
    setFadeIn(false);
    setTimeout(() => {
      const next = current + 1;
      setCurrent(next);
      setShuffledOptions(shuffle(questions[next].options));
      setShowHint(false);
      setHintUsed(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setImgError(false);
      setTimeLeft(TIMER_SECONDS);
      setFadeIn(true);
      scrollTop();
    }, 300);
  }, [current, questions]);

  /* ── Save result & fetch leaderboard on result phase ── */
  useEffect(() => {
    if (phase !== "result") return;

    // Save result (once per game, only for logged-in members)
    // Non-members: result saved via /api/quiz/send-results when they submit email
    if (!savedRef.current && user) {
      savedRef.current = true;
      const badge = getBadge(score, mode === "timed", difficulty);
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      const displayName = meta.full_name || meta.name || "Anonim";
      fetch("/api/quiz/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          badge: badge.name,
          time_seconds: totalTimeRef.current || null,
          mode,
          display_name: displayName,
          quiz_slug: "ronesans-quiz",
        }),
      }).catch(() => {});
    }

    // Fetch leaderboard (for members only, since non-members see it after email)
    if (user) {
      fetch("/api/quiz/results?slug=ronesans-quiz&limit=10")
        .then((r) => r.json())
        .then((d) => setLeaderboard(d.results ?? []))
        .catch(() => {});
    }
  }, [phase, score, mode, user]);

  /* ── Send results to email (non-member) ── */
  const handleEmailSubmit = async () => {
    if (!email || !kvkkChecked || emailStatus === "sending") return;
    setEmailStatus("sending");
    try {
      const badge = getBadge(score, mode === "timed", difficulty);
      const res = await fetch("/api/quiz/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          score,
          badge: badge.name,
          mode,
          time_seconds: totalTimeRef.current || null,
          results: results.map((r) => ({
            title: r.item.title,
            artist: r.item.artist,
            year: r.item.year,
            info: r.item.info,
            question: r.item.question,
            correctAnswer: r.item.correctAnswer,
            userAnswer: r.userAnswer,
            correct: r.correct,
            hintUsed: r.hintUsed,
          })),
        }),
      });
      const data = await res.json();
      if (data.registered) {
        setEmailStatus("registered");
      } else if (data.sent) {
        setEmailStatus("done");
        // Fetch leaderboard after submission
        fetch("/api/quiz/results?slug=ronesans-quiz&limit=10")
          .then((r) => r.json())
          .then((d) => setLeaderboard(d.results ?? []))
          .catch(() => {});
      } else {
        setEmailStatus("error");
      }
    } catch {
      setEmailStatus("error");
    }
  };

  /* ══════════════════════════════════════════════
     INTRO
     ══════════════════════════════════════════════ */
  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ background: T.accentBg, color: T.accent, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "8px 20px", borderRadius: 99, marginBottom: 32 }}>
            Klemens Quiz
          </div>

          <h1 style={{ fontSize: "clamp(28px,6vw,44px)", fontWeight: 800, color: T.text, lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -0.5 }}>
            Rönesans<br />
            <span style={{ color: T.accent }}>Sanat Quizi</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: T.muted, margin: "0 0 12px", maxWidth: 480 }}>
            Rönesans döneminin başyapıtlarını ne kadar tanıyorsunuz?
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: T.muted, margin: "0 0 40px", maxWidth: 480 }}>
            <strong style={{ color: T.textSec }}>10 soruda</strong> sanat tarihindeki yerinizi keşfedin.
          </p>

          <div style={{ display: "flex", gap: 32, marginBottom: 40, flexWrap: "wrap", justifyContent: "center" }}>
            {[{ n: "10", l: "Soru" }, { n: "3", l: "Seviye" }, { n: "~3dk", l: "Süre" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{s.n}</div>
                <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Difficulty selection */}
          <div style={{ width: "100%", maxWidth: 400, marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, textAlign: "left" }}>
              Seviye Seçin
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(["kolay", "orta", "zor"] as Difficulty[]).map((d) => {
                const dm = DIFFICULTY_META[d];
                const isActive = difficulty === d;
                return (
                  <button
                    key={d} onClick={() => setDifficulty(d)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                      background: isActive ? dm.colorBg : T.bgCard,
                      border: `1.5px solid ${isActive ? dm.color : T.border}`,
                      borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                      transition: `all .2s ${ease}`, textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 10, height: 10, borderRadius: 99, flexShrink: 0,
                      background: isActive ? dm.color : T.border,
                      boxShadow: isActive ? `0 0 8px ${dm.color}40` : "none",
                      transition: `all .2s ${ease}`,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? dm.color : T.text }}>{dm.label}</div>
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{dm.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode selection */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, width: "100%", maxWidth: 400 }}>
            <button
              onClick={() => startGame("normal")}
              style={{
                flex: 1, background: T.accent, color: T.bg, border: "none", borderRadius: 99,
                padding: "18px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 24px rgba(201,168,76,0.3)", fontFamily: "inherit",
                transition: `transform .2s ${ease}`,
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              Başla
            </button>
            <button
              onClick={() => startGame("timed")}
              style={{
                flex: 1, background: "transparent", color: T.hint, border: `1.5px solid rgba(245,158,11,0.4)`,
                borderRadius: 99, padding: "18px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", transition: `all .2s ${ease}`,
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              Hızlı Mod ({TIMER_SECONDS}sn)
            </button>
          </div>

          <p style={{ fontSize: 12, color: T.muted, marginTop: 16, maxWidth: 400, lineHeight: 1.6, fontStyle: "italic" }}>
            Normal modda süre sınırı yok. Hızlı modda her soru için {TIMER_SECONDS} saniyeniz var.
          </p>

          <Link
            href="/testler"
            style={{ fontSize: 13, color: T.muted, marginTop: 24, textDecoration: "none", transition: `color .2s ${ease}` }}
          >
            Testlere Dön
          </Link>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     QUIZ
     ══════════════════════════════════════════════ */
  if (phase === "quiz") {
    const q = questions[current];
    return (
      <div key={gameKey} style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
        <div
          style={{
            maxWidth: 640, margin: "0 auto", padding: "32px 20px 60px",
            opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)",
            transition: `opacity .3s ${ease}, transform .3s ${ease}`,
          }}
        >
          <ProgressBar current={current} total={questions.length} score={score} timeLeft={timeLeft} timed={mode === "timed"} />
          {/* Difficulty indicator */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              color: DIFFICULTY_META[difficulty].color, background: DIFFICULTY_META[difficulty].colorBg,
              padding: "4px 14px", borderRadius: 99,
            }}>
              {DIFFICULTY_META[difficulty].label}
            </span>
          </div>

          {/* Image — object-fit: contain for vertical artworks */}
          <div
            style={{
              position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 16,
              overflow: "hidden", marginBottom: 24, background: T.bgCard,
              border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {!imgError ? (
              <Image
                src={q.image} alt="Eser görseli" fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 640px) 100vw, 640px"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.3 }}>&#x1f5bc;</div>
                <span style={{ fontSize: 13, color: T.muted }}>Görsel yüklenemedi</span>
              </div>
            )}
          </div>

          {/* Question */}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, textAlign: "center", margin: "0 0 20px", lineHeight: 1.4 }}>
            {q.question}
          </h2>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {shuffledOptions.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = opt === q.correctAnswer;
              const answered = selectedAnswer !== null;
              const showFeedback = user !== null; // Only show correct/wrong for logged-in users

              let bg = T.bgCard;
              let borderColor = T.border;
              let textColor = T.text;

              if (answered) {
                if (showFeedback) {
                  if (isCorrectOpt) {
                    bg = T.correctBg; borderColor = T.correct; textColor = T.correct;
                  } else if (isSelected) {
                    bg = T.wrongBg; borderColor = T.wrong; textColor = T.wrong;
                  } else {
                    textColor = T.muted;
                  }
                } else {
                  // Non-member: neutral selection highlight
                  if (isSelected) {
                    bg = T.accentBg; borderColor = T.accent; textColor = T.accent;
                  } else {
                    textColor = T.muted;
                  }
                }
              }

              return (
                <button
                  key={opt} onClick={() => handleAnswer(opt)} disabled={answered}
                  style={{
                    background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 12,
                    padding: "16px 20px", fontSize: 15, fontWeight: 600, color: textColor,
                    cursor: answered ? "default" : "pointer", fontFamily: "inherit", textAlign: "left",
                    transition: `all .25s ${ease}`,
                    opacity: answered && !isSelected && !(showFeedback && isCorrectOpt) ? 0.5 : 1,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Timeout indicator */}
          {selectedAnswer === "__timeout__" && (
            <div style={{
              textAlign: "center", marginBottom: 16, padding: "10px 16px", borderRadius: 99,
              background: T.wrongBg, color: T.wrong, fontSize: 14, fontWeight: 700,
            }}>
              Süre doldu!
            </div>
          )}

          {/* Hint button (before answering, not in timed mode, only for members) */}
          {user && !selectedAnswer && mode !== "timed" && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              {!showHint ? (
                <button
                  onClick={() => { setShowHint(true); setHintUsed(true); }}
                  style={{
                    background: T.hintBg, color: T.hint, border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 99, padding: "10px 24px", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit", transition: `all .2s ${ease}`,
                  }}
                >
                  İpucu Göster (-0.5 puan)
                </button>
              ) : (
                <div style={{
                  background: T.hintBg, border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 12, padding: "14px 20px", fontSize: 14, color: T.hint, lineHeight: 1.6,
                }}>
                  {q.hint}
                </div>
              )}
            </div>
          )}

          {/* Post-answer feedback — only for logged-in members */}
          {selectedAnswer && user && (
            <div style={{
              background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
              padding: "20px", marginBottom: 20,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
                borderRadius: 99, fontSize: 13, fontWeight: 700, marginBottom: 12,
                background: isCorrect ? T.correctBg : T.wrongBg,
                color: isCorrect ? T.correct : T.wrong,
              }}>
                {selectedAnswer === "__timeout__" ? "Süre Doldu" : isCorrect ? "Doğru!" : "Yanlış"}
                {hintUsed && isCorrect && <span style={{ fontWeight: 400, opacity: 0.8 }}> (İpucu ile +0.5)</span>}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 4px" }}>{q.title}</h3>
              <p style={{ fontSize: 13, color: T.accent, margin: "0 0 10px", fontWeight: 600 }}>
                {q.artist} &middot; {q.year}
              </p>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, margin: 0 }}>{q.info}</p>
            </div>
          )}

          {/* Non-member: neutral "answered" indicator */}
          {selectedAnswer && !user && selectedAnswer !== "__timeout__" && (
            <div style={{
              textAlign: "center", marginBottom: 16, padding: "10px 16px", borderRadius: 99,
              background: T.accentBg, color: T.accent, fontSize: 14, fontWeight: 600,
            }}>
              Cevabınız kaydedildi
            </div>
          )}

          {/* Next button */}
          {selectedAnswer && (
            <button
              onClick={nextQuestion}
              style={{
                width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12,
                padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                transition: `transform .2s ${ease}`,
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              {current + 1 < questions.length ? "Sonraki Soru" : "Sonuçları Gör"}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     RESULT
     ══════════════════════════════════════════════ */
  const badge = getBadge(score, mode === "timed", difficulty);
  const totalTime = totalTimeRef.current;

  // Non-member: show email form first, then results after sending
  const showFullResults = user || emailStatus === "done";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 20px 60px" }}>

        {/* ── Non-member: Email form (before results) ── */}
        {!user && emailStatus !== "done" && (
          <div style={{ textAlign: "center" }}>
            {/* Teaser — quiz bitti ama sonuçlar gizli */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: 48, fontWeight: 800, color: T.muted, lineHeight: 1, opacity: 0.3,
                filter: "blur(8px)", userSelect: "none",
              }}>
                ?<span style={{ fontSize: 20 }}>/10</span>
              </div>
              <p style={{ fontSize: 16, color: T.muted, marginTop: 12 }}>
                Quiz tamamlandı!
              </p>
            </div>

            {emailStatus === "registered" ? (
              /* Email registered — redirect to login */
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: "28px 24px", marginBottom: 24,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                  Bu e-posta ile zaten üyesiniz!
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 20 }}>
                  Giriş yaparak quiz sonuçlarınızı detaylı görebilir, rozetinizi kaydedebilir ve
                  liderlik tablosunda yerinizi alabilirsiniz.
                </p>
                <a
                  href="/club/giris"
                  style={{
                    display: "inline-block", background: T.accent, color: T.bg,
                    textDecoration: "none", fontSize: 15, fontWeight: 700,
                    padding: "14px 36px", borderRadius: 99,
                  }}
                >
                  Giriş Yap
                </a>
              </div>
            ) : (
              /* Email form + KVKK */
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: "28px 24px", marginBottom: 24,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                  Sonuçlarınızı e-postanıza gönderelim
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 20 }}>
                  Puanınız, rozetiniz ve yanlış cevaplarınızın doğruları açıklamalarıyla birlikte
                  e-posta adresinize gönderilecek.
                </p>

                <input
                  type="email" placeholder="E-posta adresiniz" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  style={{
                    width: "100%", boxSizing: "border-box", background: T.bg,
                    border: `1px solid ${T.border}`, borderRadius: 10,
                    padding: "14px 16px", fontSize: 15, color: T.text, fontFamily: "inherit",
                    outline: "none", marginBottom: 12,
                  }}
                />

                {/* KVKK consent */}
                <label style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  cursor: "pointer", marginBottom: 16, textAlign: "left",
                }}>
                  <input
                    type="checkbox" checked={kvkkChecked}
                    onChange={(e) => setKvkkChecked(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: T.accent }}
                  />
                  <span style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                    Kişisel verilerimin işlenmesine ilişkin{" "}
                    <a href="/kvkk" target="_blank" rel="noopener noreferrer"
                      style={{ color: T.accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
                      KVKK Aydınlatma Metni
                    </a>
                    &apos;ni okudum ve e-posta adresimin quiz sonuçlarının gönderimi ile
                    bülten amacıyla işlenmesini kabul ediyorum.
                  </span>
                </label>

                <button
                  onClick={handleEmailSubmit}
                  disabled={emailStatus === "sending" || !email || !kvkkChecked}
                  style={{
                    width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12,
                    padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    opacity: emailStatus === "sending" || !email || !kvkkChecked ? 0.5 : 1,
                    transition: `all .2s ${ease}`,
                  }}
                >
                  {emailStatus === "sending" ? "Gönderiliyor..." : "Sonuçlarımı Gönder"}
                </button>

                {emailStatus === "error" && (
                  <div style={{ fontSize: 13, color: T.wrong, marginTop: 10 }}>
                    Bir hata oluştu. Lütfen tekrar deneyin.
                  </div>
                )}
              </div>
            )}

            {/* Replay + back links always available */}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                onClick={() => startGame("normal")}
                style={{
                  flex: 1, background: "transparent", color: T.muted,
                  border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Tekrar Oyna
              </button>
              <Link
                href="/testler"
                style={{
                  flex: 1, background: "transparent", color: T.muted,
                  border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: "14px", fontSize: 14, fontWeight: 600, textDecoration: "none",
                  textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                Testlere Dön
              </Link>
            </div>
          </div>
        )}

        {/* ── Non-member: After email sent — show results + CTA ── */}
        {!user && emailStatus === "done" && (
          <>
            {/* Success message */}
            <div style={{
              textAlign: "center", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 12, padding: "16px", marginBottom: 24,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.correct }}>
                Sonuçlarınız e-postanıza gönderildi!
              </div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
                Yanlış cevaplarınızın doğruları ve açıklamaları mailinizde.
              </div>
            </div>
          </>
        )}

        {/* ── Full results (members always, non-members after email) ── */}
        {showFullResults && (
          <>
            {/* Score */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: T.accent, lineHeight: 1 }}>
                {score}<span style={{ fontSize: 24, color: T.muted }}>/10</span>
              </div>
              {totalTime > 0 && (
                <div style={{ fontSize: 14, color: T.muted, marginTop: 8 }}>
                  {formatTime(totalTime)} {mode === "timed" && "— Hızlı Mod"}
                </div>
              )}
            </div>

            {/* Badge */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                display: "inline-flex", flexDirection: "column", alignItems: "center",
                background: T.accentBg, border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: 20, padding: "24px 40px",
              }}>
                <span style={{ fontSize: 13, color: T.muted, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
                  Rozetiniz
                </span>
                <span style={{ fontSize: 24, fontWeight: 800, color: T.accent, marginBottom: 4 }}>{badge.name}</span>
                <span style={{ fontSize: 14, color: T.muted }}>{badge.desc}</span>
                {user && (
                  <span style={{ fontSize: 12, color: T.correct, marginTop: 8, fontWeight: 600 }}>
                    Profilinize kaydedildi
                  </span>
                )}
              </div>
            </div>

            {/* Share */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: T.muted, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                Sonucunuzu Paylaşın
              </h3>
            </div>
            <ShareButtons score={score} badge={badge.name} />

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12, textAlign: "left" }}>
                  Skor Tablosu
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {leaderboard.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        background: i < 3 ? T.accentBg : T.bgCard,
                        border: `1px solid ${i < 3 ? "rgba(201,168,76,0.2)" : T.border}`,
                        borderRadius: 10, padding: "10px 14px",
                      }}
                    >
                      <span style={{
                        width: 24, height: 24, borderRadius: 99, fontSize: 12, fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: i === 0 ? T.accent : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : T.border,
                        color: i < 3 ? T.bg : T.muted, flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600, color: T.text,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {entry.display_name}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted }}>
                          {entry.badge}{entry.time_seconds ? ` — ${formatTime(entry.time_seconds)}` : ""}
                        </div>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: T.accent, flexShrink: 0 }}>
                        {entry.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{ textAlign: "left", marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12 }}>Soru Özeti</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: T.bgCard, border: `1px solid ${T.border}`,
                      borderRadius: 12, padding: "10px 14px",
                    }}
                  >
                    <div style={{
                      width: 48, height: 36, borderRadius: 6, overflow: "hidden",
                      position: "relative", flexShrink: 0, background: T.border,
                    }}>
                      <Image src={r.item.image} alt={r.item.title} fill style={{ objectFit: "cover" }} sizes="48px" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.item.title}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted }}>{r.item.artist}</div>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, flexShrink: 0,
                      background: r.correct ? T.correctBg : T.wrongBg,
                      color: r.correct ? T.correct : T.wrong,
                    }}>
                      {r.correct ? (r.hintUsed ? "+0.5" : "+1") : "0"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-member CTA — register */}
            {!user && (
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: "24px", marginBottom: 24, textAlign: "center",
              }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                  Daha fazla quiz ve sanat içeriği için
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, margin: "0 0 16px" }}>
                  Ücretsiz üye olun — rozetlerinizi kaydedin, liderlik tablosunda yerinizi alın,
                  yeni quizlerden ilk siz haberdar olun.
                </p>
                <a
                  href="/club/giris"
                  style={{
                    display: "inline-block", background: T.accent, color: T.bg,
                    textDecoration: "none", fontSize: 15, fontWeight: 700,
                    padding: "14px 36px", borderRadius: 99,
                    transition: `transform .2s ${ease}`,
                  }}
                >
                  Ücretsiz Üye Ol
                </a>
              </div>
            )}

            {/* Actions — replay same or try next difficulty */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => startGame("normal")}
                style={{
                  width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 12,
                  padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transition: `transform .2s ${ease}`,
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                Tekrar Oyna ({DIFFICULTY_META[difficulty].label})
              </button>

              {/* Suggest next difficulty */}
              {difficulty !== "zor" && (
                <button
                  onClick={() => {
                    const next: Difficulty = difficulty === "kolay" ? "orta" : "zor";
                    startGame("normal", next);
                  }}
                  style={{
                    width: "100%", background: "transparent",
                    color: DIFFICULTY_META[difficulty === "kolay" ? "orta" : "zor"].color,
                    border: `1.5px solid ${DIFFICULTY_META[difficulty === "kolay" ? "orta" : "zor"].color}40`,
                    borderRadius: 12, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", transition: `all .2s ${ease}`,
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
                >
                  {difficulty === "kolay" ? "Orta Seviyeye Geç" : "Zor Seviyeye Geç"}
                </button>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setPhase("intro"); scrollTop(); }}
                  style={{
                    flex: 1, background: "transparent", color: T.muted,
                    border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px",
                    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Seviye Seç
                </button>
                <Link
                  href="/testler"
                  style={{
                    flex: 1, background: "transparent", color: T.muted,
                    border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px",
                    fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  Testlere Dön
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
