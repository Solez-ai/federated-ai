"use client";

import { motion } from "framer-motion";
import { playSound } from "react-sounds";

function GeminiSparkle() {
  return (
    <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" aria-hidden="true">
      <path
        d="M32 6C34.3 19.8 44.2 29.7 58 32C44.2 34.3 34.3 44.2 32 58C29.7 44.2 19.8 34.3 6 32C19.8 29.7 29.7 19.8 32 6Z"
        fill="url(#spark-main)"
      />
      <path
        d="M50 10C50.7 14.3 53.7 17.3 58 18C53.7 18.7 50.7 21.7 50 26C49.3 21.7 46.3 18.7 42 18C46.3 17.3 49.3 14.3 50 10Z"
        fill="url(#spark-small)"
      />
      <defs>
        <linearGradient id="spark-main" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9AE8FF" />
          <stop offset="0.5" stopColor="#5AD2FF" />
          <stop offset="1" stopColor="#9B6BFF" />
        </linearGradient>
        <linearGradient id="spark-small" x1="42" y1="10" x2="58" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E1FBFF" />
          <stop offset="1" stopColor="#7D7BFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function FloatingAIButton() {
  const scrollToAI = () => {
    playSound("/sounds/click.mp3", { volume: 0.45, rate: 1.1 });
    const section = document.querySelector("#ai");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.button
      type="button"
      onClick={scrollToAI}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
      className="cursor-target fixed bottom-5 right-5 z-[70] flex h-16 w-16 items-center justify-center rounded-full border border-white/15 shadow-[0_0_40px_rgba(76,201,240,0.24)] lg:bottom-8 lg:right-8 lg:h-20 lg:w-20"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, rgba(154,232,255,0.35) 0%, rgba(76,201,240,0.18) 30%, rgba(14,18,34,0.95) 76%)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
      }}
      aria-label="Open AI research assistant"
    >
      <motion.span
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(76,201,240,0.34)",
            "0 0 0 12px rgba(76,201,240,0)",
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-0 rounded-full"
      />
      <div className="relative flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-3">
        <GeminiSparkle />
      </div>
    </motion.button>
  );
}
