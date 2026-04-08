"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { motion, useInView } from "framer-motion";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import QuoteButton from "./QuoteButton";

const GRID_SIZE = 3;
const SPACING = 3.0;
const NUM_NODES = GRID_SIZE * GRID_SIZE;

const PERSONAL_COLORS_HEX = [
  "#8B4DFF", "#00E676", "#FF3366", "#f9c74f",
  "#90be6d", "#f8961e", "#1EA1F2", "#4EC9FF", "#f3722c",
];
const PERSONAL_COLORS       = PERSONAL_COLORS_HEX.map(h => new THREE.Color(h));
const BASE_COLOR             = new THREE.Color("#1EA1F2");

// Grid positions computed once
const GRID_POSITIONS: THREE.Vector3[] = [];
for (let i = -1; i <= 1; i++) {
  for (let j = -1; j <= 1; j++) {
    GRID_POSITIONS.push(new THREE.Vector3(i * SPACING, j * SPACING, 0));
  }
}

// Edge geometry joining grid nodes
function GridEdges() {
  const edgeGeo = useMemo(() => {
    const verts: THREE.Vector3[] = [];
    const edges: [number, number][] = [
      [0,1],[1,2],[3,4],[4,5],[6,7],[7,8],  // rows
      [0,3],[3,6],[1,4],[4,7],[2,5],[5,8],  // cols
      [0,4],[4,8],[2,4],[4,6],               // diagonals through center
    ];
    edges.forEach(([a, b]) => verts.push(GRID_POSITIONS[a], GRID_POSITIONS[b]));
    return new THREE.BufferGeometry().setFromPoints(verts);
  }, []);
  const mat = useMemo(
    () => new THREE.LineBasicMaterial({ color: "#1EA1F2", transparent: true, opacity: 0.12 }),
    []
  );
  return <lineSegments geometry={edgeGeo} material={mat} />;
}

// Instanced node renderer — each node is an icosahedron shell + inner tetra
function PersonalizationGrid({ isPersonalized }: { isPersonalized: boolean }) {
  const shellRef = useRef<THREE.InstancedMesh>(null);
  const coreRef  = useRef<THREE.InstancedMesh>(null);
  const ring1Ref = useRef<THREE.InstancedMesh>(null);
  const ring2Ref = useRef<THREE.InstancedMesh>(null);
  const dummy    = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Geometries
  const shellGeo = useMemo(() => new THREE.IcosahedronGeometry(0.6, 1), []);
  const coreGeo  = useMemo(() => new THREE.TetrahedronGeometry(0.28, 0), []);
  const ring1Geo = useMemo(() => new THREE.TorusGeometry(0.7, 0.008, 6, 48), []);
  const ring2Geo = useMemo(() => new THREE.TorusGeometry(0.72, 0.005, 6, 48), []);

  // Materials
  const shellMat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: "#1EA1F2", wireframe: true, transparent: true, opacity: 0.18 }), []);
  const coreMat  = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: "#1EA1F2", emissive: "#1EA1F2", emissiveIntensity: 4 }), []);
  const ring1Mat = useMemo(() =>
    new THREE.MeshBasicMaterial({ color: "#1EA1F2", transparent: true, opacity: 0.5 }), []);
  const ring2Mat = useMemo(() =>
    new THREE.MeshBasicMaterial({ color: "#8B4DFF", transparent: true, opacity: 0.3 }), []);

  useFrame((state) => {
    if (!shellRef.current || !coreRef.current || !ring1Ref.current || !ring2Ref.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < NUM_NODES; i++) {
      const p = GRID_POSITIONS[i];
      const breathe = 1 + Math.sin(t * 1.4 + i * 1.1) * (isPersonalized ? 0.14 : 0.03);
      const col = isPersonalized ? PERSONAL_COLORS[i % PERSONAL_COLORS.length] : BASE_COLOR;

      // Shell — slow rotation
      dummy.position.copy(p);
      dummy.rotation.set(t * 0.15 * (i % 2 === 0 ? 1 : -1), t * 0.25, 0);
      dummy.scale.setScalar(breathe);
      dummy.updateMatrix();
      shellRef.current.setMatrixAt(i, dummy.matrix);
      tempColor.copy(col).multiplyScalar(0.6);
      shellRef.current.setColorAt(i, tempColor);

      // Core — fast counter-rotation
      dummy.rotation.set(-t * 0.8, t * 1.1, 0);
      dummy.scale.setScalar(breathe);
      dummy.updateMatrix();
      coreRef.current.setMatrixAt(i, dummy.matrix);
      coreRef.current.setColorAt(i, col);

      // Ring 1 — equatorial spin
      dummy.rotation.set(0, t * (0.8 + i * 0.05), 0);
      dummy.scale.setScalar(breathe);
      dummy.updateMatrix();
      ring1Ref.current.setMatrixAt(i, dummy.matrix);
      ring1Ref.current.setColorAt(i, col);

      // Ring 2 — tilted 75° and slower
      dummy.rotation.set(Math.PI * 0.42, t * (0.5 + i * 0.04), 0);
      dummy.scale.setScalar(breathe);
      dummy.updateMatrix();
      ring2Ref.current.setMatrixAt(i, dummy.matrix);
    }

    shellRef.current.instanceMatrix.needsUpdate = true;
    coreRef.current.instanceMatrix.needsUpdate  = true;
    ring1Ref.current.instanceMatrix.needsUpdate = true;
    ring2Ref.current.instanceMatrix.needsUpdate = true;
    if (shellRef.current.instanceColor) shellRef.current.instanceColor.needsUpdate = true;
    if (coreRef.current.instanceColor)  coreRef.current.instanceColor.needsUpdate  = true;
    if (ring1Ref.current.instanceColor) ring1Ref.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <GridEdges />
      <instancedMesh ref={shellRef} args={[shellGeo, shellMat, NUM_NODES]} />
      <instancedMesh ref={coreRef}  args={[coreGeo,  coreMat, NUM_NODES]} />
      <instancedMesh ref={ring1Ref} args={[ring1Geo, ring1Mat, NUM_NODES]} />
      <instancedMesh ref={ring2Ref} args={[ring2Geo, ring2Mat, NUM_NODES]} />
    </>
  );
}

