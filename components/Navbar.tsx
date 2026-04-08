"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import GlassSurface from "./GlassSurface";
import { playSound } from "react-sounds";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Home",        href: "#hero" },
  { name: "AI",          href: "#ai" },
  { name: "Silos",       href: "#problem" },
  { name: "Framework",   href: "#federated" },
  { name: "Privacy",     href: "#privacy" },
  { name: "Morphing",    href: "#personalization" },
  { name: "Aggregation", href: "#aggregation" },
  { name: "Empirical",   href: "#methodology" },
  { name: "Impact",      href: "#impact" },
];

function scrollTo(href: string) {
  if (href === "#hero") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const { scrollY } = useScroll();
  const [activeSegment, setActiveSegment] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const probe = latest + window.innerHeight * 0.35;
    let nextIndex = 0;

    navItems.forEach((item, index) => {
      const section = document.querySelector(item.href);
      if (!section) {
        return;
      }

      const top = (section as HTMLElement).offsetTop;
      if (probe >= top) {
        nextIndex = index;
      }
    });

    setActiveSegment(nextIndex);
  });

  const handleNav = (href: string) => {
    playSound("/sounds/click.mp3", { volume: 0.8, rate: 0.8 });
    const wasOpen = menuOpen;
    setMenuOpen(false);
    setTimeout(() => scrollTo(href), wasOpen ? 320 : 0);
  };

  return (
    <>
      {/* ─── Desktop Pill Nav ─────────────────────────────────── */}
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-8 left-0 right-0 z-50 justify-center pointer-events-none hidden lg:flex"
      >
        <div className="pointer-events-auto cursor-target">
          <GlassSurface
            width="auto"
            height={56}
            borderRadius={28}
            brightness={20}
            opacity={0.8}
            blur={16}
            backgroundOpacity={0.05}
            saturation={1.2}
            className="px-2 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <nav className="flex items-center gap-1.5 px-2 relative h-full">
              {navItems.map((item, i) => (
                <button
                  key={item.name}
                  onMouseEnter={() => playSound("/sounds/click.mp3", { volume: 0.2, rate: 1.5 })}
                  onClick={() => handleNav(item.href)}
                  className="relative px-4 py-2 text-sm font-medium transition-colors cursor-target"
                >
                  <span className={`relative z-10 transition-colors duration-300 font-mono tracking-widest uppercase text-xs ${activeSegment === i ? "text-white" : "text-white/40 hover:text-white/80"}`}>
                    {item.name}
                  </span>
                  {activeSegment === i && (
                    <motion.div
                      layoutId="navBlob"
                      className="absolute inset-0 bg-white/10 rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </GlassSurface>
        </div>
      </motion.div>

      {/* ─── Mobile Hamburger Button ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-5 right-5 z-[60] lg:hidden"
      >
        <button
          onClick={() => {
            setMenuOpen(o => !o);
            playSound("/sounds/click.mp3", { volume: 0.5, rate: 1.2 });
          }}
          aria-label="Toggle navigation"
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <AnimatePresence mode="wait">
            {menuOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <X className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Menu className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* ─── Mobile Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Scrim */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[55] lg:hidden"
              style={{ background: "rgba(3,3,5,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Side panel */}
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed top-0 right-0 bottom-0 w-[75vw] max-w-[300px] z-[58] lg:hidden flex flex-col"
              style={{
                background: "linear-gradient(160deg, rgba(12,12,24,0.97) 0%, rgba(3,3,5,0.99) 100%)",
                borderLeft: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
              }}
            >
              {/* Panel header */}
              <div className="px-6 pt-20 pb-6 border-b border-white/[0.05]">
                <p className="text-[9px] font-mono tracking-[0.35em] uppercase text-primary/70 mb-1">Navigation</p>
                <p className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "var(--font-orbitron)" }}>SECTIONS</p>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-4 py-5 flex-1 overflow-y-auto">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => handleNav(item.href)}
                    className="group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: activeSegment === i ? "rgba(30,161,242,0.08)" : "transparent",
                      border: `1px solid ${activeSegment === i ? "rgba(30,161,242,0.18)" : "transparent"}`,
                    }}
                  >
                    {activeSegment === i && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-full" />
                    )}
                    <span className="text-[10px] font-mono text-white/20 w-5 text-right shrink-0 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`font-mono tracking-widest uppercase text-sm font-semibold transition-colors duration-200 ${activeSegment === i ? "text-primary" : "text-white/45 group-active:text-white"}`}>
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </nav>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-white/[0.04]">
                <p className="text-white/[0.12] text-[9px] font-mono tracking-widest uppercase text-center">
                  Samin Yeasar · IARCO 2025 · #26
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
