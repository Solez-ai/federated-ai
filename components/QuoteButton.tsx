"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Quote, X, FileText } from "lucide-react";
import { playSound, preloadSounds } from "react-sounds";

export default function QuoteButton({ quotes, className = "" }: { quotes: string[], className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(buttonRef, { margin: "160px 0px", amount: 0.1 });

  const particleConfig = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 6;
        const distance = 42 + (index % 3) * 9;
        return {
          key: index,
          startX: Math.cos(angle) * distance,
          startY: Math.sin(angle) * distance,
          duration: 1.6 + index * 0.12,
          delay: index * 0.18,
        };
      }),
    [],
  );

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setMounted(true));
    preloadSounds(["/sounds/opne.mp3", "/sounds/Close.mp3", "/sounds/click.mp3"]);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const openPopup = () => {
    setIsOpen(true);
    playSound("/sounds/opne.mp3", { volume: 0.7 });
  };

  const closePopup = () => {
    setIsOpen(false);
    playSound("/sounds/Close.mp3", { volume: 0.6 });
  };

  return (
    <div ref={buttonRef} className={className}>
      <motion.button
        onClick={openPopup}
        onMouseEnter={() => playSound("/sounds/click.mp3", { volume: 0.1, rate: 2 })}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center border border-white/10 text-white/70 hover:text-primary transition-colors cursor-target shadow-[0_0_30px_rgba(30,161,242,0.15)] z-20 group relative"
      >
        {mounted && isInView && particleConfig.map((particle) => (
          <motion.div
            key={particle.key}
            initial={{ x: particle.startX, y: particle.startY, opacity: 0, scale: 0 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0, 1.15, 0] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "circIn",
            }}
            className="absolute top-1/2 left-1/2 h-[3px] w-[3px] -ml-[1.5px] -mt-[1.5px] rounded-full bg-primary shadow-[0_0_8px_#1EA1F2] pointer-events-none"
          />
        ))}

        {/* Pulsing alert indicator */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full animate-ping opacity-75" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border border-[#030305]" />
        
        {/* Main Icon */}
        <Quote className="w-7 h-7 group-hover:scale-110 transition-transform relative z-10 drop-shadow-[0_0_10px_rgba(30,161,242,0.4)]" />
      </motion.button>

      {mounted ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 pointer-events-auto cursor-target bg-black/60 backdrop-blur-sm"
              onClick={closePopup}
            >
              <motion.div
                initial={{ y: 50, scale: 0.95, opacity: 0, rotateX: 10 }}
                animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ y: 20, scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#FDFDFD] rounded-sm shadow-2xl flex flex-col"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(0,0,0,0.05)'
                }}
              >
                {/* PDF Header */}
                <div className="sticky top-0 bg-[#FDFDFD]/90 backdrop-blur-md border-b border-black/10 px-8 py-4 flex items-center justify-between z-10 shrink-0">
                  <div className="flex items-center gap-3 text-black/60">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-mono font-bold tracking-widest uppercase">Research_Excerpt.pdf</span>
                  </div>
                  <button
                    onClick={closePopup}
                    className="p-2 rounded-full hover:bg-black/5 text-black/60 hover:text-black transition-colors cursor-target"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* PDF Body */}
                <div className="p-8 sm:p-12 text-black/80 font-serif leading-relaxed text-lg sm:text-xl selection:bg-primary/20">
                  <div className="mb-10 p-5 pl-6 border-l-4 border-primary bg-primary/5 rounded-r">
                    <p className="text-[11px] font-sans tracking-widest uppercase text-black/50 mb-2 font-bold">Source Context</p>
                    <p className="text-sm font-sans text-black/70 leading-relaxed">
                      This exact text is derived directly from the original research paper.{" "}
                      <a 
                        href="https://iarco.org/storage/2025/junior/Junior_Samin_Yeasar.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-bold cursor-target inline-flex items-center gap-1"
                      >
                        Read full paper 
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </a>
                    </p>
                  </div>

                  <div className="space-y-6">
                    {quotes.map((q, i) => (
                      <p key={i} className="text-justify indent-8 tracking-tight">
                        &quot;{q}&quot;
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      ) : null}
    </div>
  );
}