export default function Personalization() {
  const [isPersonalized, setIsPersonalized] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneInView = useInView(sceneRef, { margin: "18% 0px", amount: 0.15 });

  return (
    <section id="personalization" className="relative w-full py-32 flex flex-col items-center bg-transparent border-t border-white/5 mx-auto max-w-7xl px-8">
      {/* Right-Hand Floating Quote */}
      <QuoteButton 
        className="absolute top-10 right-10 lg:top-20 lg:right-20 z-50"
        quotes={[
          "Additionally, site-specific data distributions, such as variations in scanners or local demographics, further challenge model accuracy and necessitate algorithms that support both personalization and privacy protection.",
          "Another direction in research focuses on personalization — letting each hospital adjust the shared model to better fit its own patients. Elhussein & Gürsoy (2023) explored this using local fine-tuning and adapter layers. Newer ideas group similar sites or patients together using secure methods, but these often require more communication and computing power."
        ]}
      />
      <div className="text-center max-w-3xl mb-16 relative z-10 flex flex-col items-center">
        <div className="text-[#00E676] tracking-[0.2em] text-xs font-semibold uppercase font-mono mb-4 text-glow-accent">
          Demographic Adaptivity
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6 text-white leading-tight">
          MORPHING <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary text-glow-accent">
            PERSONALIZATION
          </span>
        </h2>
        <p className="text-foreground/60 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
          Every hospital has distinct scanning protocols and patient demographics. Federated learning models
          adapt to local distributions through topological morphing, maximizing diagnostic accuracy uniquely
          tailored to each site.
        </p>
      </div>

      {/* Apple-style toggle */}
      <div className="flex justify-center items-center space-x-6 mb-16 relative z-10 glass-panel px-10 py-5 rounded-[2rem] shadow-2xl border-white/5 cursor-target">
        <span className={`text-xs font-bold tracking-widest uppercase transition-colors duration-300 font-mono ${!isPersonalized ? "text-primary" : "text-foreground/40"}`}>
          Global Baseline
        </span>
        <button
          onClick={() => setIsPersonalized(!isPersonalized)}
          className="flex items-center w-24 h-12 rounded-full p-1 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative shadow-inner overflow-hidden border border-white/10 cursor-target"
          style={{ backgroundColor: isPersonalized ? "rgba(139,77,255,0.2)" : "rgba(30,161,242,0.1)" }}
        >
          <div className="absolute inset-0 opacity-50 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,transparent_100%)] pointer-events-none" />
          <motion.div
            layout initial={false}
            animate={{ x: isPersonalized ? 48 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-10 h-10 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center border border-white/20"
            style={{ backgroundColor: isPersonalized ? "#8B4DFF" : "#1EA1F2" }}
          >
            <div className="w-2 h-2 rounded-full bg-white opacity-80" />
          </motion.div>
        </button>
        <span className={`text-xs font-bold tracking-widest uppercase transition-colors duration-300 font-mono ${isPersonalized ? "text-secondary" : "text-foreground/40"}`}>
          Personalized Tuning
        </span>
      </div>

      {/* 3D Visualizer */}
      <div ref={sceneRef} className="h-[600px] w-full max-w-5xl relative rounded-[2.5rem] overflow-hidden glass-panel border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] pointer-events-none">
        {sceneInView && (
          <Canvas camera={{ position: [0, 0, 11], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
            <color attach="background" args={["#030305"]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
            <pointLight position={[-8, -8, 8]} intensity={1} color="#8B4DFF" />

            <group rotation={[0.2, 0.3, 0]}>
              <PersonalizationGrid isPersonalized={isPersonalized} />
            </group>

            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
            <EffectComposer multisampling={0}>
              <Bloom luminanceThreshold={1.1} luminanceSmoothing={0.8} intensity={1.6} mipmapBlur />
            </EffectComposer>
            <Preload all />
          </Canvas>
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#030305] to-transparent" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,#030305_110%)] opacity-70" />
      </div>
    </section>
  );
}
