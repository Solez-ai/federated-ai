"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Twitter, Instagram, Copy, Check, X, BookOpen } from "lucide-react";
import { createPortal } from "react-dom";
import { playSound } from "react-sounds";

function BlobCanvas({ img2Src }: { img2Src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const img2Ref = useRef<HTMLImageElement | null>(null);

  const targetMouse = useRef({ x: -9999, y: -9999 });
  const currentMouse = useRef({ x: -9999, y: -9999 });
  const isOverSection = useRef(false);

  const velocity = useRef({ x: 0, y: 0 });

  const blobsRef = useRef<
    { x: number; y: number; size: number; opacity: number; rot: number }[]
  >([]);

  const animFrameRef = useRef<number>(0);

  // ─── Load Image ───
  useEffect(() => {
    const img = new Image();
    img.src = img2Src;
    img.onload = () => (img2Ref.current = img);
  }, [img2Src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ctx;
    const cv = canvas;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const handleMouseEnter = () => { isOverSection.current = true; };
    const handleMouseLeave = () => {
      isOverSection.current = false;
      blobsRef.current = [];
    };
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mousemove", handleMouse, { passive: true });

    const getImageRect = (iw: number, ih: number, cw: number, ch: number) => {
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = 0;
      return { dx, dy, dw, dh };
    };

    let isVisible = false;

    function draw() {
      animFrameRef.current = 0;
      if (!isVisible) return;

      c.clearRect(0, 0, cv.width, cv.height);

      const img2 = img2Ref.current;

      if (!img2 || !isOverSection.current) {
        blobsRef.current = blobsRef.current
          .map(b => { b.opacity *= 0.85; return b; })
          .filter(b => b.opacity > 0.03);

        if (blobsRef.current.length > 0) {
          animFrameRef.current = requestAnimationFrame(draw);
        }
        return;
      }

      const ease = 0.10;
      currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * ease;
      currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * ease;

      velocity.current.x = (targetMouse.current.x - currentMouse.current.x) * 0.4;
      velocity.current.y = (targetMouse.current.y - currentMouse.current.y) * 0.4;

      const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
      const mx = currentMouse.current.x;
      const my = currentMouse.current.y;

      if (speed > 2) {
        blobsRef.current.push({
          x: mx,
          y: my,
          size: 65 + speed * 2.5,
          opacity: 0.55,
          rot: Math.random() * Math.PI,
        });
        if (blobsRef.current.length > 22) blobsRef.current.shift();
      }

      c.save();
      c.beginPath();
      const stretch = Math.min(speed * 0.7, 60);
      c.ellipse(mx, my, 130 + stretch, 108 - stretch * 0.4,
        Math.atan2(velocity.current.y, velocity.current.x), 0, Math.PI * 2);
      for (const blob of blobsRef.current) {
        c.ellipse(blob.x, blob.y, blob.size * 0.55, blob.size * 0.45, blob.rot, 0, Math.PI * 2);
        blob.opacity *= 0.92;
        blob.size *= 0.96;
      }
      blobsRef.current = blobsRef.current.filter(b => b.opacity > 0.04 && b.size > 4);

      c.fillStyle = "white";
      c.fill();
      c.clip();

      c.fillStyle = "#000000";
      c.fillRect(0, 0, cv.width, cv.height);
      const { dx, dy, dw, dh } = getImageRect(
        img2.naturalWidth, img2.naturalHeight, cv.width, cv.height
      );
      c.drawImage(img2, dx, dy, dw, dh);
      c.restore();

      animFrameRef.current = requestAnimationFrame(draw);
    }

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && animFrameRef.current === 0) {
          animFrameRef.current = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const handleMouseEnterWithRestart = () => {
      isOverSection.current = true;
      if (isVisible && animFrameRef.current === 0) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    canvas.removeEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseenter", handleMouseEnterWithRestart);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
      canvas.removeEventListener("mouseenter", handleMouseEnterWithRestart);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousemove", handleMouse);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 3, cursor: "none" }}
    />
  );
}

function MorphingBackText() {
  const [showDesigner, setShowDesigner] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowDesigner(p => !p);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      <div className="relative text-center" style={{ perspective: "800px" }}>
        <div
          className="font-black uppercase tracking-widest leading-none"
          style={{
            fontSize: "clamp(4rem, 12vw, 11rem)",
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(255,255,255,0.06)",
            textShadow: "0 0 80px rgba(30,161,242,0.06)",
            fontFamily: "var(--font-orbitron), monospace",
            transform: "rotateX(8deg) rotateY(-3deg)",
          }}
        >
          Author &
        </div>

        <div
          className="font-black uppercase tracking-widest leading-none relative overflow-hidden"
          style={{
            fontSize: "clamp(4rem, 12vw, 11rem)",
            fontFamily: "var(--font-orbitron), monospace",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={showDesigner ? "designer" : "developer"}
              initial={{ y: 40, opacity: 0, filter: "blur(8px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -40, opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="block"
              style={{
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(30,161,242,0.1)",
                textShadow: "0 0 80px rgba(30,161,242,0.08)",
                transform: "rotateX(8deg) rotateY(-3deg)",
              }}
            >
              {showDesigner ? "Designer" : "Developer"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function WaveLines({ mouseX }: { mouseX: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2, opacity: 0.12 }}
    >
      {[...Array(6)].map((_, i) => {
        const offset = (mouseX / (typeof window !== "undefined" ? window.innerWidth : 1)) * 20 - 10;
        const yBase = (i + 1) * (100 / 7);
        return (
          <motion.path
            key={i}
            d={`M 0 ${yBase}% Q 50% ${yBase - 3 + offset * 0.3}% 100% ${yBase}%`}
            stroke={i % 2 === 0 ? "#1EA1F2" : "#8B4DFF"}
            strokeWidth="0.5"
            fill="none"
            animate={{
              d: [
                `M 0 ${yBase}% Q 50% ${yBase - 4 + offset}% 100% ${yBase}%`,
                `M 0 ${yBase}% Q 30% ${yBase + 3 - offset * 0.5}% 100% ${yBase - 1}%`,
                `M 0 ${yBase}% Q 70% ${yBase - 2 + offset * 0.3}% 100% ${yBase}%`,
              ]
            }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </svg>
  );
}

type CitationFormat = "APA" | "MLA" | "Chicago" | "BibTeX";

function CitationModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<CitationFormat>("APA");
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const citations: Record<CitationFormat, string> = {
    APA: `Yeasar, S. (2025). Privacy-Preserving Federated & Differentially Private Deep Learning for Multi Center Medical Imaging. Birshreshtha Munshi Abdur Rouf Public College. https://privacy-ai-in-medicine.vercel.app`,
    MLA: `Yeasar, Samin. "Privacy-Preserving Federated & Differentially Private Deep Learning for Multi Center Medical Imaging." Birshreshtha Munshi Abdur Rouf Public College, 2025. https://privacy-ai-in-medicine.vercel.app. Accessed ${today}.`,
    Chicago: `Yeasar, Samin. 2025. "Privacy-Preserving Federated & Differentially Private Deep Learning for Multi Center Medical Imaging." Birshreshtha Munshi Abdur Rouf Public College. https://privacy-ai-in-medicine.vercel.app`,
    BibTeX: `@misc{yeasar2025privacy,\n  author = {Samin Yeasar},\n  title = {Privacy-Preserving Federated \\& Differentially Private Deep Learning for Multi Center Medical Imaging},\n  year = {2025},\n  url = {https://privacy-ai-in-medicine.vercel.app}\n}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citations[selected]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const formats: CitationFormat[] = ["APA", "MLA", "Chicago", "BibTeX"];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-8 pointer-events-auto"
      style={{ zIndex: 99999, background: "rgba(3,3,5,0.85)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(10,10,20,0.95) 0%, rgba(3,3,5,0.98) 100%)",
          boxShadow: "0 0 80px rgba(30,161,242,0.12), 0 30px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-white font-bold tracking-wider text-sm uppercase font-mono">Cite This Research</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors cursor-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex gap-2 px-8 pt-6 pb-2">
          {formats.map(f => (
            <button
              key={f}
              onClick={() => setSelected(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-all duration-300 cursor-target ${
                selected === f
                  ? "bg-primary text-background shadow-[0_0_20px_rgba(30,161,242,0.4)]"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Citation Display */}
        <div className="px-8 py-6">
          <div
            className="relative rounded-xl p-6 font-mono text-sm leading-relaxed text-white/80"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <div className="absolute top-3 right-3 flex items-center gap-1">
              <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">{selected}</span>
            </div>
            {citations[selected]}
          </div>
        </div>

        {/* Footer / Copy */}
        <div className="px-8 pb-7 flex items-center justify-between">
          <p className="text-white/30 text-xs font-mono">
            Generated · {today}
          </p>
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-sm font-bold font-mono tracking-wide transition-all cursor-target"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default function CreatorSection() {
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [mounted, setMounted] = useState(false);
  const [citationOpen, setCitationOpen] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const openCitation = () => {
    setCitationOpen(true);
    playSound("/sounds/opne.mp3", { volume: 0.7 });
  };

  const closeCitation = () => {
    setCitationOpen(false);
    playSound("/sounds/Close.mp3", { volume: 0.7 });
  };

  const socials = [
    { icon: <Github className="w-5 h-5" />, href: "https://github.com/solez-ai", label: "GitHub" },
    { icon: <Twitter className="w-5 h-5" />, href: "https://x.com/Solez_None", label: "X / Twitter" },
    { icon: <Instagram className="w-5 h-5" />, href: "https://www.instagram.com/solez.ai/", label: "Instagram" },
  ];

  return (
    <>
      <section
        id="creator"
        onMouseMove={handleMouseMove}
        className="relative w-full overflow-hidden"
        style={{ height: "100svh", minHeight: "100svh" }}
      >
        <div
          className="absolute inset-0"
          style={{ zIndex: 0 }}
        >
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(to right, rgba(3,3,5,0.65) 0%, rgba(3,3,5,0.1) 40%, rgba(3,3,5,0.1) 60%, rgba(3,3,5,0.65) 100%), linear-gradient(to bottom, rgba(3,3,5,0.4) 0%, rgba(3,3,5,0) 30%, rgba(3,3,5,0) 70%, rgba(3,3,5,0.9) 100%)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image1.png"
            alt="Samin Yeasar"
            className="absolute inset-0 w-full h-full object-cover object-top"
            draggable={false}
          />
        </div>

        <MorphingBackText />

        <WaveLines mouseX={mousePos.x} />

        {mounted && (
          <div className="absolute inset-0" style={{ zIndex: 3 }}>
            <BlobCanvas img2Src="/image2.png" />
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none p-6 pt-12 sm:p-10 lg:p-14 flex flex-col justify-between" style={{ zIndex: 10 }}>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <div
                className="text-white leading-[0.9] tracking-tight"
                style={{
                  fontFamily: "'Playfair Display', 'Georgia', serif",
                  fontSize: "clamp(2.5rem, 8vw, 5rem)",
                  fontWeight: 700,
                  textShadow: "0 2px 40px rgba(0,0,0,0.8)",
                }}
              >
                <div>Samin</div>
                <div>Yeasar</div>
              </div>
              <div className="mt-3 lg:mt-4 flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.25em] uppercase text-primary/90 font-bold">
                  Developer & Designer
                </span>
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white/40">
                  of this Website
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              className="flex flex-col lg:items-end gap-3 lg:gap-4 mt-2 lg:mt-0 lg:text-right"
            >
              <div className="flex flex-col lg:items-end gap-1">
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.25em] uppercase text-accent/90 font-bold">
                  Author of the Research
                </span>
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white/40">
                  Published at IARCO 2025
                </span>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                onClick={openCitation}
                onMouseEnter={() => playSound("/sounds/click.mp3", { volume: 0.1, rate: 2 })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl cursor-target w-max group"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <BookOpen className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-white/70 group-hover:text-white transition-colors">
                  Cite Paper
                </span>
              </motion.button>
            </motion.div>
          </div>

          <div className="flex flex-col-reverse lg:flex-row lg:items-end justify-between gap-6 w-full mt-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center gap-3"
            >
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-target pointer-events-auto"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                  }}
                  aria-label={s.label}
                  onMouseEnter={() => playSound("/sounds/click.mp3", { volume: 0.1, rate: 2 })}
                >
                  {s.icon}
                </motion.a>
              ))}
            </motion.div>

            <div className="lg:text-right">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white/20 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase"
              >
                Research · Design · Engineering
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-white/15 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase"
              >
                Samin Yeasar · IARCO 2025 · #26
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {mounted && (
        <AnimatePresence>
          {citationOpen && <CitationModal onClose={closeCitation} />}
        </AnimatePresence>
      )}
    </>
  );
}
