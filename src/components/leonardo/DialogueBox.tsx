"use client";

import { motion } from "framer-motion";

const T = {
  bgCard: "#252220",
  bgWarm: "#2a2420",
  text: "#f0ebe4",
  textSec: "#d4cfc8",
  muted: "#9B918A",
  accent: "#C9A84C",
  leonardo: "#D4A854",
  correct: "#22c55e",
  wrong: "#ef4444",
  border: "#3a302a",
};

interface DialogueBoxProps {
  displayedText: string;
  isTyping: boolean;
  /** Cevap sonrası gösterim modu */
  variant?: "default" | "correct" | "wrong";
  /** Tıklandığında tetiklenir */
  onClick?: () => void;
  /** "Devam etmek için dokun" mesajını göster */
  showContinue?: boolean;
}

export default function DialogueBox({
  displayedText,
  isTyping,
  variant = "default",
  onClick,
  showContinue = false,
}: DialogueBoxProps) {
  const borderColor =
    variant === "correct" ? T.correct : variant === "wrong" ? T.wrong : T.leonardo;
  const bgColor =
    variant === "correct"
      ? "rgba(34,197,94,0.12)"
      : variant === "wrong"
        ? "rgba(239,68,68,0.12)"
        : `linear-gradient(135deg, ${T.bgCard}, ${T.bgWarm})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      onClick={onClick}
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: "16px 20px",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        minHeight: 60,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {variant === "default" && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 12,
            fontSize: 28,
            color: `${T.accent}22`,
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          &ldquo;
        </div>
      )}
      <p
        style={{
          margin: 0,
          fontSize: 15,
          lineHeight: 1.7,
          color: variant === "default" ? T.text : T.textSec,
          whiteSpace: "pre-wrap",
          paddingTop: variant === "default" ? 8 : 0,
        }}
      >
        {displayedText}
        {isTyping && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 16,
              marginLeft: 2,
              background: T.leonardo,
              animation: "quillWrite 0.6s infinite",
              verticalAlign: "text-bottom",
            }}
          />
        )}
      </p>
      {showContinue && !isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: "right", marginTop: 8, fontSize: 12, color: T.muted }}
        >
          Devam etmek için dokun →
        </motion.div>
      )}
    </motion.div>
  );
}
