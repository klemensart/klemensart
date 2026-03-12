/* ─── Loca — Üye Alanı ─── */

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { REWARD_THRESHOLDS } from "../../config/xp-config";
import { useAuthStore } from "../../stores/auth-store";
import { useGamificationStore } from "../../stores/gamification-store";
import { useLocaStore, type SavedArticle, type ReadHistory } from "../../stores/loca-store";
import { API_BASE_URL } from "../../config/api";

/* ─── Üyelik seviyeleri ─── */
const MEMBERSHIP_LEVELS = [
  { minStars: 0, name: "Misafir", icon: "🎫", color: "#9E9E9E", perks: [] },
  {
    minStars: 10,
    name: "Keşifçi",
    icon: "🔭",
    color: "#4A9EFF",
    perks: ["Okuma listesi", "Favori mekanlar"],
  },
  {
    minStars: 30,
    name: "Koleksiyoner",
    icon: "🎭",
    color: "#9B6BB0",
    perks: ["Atölye indirimi (%10)", "Özel içerikler"],
  },
  {
    minStars: 75,
    name: "Küratör",
    icon: "✨",
    color: "#FFB300",
    perks: ["Erken erişim", "Etkinlik önceliği"],
  },
  {
    minStars: 150,
    name: "VIP",
    icon: "👑",
    color: COLORS.coral,
    perks: ["Tüm ayrıcalıklar", "Özel davetler", "Ücretsiz atölye"],
  },
];

function getMembership(stars: number) {
  let level = MEMBERSHIP_LEVELS[0];
  for (const l of MEMBERSHIP_LEVELS) {
    if (stars >= l.minStars) level = l;
  }
  return level;
}

function getNextMembership(stars: number) {
  for (const l of MEMBERSHIP_LEVELS) {
    if (stars < l.minStars) return l;
  }
  return null;
}

export default function LocaScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { totalStars } = useGamificationStore();
  const { savedArticles, savedPlaces, readHistory, loaded, hydrate } =
    useLocaStore();

  useEffect(() => {
    if (!loaded) hydrate();
  }, [loaded]);

  // Giriş yapmamış kullanıcı
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.locaIconBig}>🏛️</Text>
          <Text style={styles.locaTitle}>Klemens Loca</Text>
          <Text style={styles.locaSub}>
            Özel içeriklere erişmek, koleksiyon oluşturmak ve ayrıcalıklardan
            yararlanmak için giriş yap.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const membership = getMembership(totalStars);
  const nextLevel = getNextMembership(totalStars);
  const progress = nextLevel
    ? (totalStars - membership.minStars) /
      (nextLevel.minStars - membership.minStars)
    : 1;

  const resolveImage = (img: string) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_BASE_URL}${img}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      {/* ─── Üyelik Kartı ─── */}
      <View style={[styles.memberCard, { borderColor: membership.color }]}>
        <View style={styles.memberHeader}>
          <Text style={styles.memberIcon}>{membership.icon}</Text>
          <View style={styles.memberInfo}>
            <Text style={styles.memberLevel}>{membership.name}</Text>
            <Text style={styles.memberStars}>{totalStars} yıldız</Text>
          </View>
        </View>

        {/* İlerleme çubuğu */}
        {nextLevel && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progress * 100, 100)}%`,
                    backgroundColor: membership.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {nextLevel.icon} {nextLevel.name} için{" "}
              {nextLevel.minStars - totalStars} yıldız daha
            </Text>
          </View>
        )}

        {/* Mevcut ayrıcalıklar */}
        {membership.perks.length > 0 && (
          <View style={styles.perksRow}>
            {membership.perks.map((perk) => (
              <View key={perk} style={styles.perkChip}>
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ─── Koleksiyonum ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Koleksiyonum</Text>
          <Text style={styles.sectionCount}>
            {savedArticles.length + savedPlaces.length}
          </Text>
        </View>

        {savedArticles.length === 0 && savedPlaces.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>
              Yazılara ve mekanlara kaydet butonuyla ekle
            </Text>
          </View>
        ) : (
          <>
            {/* Kayıtlı yazılar */}
            {savedArticles.slice(0, 3).map((article) => (
              <ArticleRow
                key={article.slug}
                article={article}
                imageUri={resolveImage(article.image)}
                onPress={() =>
                  navigation.navigate("Kesfet", {
                    screen: "ArticleReader",
                    params: { article },
                  })
                }
              />
            ))}

            {/* Kayıtlı mekanlar */}
            {savedPlaces.slice(0, 3).map((place) => (
              <TouchableOpacity
                key={place.name}
                style={styles.placeRow}
                onPress={() => navigation.navigate("Harita")}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.placeIcon,
                    {
                      backgroundColor:
                        (COLORS as any).type?.[place.type] ?? COLORS.coral,
                    },
                  ]}
                >
                  <Text style={styles.placeIconText}>
                    {place.type === "müze"
                      ? "🏛️"
                      : place.type === "galeri"
                      ? "🎨"
                      : place.type === "tiyatro"
                      ? "🎭"
                      : place.type === "konser"
                      ? "🎵"
                      : place.type === "tarihi"
                      ? "🏰"
                      : "📍"}
                  </Text>
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {place.name}
                  </Text>
                  <Text style={styles.placeType}>{place.type}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {savedArticles.length + savedPlaces.length > 6 && (
              <TouchableOpacity style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* ─── Okuma Geçmişi ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Okuma Geçmişi</Text>
          <Text style={styles.sectionCount}>{readHistory.length}</Text>
        </View>

        {readHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyText}>
              Okuduğun yazılar burada görünecek
            </Text>
          </View>
        ) : (
          readHistory.slice(0, 5).map((item) => (
            <ArticleRow
              key={item.slug}
              article={item}
              imageUri={resolveImage(item.image)}
              subtitle={timeAgo(item.readAt)}
              onPress={() =>
                navigation.navigate("Kesfet", {
                  screen: "ArticleReader",
                  params: { article: item },
                })
              }
            />
          ))
        )}
      </View>

      {/* ─── Ayrıcalıklar Yol Haritası ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Üyelik Ayrıcalıkları</Text>
        {MEMBERSHIP_LEVELS.slice(1).map((level) => {
          const unlocked = totalStars >= level.minStars;
          return (
            <View
              key={level.name}
              style={[styles.tierRow, !unlocked && styles.tierLocked]}
            >
              <Text style={styles.tierIcon}>{level.icon}</Text>
              <View style={styles.tierInfo}>
                <Text
                  style={[styles.tierName, !unlocked && styles.tierNameLocked]}
                >
                  {level.name}{" "}
                  <Text style={styles.tierStars}>({level.minStars}⭐)</Text>
                </Text>
                <Text style={styles.tierPerks}>{level.perks.join(" · ")}</Text>
              </View>
              {unlocked && <Text style={styles.tierCheck}>✓</Text>}
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ─── Alt Bileşenler ─── */

function ArticleRow({
  article,
  imageUri,
  subtitle,
  onPress,
}: {
  article: SavedArticle | ReadHistory;
  imageUri: string | null;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.articleRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.articleThumb} />
      ) : (
        <View style={[styles.articleThumb, styles.articleThumbPlaceholder]}>
          <Text style={{ fontSize: 16 }}>📰</Text>
        </View>
      )}
      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.articleMeta}>
          {article.author}
          {subtitle ? ` · ${subtitle}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

