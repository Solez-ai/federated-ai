"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { useState, useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useInView } from "framer-motion";
import QuoteButton from "./QuoteButton";

function ModelCore({ step }: { step: number }) {
  const innerRef = useRef<THREE.Mesh>(null!);
  const outerRef = useRef<THREE.Mesh>(null!);
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const nodePosition = useMemo(() => new THREE.Vector3(2.5, 0, 0), []);

  useFrame((state, delta) => {
    if (!innerRef.current || !outerRef.current) return;
    
    innerRef.current.rotation.x += delta * 0.5;
    innerRef.current.rotation.y += delta * 0.8;
    outerRef.current.rotation.x -= delta * 0.3;
    outerRef.current.rotation.y -= delta * 0.5;

    if (step === 0) targetPos.set(0, 0, 0); 
    else if (step === 1) targetPos.copy(nodePosition);
    else targetPos.set(0, 0, 0); 

    const lerpSpeed = step === 1 ? 0.05 : 0.02; // Slower return
    innerRef.current.position.lerp(targetPos, lerpSpeed);
    outerRef.current.position.lerp(targetPos, lerpSpeed);

    const innerMat = innerRef.current.material as THREE.MeshStandardMaterial;
    // Pre-allocated colors — avoid per-frame GC pressure
    if (step === 1) {
       innerMat.emissive.set(0x00E676);
    } else {
       innerMat.emissive.set(0x1EA1F2);
    }
  });

  return (
    <group>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color="#1EA1F2" 
          emissive="#1EA1F2" 
          wireframe={true} 
          emissiveIntensity={4} 
        />
      </mesh>
      {/* Glass-look without expensive transmission pass */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial
          color="#1EA1F2"
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>
    </group>
  );
}

function LocalNode({ step }: { step: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    if (step === 1) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.15;
      meshRef.current.scale.set(scale, scale, scale);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 3;
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[2.5, 0, 0]}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#030305" emissive="#8B4DFF" emissiveIntensity={0.5} roughness={0.1} metalness={0.8} />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.8, 0.8, 0.8)]} />
        <lineBasicMaterial color="#8B4DFF" linewidth={2} />
      </lineSegments>
    </mesh>
  );
}

export default function FederatedLearning() {
  const [step, setStep] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneInView = useInView(sceneRef, { margin: "18% 0px", amount: 0.15 });

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const stepsText = [
    { title: "Model Sent", detail: "Global model distributed to edges." },
    { title: "Local Training", detail: "Learning on sensitive local data." },
    { title: "Model Returns", detail: "Anonymous updates sent back." }
  ];

  return (
    <section id="federated" className="relative w-full py-24 md:py-32 flex flex-col items-center bg-transparent border-t border-white/5">
      {/* Right-Hand Floating Quote */}
      <QuoteButton 
        className="absolute top-10 right-10 lg:top-20 lg:right-20 z-50"
        quotes={[
          "This proposal aims to design and rigorously evaluate a comprehensive pipeline that integrates federated, differentially private deep learning with local personalization across diverse medical institutions. The central objective is to determine whether it is possible to improve diagnostic accuracy using global data while ensuring mathematical privacy guarantees for each patient and institution."
        ]}
      />
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center px-6 sm:px-8 relative z-10">
        
        <div className="flex flex-col z-10 space-y-10">
          <div>
            <div className="text-secondary tracking-[0.2em] text-xs font-semibold uppercase font-mono mb-4 text-glow-secondary">
              Core Mechanism
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-white leading-tight">
              FEDERATED<br/>LEARNING
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed max-w-md font-light">
              Hospitals cannot share raw medical data due to privacy regulations. Instead, they share AI. Only mathematical model updates are transferred.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl flex flex-col space-y-6 relative overflow-hidden">
            {/* Active glow background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />

            {stepsText.map((s, idx) => (
              <div key={idx} className={`relative flex items-center space-x-6 p-4 rounded-xl border transition-all duration-500 overflow-hidden ${step === idx ? 'bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(30,161,242,0.15)]' : 'border-transparent opacity-40'}`}>
                {/* Active indicator bar */}
                {step === idx && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_#1EA1F2]" />}
                
                <div className={`w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full font-bold font-mono text-sm transition-colors duration-500 ${step === idx ? 'bg-primary text-background' : 'bg-white/5 text-white'}`}>
                  0{idx + 1}
                </div>
                <div>
                  <div className={`font-bold text-lg tracking-wide ${step === idx ? 'text-white text-glow-primary' : 'text-white'}`}>{s.title}</div>
                  <div className="text-sm text-foreground/50 mt-1">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-fit glass-panel px-10 py-4 rounded-full text-white font-semibold tracking-wider text-sm uppercase transition-all duration-500 hover:border-primary/50 hover:box-glow-primary flex items-center gap-3"
          >
            {isPlaying ? (
              <><span className="w-2 h-2 bg-danger rounded-full animate-pulse" /> Pause Simulation</>
            ) : (
              <><span className="w-2 h-2 bg-primary rounded-full animate-pulse" /> Start Simulation</>
            )}
          </button>
        </div>

        <div ref={sceneRef} className="h-[400px] sm:h-[500px] md:h-[600px] w-full relative rounded-[2.5rem] overflow-hidden glass-panel border-white/5 shadow-2xl">
          {sceneInView && (
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
              <color attach="background" args={["#030305"]} />
              <ambientLight intensity={0.2} />
              <pointLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
              
              <ModelCore step={step} />
              <LocalNode step={step} />
              
              <group position={[0, -0.5, 0]}>
                  <mesh position={[0, 0, 0]}>
                     <cylinderGeometry args={[0.5, 0.6, 0.1, 32]} />
                     <meshStandardMaterial color="#030305" emissive="#1EA1F2" emissiveIntensity={0.5} wireframe />
                  </mesh>
              </group>
              
              <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isPlaying} autoRotateSpeed={0.5} maxPolarAngle={Math.PI/1.5} minPolarAngle={Math.PI/4} />
              <EffectComposer multisampling={0}>
                  <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.8} intensity={1.2} mipmapBlur />
              </EffectComposer>
              <Preload all />
            </Canvas>
          )}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#030305_150%)]" />
        </div>
      </div>
    </section>
  );
}
