/**
 * Event registration migration — doğrulama scripti.
 * Kullanım: set -a && source .env.local && set +a && npx tsx scripts/apply-event-registration-migration.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.\n" +
    "set -a && source .env.local && set +a"
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("── Event Registration Migration ──\n");

  // 1. events tablosuna yeni kolonları tek tek ekle (PostgREST DDL desteklemez,
  //    ama .rpc() ile pg fonksiyonu çağırabiliriz; bunun yerine test edelim)

  // Test: events tablosunda capacity kolonu var mı?
  const { data: testRow, error: testErr } = await supabase
    .from("events")
    .select("id")
    .limit(1);

  if (testErr) {
    console.error("events tablosuna erişilemedi:", testErr.message);
    process.exit(1);
  }
  console.log("✓ events tablosuna erişim OK");

  // event_registrations tablosu var mı test et
  const { error: regErr } = await supabase
    .from("event_registrations")
    .select("id")
    .limit(1);

  if (regErr && regErr.message.includes("does not exist")) {
    console.log("\n⚠ event_registrations tablosu henüz yok.");
    console.log("  Lütfen sql/migrations/faz_2b_1_event_registrations.sql dosyasını");
    console.log("  Supabase Dashboard → SQL Editor'da çalıştırın.\n");
    console.log("  URL: https://supabase.com/dashboard/project/sgabkrzzzszfqrtgkord/sql/new");
    process.exit(1);
  }

  if (regErr) {
    console.log("event_registrations sorgu hatası:", regErr.message);
    console.log("Tablo mevcut olmayabilir — Dashboard'dan migration SQL'ini çalıştırın.");
    process.exit(1);
  }

  console.log("✓ event_registrations tablosu mevcut");

  // capacity kolonu test
  const { data: capTest, error: capErr } = await supabase
    .from("events")
    .select("id,capacity,registration_enabled,slug,contact_email")
    .limit(1);

  if (capErr) {
    console.log("\n⚠ events tablosuna yeni kolonlar henüz eklenmemiş:", capErr.message);
    console.log("  Dashboard'dan migration SQL'ini çalıştırın.");
    process.exit(1);
  }

  console.log("✓ events tablosu yeni kolonlar mevcut (capacity, registration_enabled, slug, contact_email)");

  // insert test
  const testEmail = `test-migration-${Date.now()}@test.local`;
  const { data: firstEvent } = await supabase
    .from("events")
    .select("id")
    .eq("status", "approved")
    .limit(1)
    .single();

  if (firstEvent) {
    const { error: insertErr } = await supabase
      .from("event_registrations")
      .insert({
        event_id: firstEvent.id,
        name: "Test Kullanıcı",
        email: testEmail,
        status: "confirmed",
      });

    if (insertErr) {
      console.log("⚠ Insert testi başarısız:", insertErr.message);
      if (insertErr.message.includes("policy")) {
        console.log("  RLS policy'leri kontrol edin.");
      }
    } else {
      console.log("✓ Insert testi başarılı");

      // Temizle
      await supabase
        .from("event_registrations")
        .delete()
        .eq("email", testEmail)
        .eq("event_id", firstEvent.id);
      console.log("✓ Test kaydı temizlendi");
    }
  }

  console.log("\n── Migration doğrulama tamamlandı ──");
}

main().catch(console.error);
