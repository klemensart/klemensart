"use client";

import { useEffect, useState } from "react";

const B = { coral: "#FF6D60", warm: "#8C857E" };

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

export default function CountdownTimer({ targetDate }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!mounted || !targetDate || !timeLeft) return null;

  const units = [
    { label: "gün", v: timeLeft.days },
    { label: "saat", v: timeLeft.hours },
    { label: "dakika", v: timeLeft.minutes },
    { label: "saniye", v: timeLeft.seconds },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
      {units.map(({ label, v }, i) => (
        <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <div style={{ textAlign: "center", minWidth: 48 }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: B.coral,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
            >
              {String(v).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#a09890",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
          {i < units.length - 1 && (
            <span style={{ color: "#a09890", fontSize: 22, fontWeight: 300, lineHeight: 1, marginTop: 2 }}>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
