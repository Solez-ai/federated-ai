"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "react-sounds";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    let rafId = 0;
    let lastTick = 0;
    let lastAudio = 0;
    const startedAt = performance.now();
    const totalDuration = 1600;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));

      setProgress((current) => (current === nextProgress ? current : nextProgress));

      if (now - lastAudio > 180 && nextProgress < 100) {
        playSound("/sounds/click.mp3", { volume: 0.04, rate: 2.2 });
        lastAudio = now;
      }

      if (elapsed >= totalDuration) {
        setProgress(100);
        window.setTimeout(() => {
          setLoadingComplete(true);
          playSound("/sounds/intro-sound.mp3", { volume: 0.55 });
          window.setTimeout(() => setUnmounted(true), 900);
        }, 120);
        return;
      }

      if (now - lastTick > 16) {
        lastTick = now;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (unmounted) return null;

  return (
    <AnimatePresence>
      {!loadingComplete && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center font-mono pointer-events-none"
        >
          {/* Faint Grid Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(139,77,255,0.4)_0%,transparent_70%)]" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-primary tracking-[0.4em] text-xs uppercase text-glow-primary"
            >
              Decrypting Federated Secrets
            </motion.div>

            <div className="text-6xl md:text-8xl font-black text-white mix-blend-screen tabular-nums tracking-tighter">
              {progress.toString().padStart(3, "0")}
              <span className="text-primary/50 opacity-40">%</span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4 shadow-[0_0_20px_rgba(30,161,242,0.4)]">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "tween", ease: "linear", duration: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
