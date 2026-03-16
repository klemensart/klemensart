import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-check";

export type SegmentId =
  | "loyal_readers"
  | "last_campaign_openers"
  | "last_campaign_clickers"
  | "cooling_off"
  | "never_opened"
  | "subscriber_no_purchase"
  | "one_time_buyer"
  | "multi_buyer"
  | "expiring_soon"
  | "new_7d"
  | "new_30d"
  // Harita davranış segmentleri
  | "map_tarihi"
  | "map_sanat"
  | "map_muzik_tiyatro"
  | "map_aktif_gezgin"
  | "map_yeni_kesfifci"
  // Satın alma hunisi segmentleri
  | "funnel_viewed_not_bought"
  | "funnel_carted_not_checked_out"
  | "funnel_checkout_abandoned";

export async function GET(req: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const segmentId = req.nextUrl.searchParams.get("segmentId") as SegmentId | null;

  const admin = createAdminClient();

  // Fetch all data we need
  const [logsRes, subsRes, purchasesRes, usersRes, mapVisitsRes, funnelEventsRes] = await Promise.all([
    admin
      .from("email_logs")
      .select("subscriber_email, subject, sent_at, opened_at, clicked_at")
      .order("sent_at", { ascending: false }),
    admin.from("subscribers").select("email, subscribed_at, is_active").eq("is_active", true),
    admin.from("purchases").select("user_id, workshop_id, expires_at"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("map_visits").select("user_id, place_type"),
    admin.from("user_events").select("event_type, user_id, anonymous_id"),
  ]);

  const logs = logsRes.data ?? [];
  const subs = subsRes.data ?? [];
  const purchases = purchasesRes.data ?? [];
  const authUsers = usersRes.data?.users ?? [];
  const mapVisits = mapVisitsRes.data ?? [];
  const funnelEvents = funnelEventsRes.data ?? [];

  // Funnel: user_id bazlı event setleri (sadece user_id olanlar — e-posta göndermek için)
  const funnelUserEvents = new Map<string, Set<string>>();
  for (const e of funnelEvents) {
    if (!e.user_id) continue;
    if (!funnelUserEvents.has(e.user_id)) {
      funnelUserEvents.set(e.user_id, new Set());
    }
    funnelUserEvents.get(e.user_id)!.add(e.event_type);
  }

  // Harita davranış analizi: user_id → place_type sayıları
  const userPlaceTypes = new Map<string, Map<string, number>>();
  const userVisitCount = new Map<string, number>();
  for (const v of mapVisits) {
    const types = userPlaceTypes.get(v.user_id) ?? new Map<string, number>();
    types.set(v.place_type, (types.get(v.place_type) || 0) + 1);
    userPlaceTypes.set(v.user_id, types);
    userVisitCount.set(v.user_id, (userVisitCount.get(v.user_id) || 0) + 1);
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const activeEmails = new Set(subs.map((s) => s.email));

  // Auth user email → id mapping
  const emailToUserId = new Map<string, string>();
  const userIdToEmail = new Map<string, string>();
  for (const u of authUsers) {
    if (u.email) {
      emailToUserId.set(u.email, u.id);
      userIdToEmail.set(u.id, u.email);
    }
  }

  // Purchase counts per user
  const purchaseCountByUserId = new Map<string, number>();
  for (const p of purchases) {
    purchaseCountByUserId.set(p.user_id, (purchaseCountByUserId.get(p.user_id) || 0) + 1);
  }

  // Buyer user_ids set
  const buyerUserIds = new Set(purchases.map((p) => p.user_id));

  // Find the latest campaign subject
  const lastCampaignSubject = logs.length > 0 ? logs[0].subject : null;

  // Per-email open counts in last 60 days
  const openCountLast60 = new Map<string, number>();
  const openedLast60Set = new Set<string>();
  const openedLast30Set = new Set<string>();
  for (const l of logs) {
    if (l.opened_at) {
      if (l.sent_at >= sixtyDaysAgo) {
        openCountLast60.set(l.subscriber_email, (openCountLast60.get(l.subscriber_email) || 0) + 1);
        openedLast60Set.add(l.subscriber_email);
      }
      if (l.sent_at >= thirtyDaysAgo) {
        openedLast30Set.add(l.subscriber_email);
      }
    }
  }

  // Emails that were ever sent to
  const everSentTo = new Set(logs.map((l) => l.subscriber_email));
  // Emails that ever opened
  const everOpened = new Set(logs.filter((l) => l.opened_at).map((l) => l.subscriber_email));

  // Previously opened (before 30 days ago) but not in last 30 days
  const openedBefore30 = new Set(
    logs.filter((l) => l.opened_at && l.sent_at < thirtyDaysAgo).map((l) => l.subscriber_email)
  );

  const resolveSegment = (id: SegmentId): string[] => {
    switch (id) {
      case "loyal_readers": {
        // 3+ opens in last 60 days, active subscriber
        return [...activeEmails].filter((e) => (openCountLast60.get(e) || 0) >= 3);
      }
      case "last_campaign_openers": {
        // Opened the most recent campaign
        if (!lastCampaignSubject) return [];
        const openers = new Set(
          logs
            .filter((l) => l.subject === lastCampaignSubject && l.opened_at)
            .map((l) => l.subscriber_email)
        );
        return [...activeEmails].filter((e) => openers.has(e));
      }
      case "last_campaign_clickers": {
        // Clicked in the most recent campaign
        if (!lastCampaignSubject) return [];
        const clickers = new Set(
          logs
            .filter((l) => l.subject === lastCampaignSubject && l.clicked_at)
            .map((l) => l.subscriber_email)
        );
        return [...activeEmails].filter((e) => clickers.has(e));
      }
      case "cooling_off": {
        // Previously opened but not in last 30 days
        return [...activeEmails].filter(
          (e) => openedBefore30.has(e) && !openedLast30Set.has(e)
        );
      }
      case "never_opened": {
        // Received at least one email but never opened any
        return [...activeEmails].filter(
          (e) => everSentTo.has(e) && !everOpened.has(e)
        );
      }
      case "subscriber_no_purchase": {
        // Active subscriber but never purchased anything
        return [...activeEmails].filter((e) => {
          const userId = emailToUserId.get(e);
          return !userId || !buyerUserIds.has(userId);
        });
      }
      case "one_time_buyer": {
        // Exactly 1 purchase
        const oneTimerIds = new Set(
          [...purchaseCountByUserId.entries()]
            .filter(([, count]) => count === 1)
            .map(([uid]) => uid)
        );
        const emails = [...oneTimerIds]
          .map((uid) => userIdToEmail.get(uid))
          .filter((e): e is string => !!e);
        return emails;
      }
      case "multi_buyer": {
        // 2+ purchases
        const multiIds = new Set(
          [...purchaseCountByUserId.entries()]
            .filter(([, count]) => count >= 2)
            .map(([uid]) => uid)
        );
        const emails = [...multiIds]
          .map((uid) => userIdToEmail.get(uid))
          .filter((e): e is string => !!e);
        return emails;
      }
      case "expiring_soon": {
        // Purchase expires within 30 days
        const expiringUserIds = new Set(
          purchases
            .filter(
              (p) =>
                p.expires_at &&
                p.expires_at >= now.toISOString() &&
                p.expires_at <= thirtyDaysFromNow
            )
            .map((p) => p.user_id)
        );
        const emails = [...expiringUserIds]
          .map((uid) => userIdToEmail.get(uid))
          .filter((e): e is string => !!e);
        return emails;
      }
      case "new_7d": {
        // Subscribed in last 7 days
        return subs
          .filter((s) => s.subscribed_at && s.subscribed_at >= sevenDaysAgo)
          .map((s) => s.email);
      }
      case "new_30d": {
        // Subscribed in last 30 days
        return subs
          .filter((s) => s.subscribed_at && s.subscribed_at >= thirtyDaysAgo)
          .map((s) => s.email);
      }
      // ── Harita Davranış Segmentleri ──
      case "map_tarihi": {
        // Tarihi mekan + miras alanlarını 2+ kez ziyaret edenler
        const userIds = [...userPlaceTypes.entries()]
          .filter(([, types]) => ((types.get("tarihi") || 0) + (types.get("miras") || 0)) >= 2)
          .map(([uid]) => uid);
        return userIds.map((uid) => userIdToEmail.get(uid)).filter((e): e is string => !!e && activeEmails.has(e));
      }
      case "map_sanat": {
        // Müze + galeri ziyaretçileri (2+ ziyaret)
        const userIds = [...userPlaceTypes.entries()]
          .filter(([, types]) => ((types.get("müze") || 0) + (types.get("galeri") || 0)) >= 2)
          .map(([uid]) => uid);
        return userIds.map((uid) => userIdToEmail.get(uid)).filter((e): e is string => !!e && activeEmails.has(e));
      }
      case "map_muzik_tiyatro": {
        // Konser + tiyatro mekanlarını ziyaret edenler
        const userIds = [...userPlaceTypes.entries()]
          .filter(([, types]) => ((types.get("konser") || 0) + (types.get("tiyatro") || 0)) >= 1)
          .map(([uid]) => uid);
        return userIds.map((uid) => userIdToEmail.get(uid)).filter((e): e is string => !!e && activeEmails.has(e));
      }
      case "map_aktif_gezgin": {
        // 10+ farklı mekan ziyaret etmiş aktif gezginler
        const userIds = [...userVisitCount.entries()]
          .filter(([, count]) => count >= 10)
          .map(([uid]) => uid);
        return userIds.map((uid) => userIdToEmail.get(uid)).filter((e): e is string => !!e && activeEmails.has(e));
      }
      case "map_yeni_kesfifci": {
        // 1-3 ziyaret yapmış yeni keşifçiler (potansiyel büyüme)
        const userIds = [...userVisitCount.entries()]
          .filter(([, count]) => count >= 1 && count <= 3)
          .map(([uid]) => uid);
        return userIds.map((uid) => userIdToEmail.get(uid)).filter((e): e is string => !!e && activeEmails.has(e));
      }
      // ── Satın Alma Hunisi Segmentleri ──
      case "funnel_viewed_not_bought": {
        // Atölye sayfasını gördü ama hiç satın almadı
        const userIds = [...funnelUserEvents.entries()]
          .filter(([uid, events]) => events.has("workshop_view") && !buyerUserIds.has(uid))
          .map(([uid]) => uid);
        return userIds.map((uid) => userIdToEmail.get(uid)).filter((e): e is string => !!e && activeEmails.has(e));
      }
      case "funnel_carted_not_checked_out": {
        // Sepete ekledi ama ödeme sayfasına girmedi
        const userIds = [...funnelUserEvents.entries()]
          .filter(([, events]) => events.has("add_to_cart") && !events.has("checkout_start"))
          .map(([uid]) => uid);
        return userIds.map((uid) => userIdToEmail.get(uid)).filter((e): e is string => !!e && activeEmails.has(e));
      }
      case "funnel_checkout_abandoned": {
        // Ödeme sayfasına girdi ama tamamlamadı
        const userIds = [...funnelUserEvents.entries()]
          .filter(([, events]) => events.has("checkout_start") && !events.has("checkout_complete"))
          .map(([uid]) => uid);
        return userIds.map((uid) => userIdToEmail.get(uid)).filter((e): e is string => !!e && activeEmails.has(e));
      }
      default:
        return [];
    }
  };

  // If segmentId provided, return that segment's emails
  if (segmentId) {
    const emails = resolveSegment(segmentId);
    return NextResponse.json({ segmentId, count: emails.length, emails });
  }

  // Otherwise return all segment counts (for the dropdown)
  const allSegments: { id: SegmentId; label: string; description: string; count: number; category: string }[] = [
    { id: "loyal_readers", label: "En Sadık Okuyucular", description: "Son 60 günde 3+ e-posta açanlar", count: 0, category: "E-posta Davranışı" },
    { id: "last_campaign_openers", label: "Son Kampanyayı Açanlar", description: "En son gönderilen e-postayı açanlar", count: 0, category: "E-posta Davranışı" },
    { id: "last_campaign_clickers", label: "Son Kampanyaya Tıklayanlar", description: "En son e-postadaki linke tıklayanlar", count: 0, category: "E-posta Davranışı" },
    { id: "cooling_off", label: "Soğuyan Kitle", description: "Eskiden açıyordu, son 30 gündür açmıyor", count: 0, category: "E-posta Davranışı" },
    { id: "never_opened", label: "Hiç Açmamışlar", description: "E-posta aldı ama hiçbirini açmamış", count: 0, category: "E-posta Davranışı" },
    { id: "subscriber_no_purchase", label: "Sadece Abone", description: "Bültene kayıtlı ama hiç satın alma yapmamış", count: 0, category: "Satın Alma" },
    { id: "one_time_buyer", label: "Bir Kez Almış", description: "Tek atölye satın almış", count: 0, category: "Satın Alma" },
    { id: "multi_buyer", label: "Çoklu Alıcı (2+)", description: "Birden fazla atölye almış VIP müşteriler", count: 0, category: "Satın Alma" },
    { id: "expiring_soon", label: "Süresi Dolmak Üzere", description: "Satın alması 30 gün içinde sona erecek", count: 0, category: "Satın Alma" },
    { id: "new_7d", label: "Yeni Aboneler (7 Gün)", description: "Son 7 günde abone olanlar", count: 0, category: "Yeni Kullanıcılar" },
    { id: "new_30d", label: "Yeni Aboneler (30 Gün)", description: "Son 30 günde abone olanlar", count: 0, category: "Yeni Kullanıcılar" },
    // Harita davranış segmentleri
    { id: "map_tarihi", label: "Tarih Meraklıları", description: "Tarihi mekan ve miras alanlarını 2+ kez ziyaret edenler", count: 0, category: "Kültür Haritası" },
    { id: "map_sanat", label: "Sanat Severler", description: "Müze ve galeri ziyaretçileri (2+ ziyaret)", count: 0, category: "Kültür Haritası" },
    { id: "map_muzik_tiyatro", label: "Sahne Sanatları", description: "Konser ve tiyatro mekanlarını ziyaret edenler", count: 0, category: "Kültür Haritası" },
    { id: "map_aktif_gezgin", label: "Aktif Gezginler", description: "10+ farklı mekan keşfetmiş süper gezginler", count: 0, category: "Kültür Haritası" },
    { id: "map_yeni_kesfifci", label: "Yeni Kaşifler", description: "1-3 ziyaret yapmış, potansiyel büyüme kitlesi", count: 0, category: "Kültür Haritası" },
    // Satın alma hunisi segmentleri
    { id: "funnel_viewed_not_bought", label: "Görüntüleyip Almamış", description: "Atölye sayfasını gördü ama satın almadı", count: 0, category: "Satın Alma Hunisi" },
    { id: "funnel_carted_not_checked_out", label: "Sepette Bırakmış", description: "Satın Al'a tıkladı ama ödemeye geçmedi", count: 0, category: "Satın Alma Hunisi" },
    { id: "funnel_checkout_abandoned", label: "Ödemeyi Yarım Bırakmış", description: "Ödeme sayfasına girdi ama tamamlamadı", count: 0, category: "Satın Alma Hunisi" },
  ];

  for (const seg of allSegments) {
    seg.count = resolveSegment(seg.id).length;
  }

  return NextResponse.json({ segments: allSegments });
}
