"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import QuoteButton from "./QuoteButton";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";

const AISection = dynamic(() => import("./AISection"), {
  ssr: false,
  loading: () => <div className="min-h-[40vh] border-t border-white/5 bg-[#02040a]" />,
});

// ─── Helpers ───────────────────────────────────────────────
function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// Build a quadratic arc between two sphere-surface points
function buildArcPoints(a: THREE.Vector3, b: THREE.Vector3, segments = 48): THREE.Vector3[] {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const lift = mid.length() * 0.35;           // how high the arc peaks above the surface
  mid.setLength(mid.length() + lift);

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    // Quadratic bezier:  P = (1-t)^2*A + 2(1-t)t*mid + t^2*B
    pts.push(
      a.clone().multiplyScalar(mt * mt)
       .add(mid.clone().multiplyScalar(2 * mt * t))
       .add(b.clone().multiplyScalar(t * t))
    );
  }
  return pts;
}

// ─── Animated arc that travels along the path ───────────────
function AnimatedArc({ arcPoints, speed, color, delay }: {
  arcPoints: THREE.Vector3[];
  speed: number;
  color: string;
  delay: number;
}) {
  const totalPts = arcPoints.length;
  const lineRef = useRef<THREE.Line>(null);

  const dynamicGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints([arcPoints[0], arcPoints[1]]);
    return g;
  }, [arcPoints]);

  const mat = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }), [color]);
  const lineObj = useMemo(() => new THREE.Line(dynamicGeo, mat), [dynamicGeo, mat]);

  useFrame((state) => {
    if (!lineRef.current) {
      return;
    }

    const lineMaterial = lineRef.current.material as THREE.LineBasicMaterial;
    const lineGeometry = lineRef.current.geometry as THREE.BufferGeometry;
    const t = ((state.clock.elapsedTime * speed + delay) % 2.4);
    if (t > 1.2) {
      lineMaterial.opacity = 0;
      return;
    }
    lineMaterial.opacity = 0.85;
    const progress = t / 1.2;
    const endIdx   = Math.max(2, Math.floor(progress * totalPts));
    const startIdx = Math.max(0, endIdx - Math.floor(totalPts * 0.35));

    const pts = arcPoints.slice(startIdx, endIdx);
    if (pts.length < 2) return;
    lineGeometry.setFromPoints(pts);
    lineGeometry.attributes.position.needsUpdate = true;
  });

  return <primitive ref={lineRef} object={lineObj} />;
}

// ─── Wireframe Earth + animated flows ──────────────────────
const GLOBE_R = 2.4;

// Hospital/research city coords [lat, lon]
const SITES: [number, number][] = [
  [51.5,  -0.1 ],  // London
  [40.7,  -74.0],  // New York
  [35.7,  139.7],  // Tokyo
  [19.1,   72.9],  // Mumbai
  [-33.9,  18.4],  // Cape Town
  [48.9,    2.3],  // Paris
  [37.8, -122.4],  // San Francisco
  [-23.5,  -46.6], // São Paulo
];

const ARC_CONNECTIONS: [number, number][] = [
  [0,1],[1,6],[6,4],[4,2],[2,3],[3,5],[5,7],[7,0],[0,2],[1,3],[4,5],
];

const ARC_COLORS = [
  "#1EA1F2","#00E676","#8B4DFF","#1EA1F2","#4EC9FF",
  "#00E676","#f9c74f","#1EA1F2","#8B4DFF","#00E676","#FF3366",
];

function WireframeGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  // Lat/lon grid lines (thin, very low opacity)
  const gridGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const SEG = 64;

    // Latitudes
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let i = 0; i <= SEG; i++) {
        const lon1 = (i / SEG) * 360 - 180;
        const lon2 = ((i + 1) / SEG) * 360 - 180;
        pts.push(latLonToVec3(lat, lon1, GLOBE_R), latLonToVec3(lat, lon2, GLOBE_R));
      }
    }
    // Longitudes
    for (let lon = -180; lon < 180; lon += 30) {
      for (let i = 0; i < SEG; i++) {
        const lat1 = (i / SEG) * 180 - 90;
        const lat2 = ((i + 1) / SEG) * 180 - 90;
        pts.push(latLonToVec3(lat1, lon, GLOBE_R), latLonToVec3(lat2, lon, GLOBE_R));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const gridMat = useMemo(() =>
    new THREE.LineBasicMaterial({ color: "#1EA1F2", transparent: true, opacity: 0.12 }), []);

  // Site positions
  const sitePositions = useMemo(() =>
    SITES.map(([lat, lon]) => latLonToVec3(lat, lon, GLOBE_R)), []);

  // Static web connecting ALL sites to each other
  const staticWebGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < sitePositions.length; i++) {
      for (let j = i + 1; j < sitePositions.length; j++) {
        pts.push(sitePositions[i], sitePositions[j]);
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [sitePositions]);

  const staticWebMat = useMemo(() =>
    new THREE.LineBasicMaterial({ color: "#8B4DFF", transparent: true, opacity: 0.15 }), []);

  // Arc geometries for the flowing animation
  const arcGeometries = useMemo(() =>
    ARC_CONNECTIONS.map(([a, b]) => buildArcPoints(sitePositions[a], sitePositions[b], 60)), [sitePositions]);

  // Beacon instancing
  const beaconRef = useRef<THREE.InstancedMesh>(null);
  const dummy     = useMemo(() => new THREE.Object3D(), []);
  const beaconGeo = useMemo(() => new THREE.SphereGeometry(0.05, 6, 6), []);
  const beaconMat = useMemo(() =>
    new THREE.MeshStandardMaterial({ color: "#1EA1F2", emissive: "#1EA1F2", emissiveIntensity: 5 }), []);

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;

    if (beaconRef.current) {
      const t = state.clock.elapsedTime;
      sitePositions.forEach((pos, i) => {
        const pulse = 1 + Math.sin(t * 2.5 + i * 0.7) * 0.5;
        dummy.position.copy(pos);
        dummy.scale.setScalar(pulse);
        dummy.updateMatrix();
        beaconRef.current!.setMatrixAt(i, dummy.matrix);
      });
      beaconRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Grid lines */}
      <lineSegments geometry={gridGeo} material={gridMat} />

      {/* Static web of site-to-site connections */}
      <lineSegments geometry={staticWebGeo} material={staticWebMat} />

      {/* Animated arcs */}
      {arcGeometries.map((pts, i) => (
        <AnimatedArc
          key={i}
          arcPoints={pts}
          speed={0.5 + (i % 3) * 0.1}
          color={ARC_COLORS[i % ARC_COLORS.length]}
          delay={i * 0.45}
        />
      ))}

      {/* Site beacons */}
      <instancedMesh ref={beaconRef} args={[beaconGeo, beaconMat, SITES.length]} />
    </group>
  );
}



// ─── Animated Conclusion text ——————————————————————————————
const words = ["AI", "can", "learn", "from", "distributed", "data", "without", "exposing", "individuals."];

