"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { Database, Network, Cpu, Lock, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TextScramble from "./TextScramble";
import QuoteButton from "./QuoteButton";

function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 20 });
  const [display, setDisplay] = useState("0.0");

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return springVal.onChange((latest) => setDisplay(latest.toFixed(1)));
  }, [springVal]);

  return <>{display}</>;
}

export default function MethodologyAndResults() {
  const pipelineSteps = [
    { icon: <Database />, title: "Dataset", desc: "Heterogeneous multi-center radiology scans." },
    { icon: <Network />, title: "Network", desc: "Advanced 3D ResNet architectures." },
    { icon: <Cpu />, title: "Compute", desc: "Compute executed purely on edge constraints." },
    { icon: <Lock />, title: "Encryption", desc: "Multi-party secure summation protocols." },
    { icon: <Activity />, title: "Validation", desc: "Rigorous algorithmic fairness metrics." },
  ];

  return (
    <section id="methodology" className="relative w-full py-32 bg-transparent border-t border-white/5 z-0">
      {/* Right-Hand Floating Quote */}
      <QuoteButton 
        className="absolute top-10 right-10 lg:top-20 lg:right-20 z-50"
        quotes={[
          "Unlike much of the literature, which addresses these in isolation, this work will empirically evaluate the achievable privacy–utility boundary with practical, scalable open-source methods and public datasets, under clinically relevant settings."
        ]}
      />

      {/* Subtle dot-grid background */}
      <div className="absolute inset-0 z-[-1]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.3 }} />

      <div className="w-full max-w-7xl mx-auto px-8 flex flex-col space-y-40 relative z-10">

        {/* ── Methodology Pipeline ─────────────────────────── */}
        <div className="flex flex-col items-center">
          <div className="text-center max-w-3xl mb-24 flex flex-col items-center">
            <div className="h-6 w-[1px] bg-gradient-to-b from-white to-transparent mb-6" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-white leading-tight">
              ARCHITECTURE &<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">METHODOLOGY</span>
            </h2>
            <p className="text-foreground/50 text-xl font-light leading-relaxed">
              A comprehensive end-to-end framework integrating robust deep learning with strict cryptographic and topological constraints.
            </p>
          </div>

          <div className="w-full relative flex flex-wrap lg:flex-nowrap justify-between items-start gap-6">
            {/* Animated SVG connecting line */}
            <div className="hidden lg:block absolute top-[60px] left-12 right-12 h-1 z-0">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <motion.path
                  d="M 0 2 L 10000 2"
                  stroke="rgba(30,161,242,0.2)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="8 8"
                />
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  viewport={{ once: true }}
                  d="M 0 2 L 10000 2"
                  stroke="url(#glowGradient)"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
                <defs>
                  <linearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1EA1F2" stopOpacity="0" />
                    <stop offset="50%" stopColor="#1EA1F2" stopOpacity="1" />
                    <stop offset="100%" stopColor="#8B4DFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {pipelineSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative z-10 flex flex-col items-center group w-full lg:w-56 text-center cursor-target"
              >
                <div className="w-32 h-32 rounded-3xl bg-[#030305] border border-white/5 flex items-center justify-center mb-6 relative overflow-hidden glass-panel group-hover:border-primary/40 transition-colors duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <motion.div
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    className="w-16 h-16 rounded-2xl bg-[#0a0f18] shadow-inner border border-white/10 text-white flex items-center justify-center relative z-10 group-hover:text-primary transition-colors"
                  >
                    {step.icon}
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{step.title}</h3>
                <p className="text-sm text-foreground/50 leading-relaxed font-light">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── EMPIRICAL RESULTS ───────────────────────────── */}
        <div className="flex flex-col items-center w-full">
          <div className="text-center max-w-3xl mb-24 flex flex-col items-center">
            <div className="h-6 w-[1px] bg-gradient-to-b from-white to-transparent mb-6" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-white leading-tight flex flex-wrap gap-x-4">
              <TextScramble text="EMPIRICAL" /> 
              <br /> 
              <TextScramble text="RESULTS" className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary pl-2" />
            </h2>
            <p className="text-foreground/50 text-xl font-light leading-relaxed">
              Federated models approach centralized upper bounds while strictly preserving mathematical privacy.
            </p>
          </div>

          {/* Card grid */}
          <div className="relative w-full max-w-6xl">
            {/* Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Isolated Local */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-panel p-10 rounded-[2.5rem] border-white/5 flex flex-col relative overflow-hidden cursor-target"
              >
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Isolated Local</h3>
                <p className="text-foreground/40 text-sm mb-12 font-mono">Control / Siloed</p>
                <div className="mt-auto space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-sm uppercase tracking-widest text-foreground/50 font-bold">Accuracy</span>
                    <span className="text-4xl font-light font-mono text-white tracking-tighter">72.4%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <div className="w-[72%] h-full bg-foreground/20" />
                  </div>
                  <div className="px-3 py-1 bg-white/5 w-max rounded-md border border-white/5">
                    <span className="text-[10px] text-foreground/60 uppercase tracking-widest">Poor Generalization</span>
                  </div>
                </div>
              </motion.div>

              {/* DP-Federated — hero card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-panel p-10 rounded-[2.5rem] border-primary/30 relative overflow-hidden flex flex-col shadow-[0_30px_60px_rgba(30,161,242,0.15)] bg-[#030305]/80 transform md:-translate-y-8 cursor-target"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-black text-glow-primary text-white tracking-tight">DP-Federated</h3>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <p className="text-primary/60 text-sm mb-12 font-mono">Proposed Architecture</p>
                <div className="mt-auto space-y-6 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-sm uppercase tracking-widest text-primary font-bold">Accuracy</span>
                    <span className="text-5xl font-light font-mono text-white tracking-tighter">
                      <AnimatedNumber value={86.2} />%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#030305] rounded-full overflow-hidden border border-primary/20 shadow-inner p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "86.2%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative"
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/50 blur-[5px]" />
                    </motion.div>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 w-max rounded-md border border-primary/30">
                    <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Optimal Trade-off Found</span>
                  </div>
                </div>
              </motion.div>

              {/* Centralized */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-panel p-10 rounded-[2.5rem] border-white/5 flex flex-col relative overflow-hidden cursor-target"
              >
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Centralized</h3>
                <p className="text-foreground/40 text-sm mb-12 font-mono">Upper Bound / Not Legal</p>
                <div className="mt-auto space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-sm uppercase tracking-widest text-foreground/50 font-bold">Accuracy</span>
                    <span className="text-4xl font-light font-mono text-white tracking-tighter">89.5%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <div className="w-[89.5%] h-full bg-foreground/30" />
                  </div>
                  <div className="px-3 py-1 bg-danger/10 w-max rounded-md border border-danger/30">
                    <span className="text-[10px] text-danger uppercase tracking-widest">High Compliance Risk</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
