"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { useState, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import QuoteButton from "./QuoteButton";

const NUM_PARTICLES = 250; // Halved from 500 — still visually dense

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

function PrivacyShield({ epsilon }: { epsilon: number }) {
  const shieldOpacity = Math.max(0.05, 1 - epsilon / 10);

  return (
    <mesh>
      <sphereGeometry args={[2.8, 24, 16]} />
      <meshBasicMaterial
        color="#8B4DFF"
        transparent
        opacity={shieldOpacity * 0.25}
        wireframe
      />
    </mesh>
  );
}

function DataParticles({ epsilon }: { epsilon: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particleGeometry = useMemo(() => new THREE.SphereGeometry(0.035, 4, 4), []);
  const particleMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1EA1F2", emissive: "#1EA1F2", emissiveIntensity: 2 }),
    [],
  );
  
  const basePositions = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    for(let i=0; i<NUM_PARTICLES; i++) {
      const radius = 2.2 * Math.cbrt(pseudoRandom(i + 17));
      const theta = 2 * Math.PI * pseudoRandom(i + 53);
      const phi = Math.acos(2 * pseudoRandom(i + 97) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      pos.push(new THREE.Vector3(x, y, z));
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // High epsilon = less noise. Low epsilon = High noise
    const noiseIntensity = Math.max(0, 1 - epsilon / 10) * 1.5;

    for (let i = 0; i < NUM_PARTICLES; i++) {
       const bp = basePositions[i];
       
       const time = state.clock.elapsedTime;
       // Smooth per-particle noise rather than completely random jitter
       const jitterX = Math.sin(time * 2 + i) * noiseIntensity;
       const jitterY = Math.cos(time * 3 + i) * noiseIntensity;
       const jitterZ = Math.sin(time * 2.5 + i) * noiseIntensity;

       dummy.position.set(bp.x + jitterX, bp.y + jitterY, bp.z + jitterZ);
       
       // Change scale based on noise to simulate distortion
       const s = 1 + Math.sin(time * 5 + i) * noiseIntensity * 0.5;
       dummy.scale.set(s,s,s);

       dummy.updateMatrix();
       meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <instancedMesh ref={meshRef} args={[particleGeometry, particleMaterial, NUM_PARTICLES]} />
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const motionVal = useMotionValue(value);
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 15 });
  const [display, setDisplay] = useState(value.toFixed(1));

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return springVal.onChange((latest) => {
      setDisplay(latest.toFixed(1));
    });
  }, [springVal]);

  return <>{display}{suffix}</>;
}

export default function PrivacyAndTradeoff() {
  const [epsilon, setEpsilon] = useState(5.0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneInView = useInView(sceneRef, { margin: "18% 0px", amount: 0.15 });

  const accuracy = Math.min(98, 60 + (epsilon / 10) * 38);
  const privacyScore = Math.min(100, 100 - (epsilon / 10) * 85);

  return (
    <section id="privacy" className="relative w-full py-24 md:py-32 flex flex-col items-center bg-transparent border-t border-white/5">
      {/* Right-Hand Floating Quote */}
      <QuoteButton 
        className="absolute top-10 right-10 lg:top-20 lg:right-20 z-50"
        quotes={[
          "Federated learning addresses these issues by aggregating model weights centrally rather than sharing raw data. However, model updates can still leak patient information through inversion or reconstruction attacks (Zhou et al., 2025). Incorporating differential privacy (DP), typically by injecting noise into gradients, can limit the risk of individual re-identification and enhance legal and practical assurances (Liu et al., 2023). Nevertheless, excessive privacy noise can degrade model performance, particularly if implemented without careful calibration."
        ]}
      />
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center px-6 sm:px-8 relative z-10">
        
        <div className="flex flex-col z-10 space-y-10">
          <div>
            <div className="text-secondary tracking-[0.2em] text-xs font-semibold uppercase font-mono mb-4 text-glow-secondary">
              Differential Privacy
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter mb-6 text-white leading-tight">
              PRIVACY vs <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-foreground/50">UTILITY</span>
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed max-w-md font-light">
              We mathematically guarantee privacy by injecting controlled statistical noise into the model updates. Discover the critical balance between patient protection and diagnostic accuracy.
            </p>
          </div>

          <div className="glass-panel p-10 rounded-[2rem] flex flex-col space-y-10 relative overflow-hidden">
             
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-white tracking-wide uppercase text-sm">Privacy Parameter (&epsilon;)</span>
                <span className="font-mono text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-lg text-lg text-glow-primary">
                  {epsilon.toFixed(1)}
                </span>
              </div>
              
              <div className="relative h-2 rounded-full bg-white/5">
                <div 
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#8B4DFF] to-[#1EA1F2] transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(30,161,242,0.5)]"
                  style={{ width: `${(epsilon / 10) * 100}%` }}
                />
                <input 
                  type="range" 
                  min="0.1" 
                  max="10.0" 
                  step="0.1" 
                  value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {/* Thumb visual */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none transition-all duration-100 ease-linear flex items-center justify-center border-4 border-background"
                  style={{ left: `calc(${(epsilon / 10) * 100}% - 12px)` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-foreground/40 mt-4 font-mono uppercase tracking-widest">
                <span>Maximum Noise</span>
                <span>Maximum Accuracy</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
               {/* Accuracy Panel */}
              <div className="bg-[#030305]/50 border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-accent/20 group-hover:bg-accent/50 transition-colors" />
                <span className="text-xs text-foreground/50 uppercase tracking-widest mb-3 font-semibold">Diagnosis AUC</span>
                <span className="text-4xl font-light text-white font-mono tracking-tight">
                   <AnimatedCounter value={accuracy} suffix="%" />
                </span>
                <span className="text-xs text-accent mt-2 tracking-wide font-mono">Performance Metric</span>
              </div>
              
               {/* Privacy Panel */}
              <div className="bg-[#030305]/50 border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-secondary/20 group-hover:bg-secondary/50 transition-colors" />
                <span className="text-xs text-foreground/50 uppercase tracking-widest mb-3 font-semibold">Defense Bound</span>
                <span className="text-4xl font-light text-white font-mono tracking-tight">
                   <AnimatedCounter value={privacyScore} suffix="%" />
                </span>
                <span className="text-xs text-secondary mt-2 tracking-wide font-mono">Re-identification Risk</span>
              </div>
            </div>

          </div>
        </div>

        <div ref={sceneRef} className="h-[400px] sm:h-[500px] md:h-[650px] w-full relative rounded-[2.5rem] overflow-hidden glass-panel border-white/5 shadow-2xl">
          {sceneInView && (
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
              <color attach="background" args={["#030305"]} />
              <ambientLight intensity={0.2} />
              <pointLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
              <pointLight position={[-5, -5, -5]} intensity={1} color="#8B4DFF" />
              
              <DataParticles epsilon={epsilon} />
              <PrivacyShield epsilon={epsilon} />
              
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
              <EffectComposer multisampling={0}>
                  <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.8} intensity={1.5} mipmapBlur />
              </EffectComposer>
              <Preload all />
            </Canvas>
          )}
          <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#030305] to-transparent opacity-80" />
        </div>
      </div>
    </section>
  );
}
