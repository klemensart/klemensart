/**
 * People tablosu migration script
 * ADIM 1: Tablo oluştur
 * ADIM 2: Mevcut veriyi taşı
 * ADIM 3: FK kolonları ekle
 * ADIM 4: Kayıtları bağla
 *
 * Kullanım: node scripts/migrate-people.mjs [step]
 *   step 1 = Tablo oluştur
 *   step 2 = Veri taşı + FK + bağla (hepsi birden)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// .env.local'dan oku
const envFile = readFileSync(".env.local", "utf-8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const step = process.argv[2] || "1";

// ─── Türkçe slug üretici ───
function slugify(text) {
  const charMap = {
    ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", İ: "I",
    ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U",
  };
  return text
    .split("")
    .map((c) => charMap[c] || c)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── ADIM 1: Tablo oluştur ───
async function step1() {
  console.log("ADIM 1: people tablosu oluşturuluyor...");

  // Service role ile doğrudan RPC çağıramıyoruz, tablo oluşturmak için
  // Supabase Dashboard SQL Editor'den create-people.sql dosyasını çalıştırın.
  // Bu script sadece veri migration'ı için.

  // Tabloyu kontrol et
  const { data, error } = await supabase.from("people").select("id").limit(1);
  if (error && error.code === "42P01") {
    console.error("❌ people tablosu bulunamadı!");
    console.error("   Lütfen sql/create-people.sql dosyasını Supabase SQL Editor'de çalıştırın.");
    console.error("   URL: https://supabase.com/dashboard/project/sgabkrzzzszfqrtgkord/sql/new");
    process.exit(1);
  }
  if (error && error.message?.includes("does not exist")) {
    console.error("❌ people tablosu bulunamadı!");
    console.error("   Lütfen sql/create-people.sql dosyasını Supabase SQL Editor'de çalıştırın.");
    process.exit(1);
  }
  console.log("✅ people tablosu mevcut.");
  return true;
}

// ─── ADIM 2: Veri taşı ───
async function step2() {
  console.log("\nADIM 2: Mevcut veri people tablosuna taşınıyor...\n");

  const today = "2026-04-19";
  const peopleMap = new Map(); // name (lowercase) → person object

  // ─── (a) marketplace_events organizatörleri ───
  const { data: events } = await supabase
    .from("marketplace_events")
    .select("organizer_name, organizer_email, organizer_phone, organizer_url, organizer_logo_url");

  const distinctOrgs = new Map();
  for (const e of events || []) {
    const key = e.organizer_name?.trim();
    if (!key) continue;
    if (!distinctOrgs.has(key)) {
      distinctOrgs.set(key, {
        name: key,
        email: e.organizer_email || null,
        phone: e.organizer_phone || null,
        url: e.organizer_url || null,
        logo: e.organizer_logo_url || null,
        count: 1,
      });
    } else {
      distinctOrgs.get(key).count++;
      // Dolu değer varsa üzerine yaz
      if (e.organizer_email) distinctOrgs.get(key).email = e.organizer_email;
      if (e.organizer_phone) distinctOrgs.get(key).phone = e.organizer_phone;
      if (e.organizer_url) distinctOrgs.get(key).url = e.organizer_url;
      if (e.organizer_logo_url) distinctOrgs.get(key).logo = e.organizer_logo_url;
    }
  }

  for (const [name, org] of distinctOrgs) {
    const lookupKey = name.toLowerCase().trim();
    // Klemens Art → slug: klemens
    const isKlemens = lookupKey === "klemens art" || lookupKey === "klemens";
    const slug = isKlemens ? "klemens" : slugify(name);
    const displayName = isKlemens ? "Klemens" : name;

    const person = {
      slug,
      name: displayName,
      avatar_url: org.logo || null,
      email: org.email || null,
      website: org.url || null,
      is_author: false,
      is_host: true,
      is_verified: false,
      short_bio: isKlemens ? "Klemens editöryal ekibi" : null,
      metadata: {
        migrated_from_events: {
          source: "marketplace_events",
          original_text: name,
          original_count: org.count,
        },
        migration_date: today,
      },
    };

    // Host-specific data in metadata
    if (org.phone) {
      person.metadata.host_phone = org.phone;
    }

    peopleMap.set(lookupKey, person);
    console.log(`  [host] ${displayName} (slug: ${slug}, ${org.count} etkinlik)`);
  }

  // ─── (b) articles yazarları ───
  const { data: articles } = await supabase
    .from("articles")
    .select("author, author_ig, author_email");

  const distinctAuthors = new Map();
  for (const a of articles || []) {
    const raw = a.author?.trim();
    if (!raw) continue;
    const key = raw;
    if (!distinctAuthors.has(key)) {
      distinctAuthors.set(key, {
        name: raw,
        ig: a.author_ig && a.author_ig.trim() !== "" ? a.author_ig.trim() : null,
        email: a.author_email && a.author_email.trim() !== "" ? a.author_email.trim() : null,
        count: 1,
      });
    } else {
      distinctAuthors.get(key).count++;
      if (a.author_ig && a.author_ig.trim() !== "") distinctAuthors.get(key).ig = a.author_ig.trim();
      if (a.author_email && a.author_email.trim() !== "") distinctAuthors.get(key).email = a.author_email.trim();
    }
  }

  // Edge case merges BEFORE processing
  // E2: "Ezel Evin ALTINDAĞ" → "Ezel Evin Altındağ"
  if (distinctAuthors.has("Ezel Evin ALTINDAĞ") && distinctAuthors.has("Ezel Evin Altındağ")) {
    const upper = distinctAuthors.get("Ezel Evin ALTINDAĞ");
    const normal = distinctAuthors.get("Ezel Evin Altındağ");
    normal.count += upper.count;
    if (upper.ig) normal.ig = upper.ig;
    if (upper.email) normal.email = upper.email;
    distinctAuthors.delete("Ezel Evin ALTINDAĞ");
  } else if (distinctAuthors.has("Ezel Evin ALTINDAĞ")) {
    const entry = distinctAuthors.get("Ezel Evin ALTINDAĞ");
    entry.name = "Ezel Evin Altındağ";
    distinctAuthors.set("Ezel Evin Altındağ", entry);
    distinctAuthors.delete("Ezel Evin ALTINDAĞ");
  }

  // E3: "Gözde Murt" → "Gözde Şensoy Murt"
  if (distinctAuthors.has("Gözde Murt") && distinctAuthors.has("Gözde Şensoy Murt")) {
    const short = distinctAuthors.get("Gözde Murt");
    const full = distinctAuthors.get("Gözde Şensoy Murt");
    full.count += short.count;
    if (short.ig) full.ig = short.ig;
    if (short.email) full.email = short.email;
    distinctAuthors.delete("Gözde Murt");
  } else if (distinctAuthors.has("Gözde Murt")) {
    const entry = distinctAuthors.get("Gözde Murt");
    entry.name = "Gözde Şensoy Murt";
    distinctAuthors.set("Gözde Şensoy Murt", entry);
    distinctAuthors.delete("Gözde Murt");
  }

  // E1/E8: "KLEMENS" ve "Klemens Art" → tek "Klemens" kaydı
  let klemensAuthorCount = 0;
  for (const variant of ["KLEMENS", "Klemens Art"]) {
    if (distinctAuthors.has(variant)) {
      klemensAuthorCount += distinctAuthors.get(variant).count;
      distinctAuthors.delete(variant);
    }
  }

  // E4: Hülya Utkuluer — @hutkuler vs @hutkuluer → @hutkuluer
  if (distinctAuthors.has("Hülya Utkuluer")) {
    distinctAuthors.get("Hülya Utkuluer").ig = "@hutkuluer";
  }

  // E6: Ebru Berra Alkan — normalize
  if (distinctAuthors.has("Ebru Berra Alkan")) {
    const e = distinctAuthors.get("Ebru Berra Alkan");
    e.ig = "berraalkann";
    e.email = "berraalkann@gmail.com";
  }

  // Process authors
  for (const [, author] of distinctAuthors) {
    const lookupKey = author.name.toLowerCase().trim();

    if (peopleMap.has(lookupKey)) {
      // Zaten host olarak var, is_author ekle
      const existing = peopleMap.get(lookupKey);
      existing.is_author = true;
      if (author.ig) existing.instagram = author.ig;
      if (author.email && !existing.email) existing.email = author.email;
      existing.metadata.migrated_from_articles = {
        source: "articles",
        original_text: author.name,
        original_count: author.count,
      };
      console.log(`  [author+host] ${author.name} (mevcut host kaydına eklendi)`);
    } else {
      const slug = slugify(author.name);
      peopleMap.set(lookupKey, {
        slug,
        name: author.name,
        avatar_url: null,
        email: author.email || null,
        instagram: author.ig || null,
        is_author: true,
        is_host: false,
        is_verified: false,
        short_bio: null,
        metadata: {
          migrated_from_articles: {
            source: "articles",
            original_text: author.name,
            original_count: author.count,
          },
          migration_date: today,
        },
      });
      console.log(`  [author] ${author.name} (slug: ${slug}, ${author.count} makale)`);
    }
  }

  // Klemens'i güncelle (articles'tan gelen KLEMENS/Klemens Art count'u ekle)
  if (peopleMap.has("klemens art") || peopleMap.has("klemens")) {
    const klemens = peopleMap.get("klemens art") || peopleMap.get("klemens");
    klemens.is_author = true;
    klemens.metadata.migrated_from_articles = {
      source: "articles",
      original_text: "KLEMENS + Klemens Art",
      original_count: klemensAuthorCount,
    };
    // Klemens Art key'ini klemens olarak normalize et
    if (peopleMap.has("klemens art")) {
      peopleMap.set("klemens", klemens);
      peopleMap.delete("klemens art");
    }
  }

  // Slug çakışma kontrolü
  const slugs = new Map();
  for (const [, person] of peopleMap) {
    if (slugs.has(person.slug)) {
      person.slug = person.slug + "-2";
      console.warn(`  ⚠️  Slug çakışması: "${person.name}" → "${person.slug}"`);
    }
    slugs.set(person.slug, person.name);
  }

  // INSERT
  const rows = Array.from(peopleMap.values());
  console.log(`\n  Toplam ${rows.length} kişi ekleniyor...\n`);

  const { data: inserted, error } = await supabase
    .from("people")
    .insert(rows)
    .select("id, slug, name, is_author, is_host");

  if (error) {
    console.error("❌ INSERT hatası:", error);
    process.exit(1);
  }

  console.log("✅ people tablosuna eklenen kayıtlar:");
  for (const p of inserted) {
    const roles = [p.is_author && "author", p.is_host && "host"].filter(Boolean).join("+");
    console.log(`   ${p.slug.padEnd(30)} ${p.name.padEnd(30)} [${roles}]`);
  }

  return inserted;
}

// ─── ADIM 3: FK kolonları ekle ───
async function step3() {
  console.log("\nADIM 3: FK kolonları ekleniyor...\n");
  console.log("   articles.author_id ve marketplace_events.host_id");
  console.log("   ⚠️  Bu adım ALTER TABLE gerektirir.");
  console.log("   Lütfen sql/alter-add-people-fk.sql dosyasını Supabase SQL Editor'de çalıştırın.");
  console.log("   URL: https://supabase.com/dashboard/project/sgabkrzzzszfqrtgkord/sql/new\n");
}

// ─── ADIM 4: Kayıtları bağla ───
async function step4() {
  console.log("\nADIM 4: Mevcut kayıtlar FK ile bağlanıyor...\n");

  // people tablosunu çek
  const { data: people } = await supabase.from("people").select("id, slug, name, metadata");
  if (!people?.length) {
    console.error("❌ people tablosu boş!");
    process.exit(1);
  }

  // Name → ID mapping oluştur (case-insensitive, variant'ları dahil et)
  const nameToId = new Map();
  for (const p of people) {
    nameToId.set(p.name.toLowerCase(), p.id);
    // Migration metadata'daki orijinal text'leri de ekle
    const meta = p.metadata || {};
    if (meta.migrated_from_articles?.original_text) {
      for (const variant of meta.migrated_from_articles.original_text.split(" + ")) {
        nameToId.set(variant.toLowerCase().trim(), p.id);
      }
    }
    if (meta.migrated_from_events?.original_text) {
      nameToId.set(meta.migrated_from_events.original_text.toLowerCase().trim(), p.id);
    }
  }

  // E2 edge case: büyük harf varyant
  nameToId.set("ezel evin altindağ", nameToId.get("ezel evin altındağ"));
  // E3 edge case: kısa isim
  nameToId.set("gözde murt", nameToId.get("gözde şensoy murt"));

  // ─── Articles → author_id ───
  const { data: allArticles } = await supabase
    .from("articles")
    .select("id, author");

  let articleNull = 0;
  let articleSkipped = 0;
  let articleUpdated = 0;

  for (const article of allArticles || []) {
    const authorName = article.author?.trim();
    if (!authorName) {
      articleSkipped++;
      console.warn(`  ⚠️  Article boş author (atlandı): id=${article.id}`);
      continue;
    }
    const personId = nameToId.get(authorName.toLowerCase());
    if (!personId) {
      console.warn(`  ⚠️  Article eşleşmedi: author="${authorName}" (id=${article.id})`);
      articleNull++;
      continue;
    }
    const { error } = await supabase
      .from("articles")
      .update({ author_id: personId })
      .eq("id", article.id);
    if (error) {
      console.error(`  ❌ Article güncelleme hatası: ${article.id}`, error.message);
      articleNull++;
    } else {
      articleUpdated++;
    }
  }

  // ─── marketplace_events → host_id ───
  const { data: allEvents } = await supabase
    .from("marketplace_events")
    .select("id, organizer_name");

  let eventNull = 0;
  let eventUpdated = 0;

  for (const event of allEvents || []) {
    const orgName = event.organizer_name?.trim();
    if (!orgName) {
      eventNull++;
      continue;
    }
    const personId = nameToId.get(orgName.toLowerCase());
    if (!personId) {
      console.warn(`  ⚠️  Event eşleşmedi: organizer_name="${orgName}" (id=${event.id})`);
      eventNull++;
      continue;
    }
    const { error } = await supabase
      .from("marketplace_events")
      .update({ host_id: personId })
      .eq("id", event.id);
    if (error) {
      console.error(`  ❌ Event güncelleme hatası: ${event.id}`, error.message);
      eventNull++;
    } else {
      eventUpdated++;
    }
  }

  console.log(`\n  Articles: ${articleUpdated} güncellendi, ${articleSkipped} atlandı (boş author), ${articleNull} eşleşmedi`);
  console.log(`  Events:   ${eventUpdated} güncellendi, ${eventNull} eşleşmedi`);

  if (articleNull > 0 || eventNull > 0) {
    console.error("\n❌ Eşleşmeyen kayıtlar var! Durduruluyor.");
    console.log("   Detaylar yukarıdaki ⚠️ uyarılarında.");
    process.exit(1);
  }
  if (articleSkipped > 0) {
    console.log(`\n⚠️  ${articleSkipped} article boş author nedeniyle atlandı (draft/test kayıt).`);
  }

  console.log("\n✅ Tüm kayıtlar başarıyla bağlandı.");
}

// ─── DOĞRULAMA ───
async function verify() {
  console.log("\n═══ DOĞRULAMA ═══\n");

  const { data: people } = await supabase
    .from("people")
    .select("slug, name, is_author, is_host, metadata")
    .order("name");

  console.log(`1. Toplam people kaydı: ${people?.length}`);

  console.log("\n2. Tüm kayıtlar:");
  for (const p of people || []) {
    const roles = [p.is_author && "author", p.is_host && "host"].filter(Boolean).join("+");
    const migDate = p.metadata?.migration_date || "—";
    console.log(`   ${p.slug.padEnd(30)} ${p.name.padEnd(30)} [${roles}] migrated: ${migDate}`);
  }

  // Klemens ve Kerem Hun ayrı mı?
  console.log("\n3. Klemens vs Kerem Hun:");
  const klemens = people?.find((p) => p.slug === "klemens");
  const kerem = people?.find((p) => p.slug === "kerem-hun");
  console.log(`   klemens:  ${klemens ? "✅ var" : "❌ yok"} — is_author=${klemens?.is_author}, is_host=${klemens?.is_host}`);
  console.log(`   kerem-hun: ${kerem ? "✅ var" : "❌ yok"} — is_author=${kerem?.is_author}, is_host=${kerem?.is_host}`);

  // NULL kontrol
  const { data: artNulls } = await supabase
    .from("articles")
    .select("id, author")
    .is("author_id", null);

  const { data: evtNulls } = await supabase
    .from("marketplace_events")
    .select("id, organizer_name")
    .is("host_id", null);

  console.log(`\n4. NULL FK kontrol:`);
  console.log(`   articles WHERE author_id IS NULL: ${artNulls?.length ?? "?"}`);
  console.log(`   marketplace_events WHERE host_id IS NULL: ${evtNulls?.length ?? "?"}`);

  // Rol sayıları
  const authors = people?.filter((p) => p.is_author)?.length || 0;
  const hosts = people?.filter((p) => p.is_host)?.length || 0;
  const both = people?.filter((p) => p.is_author && p.is_host)?.length || 0;

  console.log(`\n5. Rol dağılımı:`);
  console.log(`   is_author=true: ${authors}`);
  console.log(`   is_host=true:   ${hosts}`);
  console.log(`   Her ikisi:      ${both}`);

  // Örnek join sorgusu
  const { data: sampleEvent } = await supabase
    .from("marketplace_events")
    .select("title, organizer_name, host:people!marketplace_events_host_id_fkey(id, slug, name)")
    .limit(1)
    .single();

  console.log(`\n6. Örnek join:`);
  console.log(`   Event: ${sampleEvent?.title}`);
  console.log(`   organizer_name: ${sampleEvent?.organizer_name}`);
  console.log(`   host (join):`, sampleEvent?.host);
}

// ─── Ana akış ───
async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  PEOPLE Migration Script");
  console.log("═══════════════════════════════════════════\n");

  if (step === "1") {
    await step1();
    console.log("\n→ Sonraki: sql/create-people.sql'i Supabase Dashboard'da çalıştır, sonra:");
    console.log("  node scripts/migrate-people.mjs 2");
  } else if (step === "2") {
    await step1(); // tablo kontrolü
    await step2(); // veri taşı
    console.log("\n→ Sonraki: sql/alter-add-people-fk.sql'i Supabase Dashboard'da çalıştır, sonra:");
    console.log("  node scripts/migrate-people.mjs 4");
  } else if (step === "4") {
    await step4(); // kayıtları bağla
    await verify();
  } else if (step === "verify") {
    await verify();
  } else {
    console.log("Kullanım: node scripts/migrate-people.mjs [1|2|4|verify]");
  }
}

main().catch(console.error);
