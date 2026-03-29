import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { WeekConfig, Artwork } from "./types";

/* ── Klemens Art Kurumsal Renkleri ── */
const C = {
  bg: "#FFFBF7",       // cream
  text: "#2C2319",      // warm-900
  textSec: "#4a4540",
  muted: "#8C857E",     // brand-warm
  accent: "#FF6D60",    // coral
  border: "#F0E4D9",    // warm-200
  white: "#FFFFFF",
  warmLight: "#F5F0EB", // brand-light
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
    paddingBottom: 15,
  },
  brandTag: {
    fontSize: 8,
    color: C.accent,
    letterSpacing: 3,
    marginBottom: 8,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 24,
    color: C.text,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: C.accent,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 10,
    color: C.muted,
  },
  sectionTitle: {
    fontSize: 14,
    color: C.text,
    fontFamily: "Helvetica-Bold",
    marginTop: 25,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  description: {
    fontSize: 10,
    color: C.textSec,
    lineHeight: 1.6,
    marginBottom: 15,
  },
  artworkRow: {
    flexDirection: "row" as const,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: C.white,
    borderRadius: 4,
  },
  artworkNumber: {
    fontSize: 9,
    color: C.accent,
    fontFamily: "Helvetica-Bold",
    width: 20,
  },
  artworkInfo: {
    flex: 1,
  },
  artworkTitle: {
    fontSize: 10,
    color: C.text,
    fontFamily: "Helvetica-Bold",
  },
  artworkMeta: {
    fontSize: 8,
    color: C.muted,
    marginTop: 2,
  },
  artworkDesc: {
    fontSize: 8,
    color: C.textSec,
    marginTop: 3,
    lineHeight: 1.4,
  },
  keyTermsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    marginBottom: 15,
  },
  keyTerm: {
    fontSize: 8,
    color: C.accent,
    backgroundColor: "#FFF0EE",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  discussionItem: {
    fontSize: 10,
    color: C.textSec,
    marginBottom: 8,
    lineHeight: 1.5,
    paddingLeft: 12,
  },
  footer: {
    position: "absolute" as const,
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: C.muted,
  },
});

/* ── PDF Dökümanı ── */
export function WeeklyPDF({
  week,
  artworks,
}: {
  week: WeekConfig;
  artworks: Artwork[];
}) {
  return (
    <Document>
      {/* Sayfa 1: Kapak + Genel Bilgi */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandTag}>Klemens Art — Modern Sanat Atölyesi</Text>
          <Text style={styles.title}>
            Hafta {week.weekNumber}: {week.title}
          </Text>
          <Text style={styles.subtitle}>{week.subtitle}</Text>
          <Text style={styles.dateRange}>{week.dateRange}</Text>
        </View>

        <Text style={styles.sectionTitle}>Bu Hafta Öğrendiklerimiz</Text>
        <Text style={styles.description}>{week.description}</Text>

        <Text style={styles.sectionTitle}>Anahtar Kavramlar</Text>
        <View style={styles.keyTermsContainer}>
          {week.keyTerms.map((term, i) => (
            <Text key={i} style={styles.keyTerm}>
              {term}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Öne Çıkan Sanatçılar</Text>
        <Text style={styles.description}>
          {week.keyArtists.join("  •  ")}
        </Text>

        <Text style={styles.sectionTitle}>Tartışma Soruları</Text>
        {week.discussionQuestions.map((q, i) => (
          <Text key={i} style={styles.discussionItem}>
            {i + 1}. {q}
          </Text>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>klemensart.com</Text>
          <Text style={styles.footerText}>
            Hafta {week.weekNumber} — {week.title}
          </Text>
        </View>
      </Page>

      {/* Sayfa 2+: Eser Listesi */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Eser Kataloğu ({artworks.length} eser)</Text>

        {artworks.map((art, i) => (
          <View key={art.id} style={styles.artworkRow} wrap={false}>
            <Text style={styles.artworkNumber}>{i + 1}</Text>
            <View style={styles.artworkInfo}>
              <Text style={styles.artworkTitle}>{art.titleTr}</Text>
              <Text style={styles.artworkMeta}>
                {art.artist} • {art.year} • {art.movement}
              </Text>
              <Text style={styles.artworkDesc}>{art.description}</Text>
              {art.funFact && (
                <Text style={[styles.artworkDesc, { color: C.accent }]}>
                  {art.funFact}
                </Text>
              )}
            </View>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>klemensart.com</Text>
          <Text style={styles.footerText}>
            Hafta {week.weekNumber} — Eser Kataloğu
          </Text>
        </View>
      </Page>
    </Document>
  );
}
