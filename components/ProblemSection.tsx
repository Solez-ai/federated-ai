"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Fingerprint } from "lucide-react";
import TextScramble from "./TextScramble";
import QuoteButton from "./QuoteButton";

export default function ProblemSection() {
  return (
    <section id="problem" className="relative w-full py-24 md:py-40 flex items-center bg-transparent border-t border-white/5 z-0">
      
      {/* Right-Hand Floating Quote */}
      <QuoteButton 
        className="absolute top-10 right-10 lg:top-20 lg:right-20 z-50"
        quotes={[
          "However, over 30% of healthcare organizations experienced data breaches last year, and regulations such as the General Data Protection Regulation (GDPR) and the Health Insurance Portability and Accountability Act (HIPAA) prohibit sharing raw medical data across hospital boundaries (Yahiaoui et al., 2024). Sharing data across hospitals is important for making AI models fair and reliable, but privacy laws and technical limits make this kind of collaboration very difficult today. The prevailing approach remains siloed: each hospital trains local models with limited generalizability or negotiates complex legal agreements for centralized research studies."
        ]}
      />

      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-danger rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center px-6 sm:px-8 relative z-10">
        
        {/* Left: Text Content */}
        <div className="flex flex-col z-10 space-y-10">
          <div>
            <div className="px-4 py-2 border border-danger/30 bg-danger/5 rounded-full w-max mb-6 flex items-center gap-3 shadow-[0_0_20px_rgba(255,51,102,0.2)]">
              <ShieldAlert className="w-4 h-4 text-danger" /> 
              <span className="text-danger tracking-widest text-[10px] uppercase font-bold font-mono">The Fundamental Flaw</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 sm:mb-8 text-white leading-tight flex flex-wrap gap-x-3 sm:gap-x-4">
              <TextScramble text="DATA" />
              <TextScramble text="SILOS" className="text-danger glow-text" />
              <TextScramble text="&" />
              <TextScramble text="BREACHES" />
            </h2>
            <div className="space-y-6 text-foreground/60 text-lg leading-relaxed max-w-lg font-light">
              <p>
                Hospitals cannot share raw medical datasets due to restrictive privacy laws. 
              </p>
              <p>
                Consequently, AI models suffer from profound generalization failures—trained blindly in homogeneous isolated silos.
              </p>
            </div>
          </div>
          
          <motion.div 
             whileHover={{ scale: 1.02 }}
             className="relative glass-panel rounded-3xl p-8 border border-white/5 overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
             <div className="absolute inset-0 bg-danger/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out" />
             <div className="relative z-10 flex gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                   <Fingerprint className="w-8 h-8 text-danger" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">30% Exfiltration</h4>
                  <p className="text-danger font-medium text-sm leading-relaxed">
                    Over a third of healthcare institutions suffer patient data reconstruction and ransomware breaches annually.
                  </p>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Right: High-end Cyber Breach SVG Animation */}
        <div className="h-[350px] sm:h-[450px] md:h-[500px] w-full relative flex items-center justify-center group/node perspective-[1000px]">
           <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] scale-75 sm:scale-100 rotate-x-12 rotate-y-[-10deg] transform-style-3d group-hover/node:rotate-x-0 group-hover/node:rotate-y-0 transition-transform duration-1000 ease-out">
             
             {/* Base grid platform */}
             <div className="absolute inset-0 border border-white/5 rounded-full opacity-30 transform rotate-x-[60deg] shadow-[0_0_100px_rgba(255,51,102,0.1)]" style={{ background: 'radial-gradient(circle, transparent 20%, rgba(255,255,255,0.02) 100%)'}} />
             
             {/* Central Hacker Core */}
             <div className="absolute inset-0 m-auto w-40 h-40 rounded-full border border-danger/40 flex items-center justify-center bg-[#030305] z-10 shadow-[0_0_50px_rgba(255,51,102,0.4)] backdrop-blur-3xl overflow-hidden">
                <div className="absolute inset-0 bg-danger/20 blur-[10px] saturate-200 pointer-events-none" />
                <Fingerprint className="w-16 h-16 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,33,102,1)]" />
             </div>
             
             {/* Aggressive Error Pulses */}
             <motion.div 
               animate={{ scale: [1, 2], opacity: [0.8, 0] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
               className="absolute inset-0 m-auto w-40 h-40 rounded-full border-2 border-danger shadow-[0_0_30px_rgba(255,51,102,0.5)]"
             />
             <motion.div 
               animate={{ scale: [1, 3.5], opacity: [0.3, 0] }}
               transition={{ repeat: Infinity, duration: 2, delay: 0.7, ease: "easeOut" }}
               className="absolute inset-0 m-auto w-40 h-40 rounded-full border border-danger/50"
             />

             {/* Red Cyber Leaks */}
             <div className="absolute top-0 left-1/2 w-0.5 h-32 bg-gradient-to-t from-danger to-transparent opacity-60 -translate-x-1/2 -translate-y-full blur-[2px]" />
             <div className="absolute bottom-0 left-1/2 w-0.5 h-32 bg-gradient-to-b from-danger to-transparent opacity-60 -translate-x-1/2 translate-y-full blur-[2px]" />
             <div className="absolute left-0 top-1/2 h-0.5 w-32 bg-gradient-to-l from-danger to-transparent opacity-60 -translate-y-1/2 -translate-x-full blur-[2px]" />
             <div className="absolute right-0 top-1/2 h-0.5 w-32 bg-gradient-to-r from-danger to-transparent opacity-60 -translate-y-1/2 translate-x-full blur-[2px]" />
             
             {/* Floating Warning Hexagons */}
             {[0,1,2].map((i) => (
               <motion.div
                 key={i}
                 animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                 transition={{ repeat: Infinity, duration: 3, delay: i }}
                 className="absolute left-1/2 top-1/2 w-12 h-12 border border-danger/40 bg-danger/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(255,51,102,0.3)]"
                 style={{ 
                   transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateY(-120px)`,
                   clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                 }}
               >
                 <ShieldAlert className="w-4 h-4 text-white" />
               </motion.div>
             ))}

             {/* Tooltip on hover */}
             <div className="absolute top-[80%] left-1/2 -translate-x-1/2 whitespace-nowrap px-6 py-2 glass-panel rounded-full text-xs text-danger uppercase font-mono tracking-widest opacity-0 group-hover/node:opacity-100 transition-opacity duration-500 shadow-[0_0_30px_rgba(255,51,102,0.3)] border border-danger/30">
               Catastrophic Breach Detected
             </div>
           </div>
        </div>

      </div>
    </section>
  );
}