export default function ImpactAndConclusion() {
  const conclusionRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInView = useInView(globeRef, { margin: "18% 0px", amount: 0.15 });
  const inView = useInView(conclusionRef, { once: true, margin: "-100px" });

  return (
    <section id="impact" className="relative w-full bg-[#030305] flex flex-col overflow-hidden">
      {/* Right-Hand Floating Quote */}
      <QuoteButton 
        className="absolute top-10 right-10 lg:top-20 lg:right-20 z-50"
        quotes={[
          "The approach is timely: new regulatory pressures (EU AI Act, U.S. executive orders) demand ‘privacy-by-design’ and ‘explainable’ AI. Moreover, global pandemics, like COVID-19, have accentuated the urgency and necessity for trustworthy AI tools that respect patient autonomy.",
          "The goal is to show, with real experiments, that hospitals can build safer shared models without giving up performance or breaking privacy laws. If successful, this work could serve as a practical example for policymakers and engineers who want to use AI in healthcare responsibly."
        ]}
      />

      {/* ── GLOBAL IMPACT: Earth Globe ────────────────────── */}
      <div className="w-full py-32 border-t border-white/5 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="w-full max-w-7xl mx-auto px-8 flex flex-col items-center relative z-10">
          <div className="text-center max-w-3xl mb-20 flex flex-col items-center">
            <div className="text-primary tracking-[0.2em] text-xs font-semibold uppercase font-mono mb-4 text-glow-primary">
              The Scale of Research
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-white leading-tight">
              GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">(AIM) IMPACT</span>
            </h2>
            <p className="text-foreground/50 text-xl font-light leading-relaxed">
              Empowering borderless international collaboration across healthcare networks while maintaining mathematical guarantees of patient anonymity.
            </p>
          </div>

          {/* Earth 3D Canvas — transparent background */}
          <div ref={globeRef} className="w-full max-w-3xl h-[350px] sm:h-[450px] md:h-[520px] relative cursor-target">
            {globeInView && (
              <Canvas
                camera={{ position: [0, 0, 6.5], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: false, alpha: true }}
                onCreated={({ gl, scene }) => {
                  gl.setClearColor(0x000000, 0);
                  scene.background = null;
                }}
              >
                <ambientLight intensity={0.5} />
                <WireframeGlobe />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
                <Preload all />
              </Canvas>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 w-full max-w-2xl mt-4 sm:mt-8">
            {[
              { value: "180+", label: "Countries" },
              { value: "3.8B", label: "Patients Protected" },
              { value: "∞", label: "Privacy Guarantee" },
            ].map((stat, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border-white/5 text-center flex flex-col">
                <span className="font-black text-3xl text-white font-mono tracking-tight">{stat.value}</span>
                <span className="text-xs text-foreground/50 uppercase tracking-widest mt-2 font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AISection />

      {/* ── CONCLUSION ────────────────────────────────────── */}
      <div ref={conclusionRef} className="w-full py-24 md:py-40 border-t border-white/5 relative bg-[linear-gradient(180deg,#030305_0%,#010102_100%)] z-10 overflow-hidden">
        
        {/* Ambient scan lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px)" }} />
        
        {/* Radial glow behind text */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,rgba(30,161,242,0.08)_0%,transparent_70%)]" />

        <div className="w-full max-w-5xl mx-auto px-8 flex flex-col items-center text-center relative z-10">
          
          {/* Animated vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-[1px] h-24 bg-gradient-to-b from-transparent via-primary to-transparent origin-top mb-12"
          />

          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={inView ? { opacity: 1, letterSpacing: "0.3em" } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-black tracking-[0.3em] text-secondary uppercase mb-12 flex items-center gap-4 text-sm"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="block w-12 h-[1px] bg-secondary origin-left"
            />
            CONCLUSION
            <motion.span
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="block w-12 h-[1px] bg-secondary origin-right"
            />
          </motion.div>

          {/* Word-by-word animated quote */}
          <div className="text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.3] tracking-tight mb-8 text-white/90 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </div>

          {/* Highlighted continuation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.3] tracking-tight mb-20 flex flex-wrap justify-center gap-x-4 gap-y-2"
          >
            <span className="text-white/60">This work fundamentally shifts the boundary between</span>
            <span
              className="text-primary text-glow-primary font-bold"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              privacy
            </span>
            <span className="text-white/60">and</span>
            <span
              className="text-accent font-bold"
              style={{ fontFamily: "var(--font-orbitron)", textShadow: "0 0 20px rgba(0,230,118,0.7)" }}
            >
              utility.
            </span>
          </motion.div>

          {/* Credit bar */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.9 }}
            className="glass-panel px-6 py-5 sm:px-10 sm:py-6 rounded-[2rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs text-foreground/60 uppercase tracking-widest font-mono cursor-target"
          >
            <span className="font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>Samin Yeasar</span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_#1EA1F2]" />
            <span>Birshreshtha Munshi Abdur Rouf Public College</span>
            <span className="w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_10px_#8b4dff]" />
            <span className="text-white font-bold">IARCO 2025</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
