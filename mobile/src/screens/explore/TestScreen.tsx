/* ─── Quiz/Test Ekranı ─── */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../config/theme";
import { useXp } from "../../hooks/useXp";
import ProgressBar from "../../components/ui/ProgressBar";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

// Örnek test verisi (API'den gelecek)
const SAMPLE_TEST: Question[] = [
  {
    question: "Ankara Kalesi hangi dönemde inşa edilmiştir?",
    options: ["Romalılar", "Galatlar", "Selçuklular", "Osmanlılar"],
    correct: 1,
  },
  {
    question: "CerModern hangi binada yer alır?",
    options: ["Eski fabrika", "Eski tren garı atölyesi", "Eski askeri kışla", "Eski banka binası"],
    correct: 1,
  },
  {
    question: "Anadolu Medeniyetleri Müzesi hangi yapı kompleksinde yer alır?",
    options: ["At Pazarı", "Kurşunlu Han", "Suluhan", "Çengelhan"],
    correct: 0,
  },
];

export default function TestScreen({ navigation }: any) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const { earnXp } = useXp();

  const question = SAMPLE_TEST[currentQ];
  const progress = ((currentQ + (finished ? 1 : 0)) / SAMPLE_TEST.length) * 100;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === question.correct) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      if (currentQ < SAMPLE_TEST.length - 1) {
        setCurrentQ((c) => c + 1);
        setSelected(null);
      } else {
        setFinished(true);
        const passed = score + (idx === question.correct ? 1 : 0) >= Math.ceil(SAMPLE_TEST.length / 2);
        if (passed) earnXp("test_complete");
      }
    }, 1000);
  };

  if (finished) {
    const total = SAMPLE_TEST.length;
    const passed = score >= Math.ceil(total / 2);
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultIcon}>{passed ? "🎉" : "📚"}</Text>
          <Text style={styles.resultTitle}>
            {passed ? "Tebrikler!" : "Tekrar Dene"}
          </Text>
          <Text style={styles.resultScore}>
            {score}/{total} doğru
          </Text>
          {passed && <Text style={styles.resultXp}>+2 ⭐ kazandın!</Text>}
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setCurrentQ(0);
              setScore(0);
              setSelected(null);
              setFinished(false);
            }}
          >
            <Text style={styles.retryText}>Tekrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProgressBar progress={progress} />
      <Text style={styles.qNumber}>
        Soru {currentQ + 1}/{SAMPLE_TEST.length}
      </Text>
      <Text style={styles.qText}>{question.question}</Text>

      <View style={styles.options}>
        {question.options.map((opt, idx) => {
          let bg: string = COLORS.white;
          if (selected !== null) {
            if (idx === question.correct) bg = "#E8F5E9";
            else if (idx === selected) bg = "#FFEBEE";
          }
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.option, { backgroundColor: bg }]}
              onPress={() => handleSelect(idx)}
              disabled={selected !== null}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.xl, paddingTop: 60 },
  qNumber: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.warm,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  qText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "700",
    color: COLORS.dark,
    lineHeight: 30,
    marginBottom: SPACING.xxl,
  },
  options: { gap: SPACING.md },
  option: {
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: COLORS.light,
    ...SHADOWS.sm,
  },
  optionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    fontWeight: "500",
  },
  resultCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xxl,
  },
  resultIcon: { fontSize: 56, marginBottom: SPACING.lg },
  resultTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  resultScore: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.warm,
    marginBottom: SPACING.sm,
  },
  resultXp: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "700",
    color: COLORS.coral,
    marginBottom: SPACING.xxl,
  },
  retryBtn: {
    backgroundColor: COLORS.coral,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  retryText: {
    fontSize: FONTS.sizes.md,
    fontWeight: "700",
    color: "#fff",
  },
});
