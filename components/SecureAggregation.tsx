"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Lock, Unlock, Database, Share2, Activity } from "lucide-react";
import QuoteButton from "./QuoteButton";

export default function SecureAggregation() {
  const [isSecure, setIsSecure] = useState(true);

  return (
    <section id="aggregation" className="relative w-full py-24 md:py-32 flex flex-col items-center bg-transparent border-t border-white/5 overflow-hidden z-0">
      {/* Right-Hand Floating Quote */}
      <QuoteButton 
        className="absolute top-10 right-10 lg:top-20 lg:right-20 z-50"
        quotes={[
          "Federated learning addresses these issues by aggregating model weights centrally rather than sharing raw data.",
          "Techniques like secure aggregation (e.g., group verifiable secret sharing) have recently emerged to ensure servers cannot maliciously reconstruct patient data, while maintaining fault tolerance and practical overhead for real-world resource constraints (Zhou et al., 2025).",
          "FL with Secure Aggregation: Utilizing group verifiable secret-sharing schemes (GVSA) as in Zhou et al. (2025) or SMPC protocols for cryptographic protection of model updates."
        ]}
      />
      {/* Background depth elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_70%_50%,rgba(139,77,255,0.05)_0%,transparent_60%)]" />

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-8 relative z-10">
        
        <div className="text-center max-w-3xl mb-16 relative z-10 flex flex-col items-center">
            <div className="text-secondary tracking-[0.2em] text-xs font-semibold uppercase font-mono mb-4 text-glow-secondary">
              Cryptographic Obfuscation
            </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-white leading-tight">
             SECURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary text-glow-secondary">AGGREGATION</span>
          </h2>
          <p className="text-foreground/60 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
            Even sharing raw weights poses reconstruction risks. Secure aggregation completely obfuscates model updates through mathematical fragmentation, preventing the server from inspecting individual hospital contributions.
          </p>
        </div>

        {/* High-end Apple-style toggle */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-16 sm:mb-20 relative z-10 glass-panel px-6 py-5 sm:px-10 sm:py-5 rounded-[2rem] shadow-2xl border-white/5 backdrop-blur-[40px] text-center w-full max-w-[90%] sm:max-w-none">
          <span className={`text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors duration-300 font-mono ${!isSecure ? 'text-danger' : 'text-foreground/40'}`}>
             Raw Weights<br className="sm:hidden" /> (Vulnerable)
          </span>
          
          <button 
            onClick={() => setIsSecure(!isSecure)}
            className="flex items-center w-24 h-12 rounded-full p-1 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative shadow-inner overflow-hidden border border-white/10"
            style={{ backgroundColor: isSecure ? 'rgba(139, 77, 255, 0.2)' : 'rgba(255, 51, 102, 0.2)' }}
          >
             {/* Toggle inner track shadow */}
             <div className="absolute inset-0 opacity-50 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,transparent_100%)] pointer-events-none" />
             
             <motion.div 
               layout
               initial={false}
               animate={{ x: isSecure ? 48 : 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className={`w-10 h-10 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center border border-white/20`}
               style={{ backgroundColor: isSecure ? '#8B4DFF' : '#FF3366' }}
             >
                <div className="w-2 h-2 rounded-full bg-white opacity-90 shadow-[0_0_10px_white]" />
             </motion.div>
          </button>
          
          <span className={`text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors duration-300 font-mono ${isSecure ? 'text-secondary' : 'text-foreground/40'}`}>
             Cryptographic<br className="sm:hidden" /> Aggregation
          </span>
        </div>

        {/* Complex Visualization Canvas Area */}
        <div className="w-full max-w-5xl h-[350px] sm:h-[400px] relative glass-panel rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex items-center justify-between border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-[#030305]/60 overflow-hidden">
          
          {/* Grid background inside canvas */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Source Hospital Node */}
          <div className="flex flex-col items-center space-y-4 z-20 w-24 sm:w-48 relative shrink-0">
            <div className={`relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] flex items-center justify-center transition-all duration-500 backdrop-blur-md ${isSecure ? 'bg-secondary/10 border border-secondary/30 shadow-[0_0_30px_rgba(139,77,255,0.2)]' : 'bg-danger/10 border border-danger/30 shadow-[0_0_30px_rgba(255,51,102,0.2)]'}`}>
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl sm:rounded-[2rem] pointer-events-none" />
               <Activity className={`w-6 h-6 sm:w-10 sm:h-10 ${isSecure ? 'text-secondary' : 'text-danger'} animate-pulse`} />
            </div>
            <div className="glass-panel px-3 py-1 sm:px-4 sm:py-2 rounded-full border border-white/5 shadow-lg text-center">
                <span className="text-[9px] sm:text-xs font-bold text-white uppercase tracking-widest sm:tracking-wider font-mono">Edge<br className="sm:hidden"/> Node A</span>
            </div>
          </div>

          {/* Transfer Animation Pipeline */}
          <div className="flex-1 relative h-full flex items-center justify-center z-10">
            {/* Base optical fiber glow */}
            <div className={`absolute inset-0 w-full h-1 bg-gradient-to-r ${isSecure ? 'from-secondary/10 via-secondary/50 to-primary/10' : 'from-danger/10 via-danger/50 to-danger/10'} top-1/2 -translate-y-1/2 blur-md`} />
            <div className="absolute inset-0 w-full h-[1px] bg-white/10 top-1/2 -translate-y-1/2" />
            
            <AnimatePresence mode="wait">
              {isSecure ? (
                <motion.div 
                  key="secure" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-full h-full flex items-center justify-around overflow-hidden"
                >
                  {/* Encrypted Shards */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -200, opacity: 0, scale: 0.5, rotate: 0 }}
                      animate={{ x: [ -200, 600 ], opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 180] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3 + Math.random(), 
                        delay: i * 0.4,
                        ease: "linear"
                      }}
                      className="absolute left-0 w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border border-secondary/50 bg-secondary/20 shadow-[0_0_15px_rgba(139,77,255,0.5)] backdrop-blur-xl"
                      style={{ 
                         top: `calc(50% + ${(i % 2 === 0 ? 1 : -1) * (15 + Math.random() * 40)}px)`,
                         clipPath: i % 2 === 0 ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" : "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                      }}
                    >
                       <Lock className="w-3 h-3 text-white" />
                    </motion.div>
                  ))}
                  
                  {/* Cryptographic interference overlay */}
                  <div className="absolute w-[200px] h-32 bg-[url('https://upload.wikimedia.org/wikipedia/commons/2/2f/Data_matrix_code.svg')] opacity-10 blur-[1px] top-1/2 -translate-y-1/2 mix-blend-screen" />
                </motion.div>
              ) : (
                <motion.div
                  key="vulnerable"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-full h-full flex items-center overflow-hidden"
                >
                  {/* Vulnerable Data Payload */}
                  <motion.div
                    initial={{ x: -200, opacity: 0 }}
                    animate={{ x: [ -200, 600 ], opacity: [0, 1, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2.5,
                      ease: "linear"
                    }}
                    className="absolute left-0 w-24 h-16 top-1/2 -mt-8 rounded-xl border-2 border-danger bg-danger/10 flex items-center justify-center backdrop-blur-xl shadow-[0_0_40px_rgba(255,51,102,0.6)]"
                  >
                     <Unlock className="w-6 h-6 text-danger mr-2" />
                     <Database className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  {/* Hacker Scanning Line */}
                  <motion.div 
                     animate={{ x: [ -100, 500 ] }}
                     transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                     className="absolute top-[30%] lg:top-[20%] bottom-[30%] lg:bottom-[20%] w-[2px] bg-danger shadow-[0_0_10px_#FF3366] left-0 z-20"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Central Server Aggregator */}
          <div className="flex flex-col items-center space-y-4 z-20 w-24 sm:w-48 relative shrink-0">
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_50px_rgba(30,161,242,0.1)] backdrop-blur-md overflow-hidden">
               {/* Orbital ring */}
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                 className="absolute inset-1 sm:inset-2 border border-dashed border-primary/40 rounded-full"
               />
               <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(30,161,242,0.6)]">
                 <Share2 className="w-4 h-4 sm:w-6 sm:h-6 text-primary glow-text" />
               </div>
            </div>
            <div className="glass-panel px-3 py-1 sm:px-4 sm:py-2 rounded-full border border-white/5 shadow-lg text-center">
                <span className="text-[9px] sm:text-xs font-bold text-white uppercase tracking-widest sm:tracking-wider font-mono">Central<br className="sm:hidden"/> Server</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