/* ─── Stiller ─── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.xl },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  // Login CTA
  locaIconBig: { fontSize: 56, marginBottom: 16 },
  locaTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 8,
  },
  locaSub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.warm,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  loginBtn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  loginBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: "#fff",
  },

  // Membership card
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    ...SHADOWS.md,
  },
  memberHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  memberIcon: { fontSize: 36, marginRight: 12 },
  memberInfo: { flex: 1 },
  memberLevel: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "700",
    color: COLORS.dark,
  },
  memberStars: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    marginTop: 2,
  },

  progressSection: { marginBottom: 12 },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.light ?? "#f0ebe5",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
  },

  perksRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  perkChip: {
    backgroundColor: "#FFF3E0",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  perkText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "600",
    color: "#E65100",
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: COLORS.dark,
  },
  sectionCount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.warm,
    backgroundColor: COLORS.light ?? "#f0ebe5",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
    overflow: "hidden",
  },

  // Empty state
  emptyBox: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    textAlign: "center",
  },

  // Article row
  articleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light ?? "#f0f0f0",
  },
  articleThumb: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
  },
  articleThumbPlaceholder: {
    backgroundColor: COLORS.light ?? "#f0ebe5",
    alignItems: "center",
    justifyContent: "center",
  },
  articleInfo: { flex: 1 },
  articleTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.dark,
    lineHeight: 18,
  },
  articleMeta: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    marginTop: 2,
  },

  // Place row
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light ?? "#f0f0f0",
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    opacity: 0.9,
  },
  placeIconText: { fontSize: 18 },
  placeInfo: { flex: 1 },
  placeName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.dark,
  },
  placeType: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    textTransform: "capitalize",
    marginTop: 1,
  },

  // See all
  seeAllBtn: { alignItems: "center", paddingVertical: SPACING.md },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "600",
    color: COLORS.coral,
  },

  // Tiers
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light ?? "#f0f0f0",
  },
  tierLocked: { opacity: 0.45 },
  tierIcon: { fontSize: 24, marginRight: 12, width: 32, textAlign: "center" },
  tierInfo: { flex: 1 },
  tierName: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
    color: COLORS.dark,
  },
  tierNameLocked: { color: COLORS.warm },
  tierStars: {
    fontSize: FONTS.sizes.xs,
    fontWeight: "400",
    color: COLORS.warm,
  },
  tierPerks: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warm,
    marginTop: 2,
  },
  tierCheck: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
    marginLeft: 8,
  },
});
