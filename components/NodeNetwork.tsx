"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const NUM_NODES = 9;
const SPHERE_RADIUS = 3.2;

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

function generateFibonacciSphere(n: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = phi * i;
    pts.push(new THREE.Vector3(Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius));
  }
  return pts;
}

// ─── Single gyroscopic node with 3 orbiting rings ──────────────────────────
function HospitalNode({ position, index }: { position: THREE.Vector3; index: number }) {
  const coreRef  = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ring1    = useRef<THREE.Mesh>(null);
  const ring2    = useRef<THREE.Mesh>(null);
  const ring3    = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const speed = 0.4 + index * 0.05;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (shellRef.current) {
      shellRef.current.rotation.x += delta * speed * 0.4;
      shellRef.current.rotation.y += delta * speed * 0.6;
      const breathe = 1 + Math.sin(t * 1.5 + index) * 0.04;
      const target = hovered ? 1.35 : breathe;
      shellRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    }
    if (coreRef.current) {
      coreRef.current.rotation.x -= delta * speed * 0.9;
      coreRef.current.rotation.y += delta * speed * 1.1;
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      const targetEmissive = hovered ? new THREE.Color("#00E676") : new THREE.Color("#1EA1F2");
      mat.emissive.lerp(targetEmissive, 0.08);
    }
    // Three independent gyroscope rings with orthogonal axes
    if (ring1.current) { ring1.current.rotation.z += delta * speed * 1.2; }
    if (ring2.current) { ring2.current.rotation.x += delta * speed * 0.8; }
    if (ring3.current) { ring3.current.rotation.y += delta * speed * 1.5; }
  });

  return (
    <group position={position}>
      {/* Wireframe outer shell */}
      <mesh
        ref={shellRef}
        onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      >
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color={hovered ? "#00E676" : "#1EA1F2"} transparent opacity={0.2} wireframe />
      </mesh>

      {/* Solid inner core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color="#1EA1F2" emissive="#1EA1F2" emissiveIntensity={3} />
      </mesh>

      {/* Ring 1 — equatorial */}
      <mesh ref={ring1}>
        <torusGeometry args={[0.4, 0.008, 8, 64]} />
        <meshBasicMaterial color={hovered ? "#00E676" : "#1EA1F2"} transparent opacity={hovered ? 0.9 : 0.5} />
      </mesh>

      {/* Ring 2 — tilted 60° */}
      <mesh ref={ring2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.42, 0.005, 8, 64]} />
        <meshBasicMaterial color="#8B4DFF" transparent opacity={hovered ? 0.7 : 0.3} />
      </mesh>

      {/* Ring 3 — polar */}
      <mesh ref={ring3} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[0.44, 0.004, 8, 64]} />
        <meshBasicMaterial color={hovered ? "#00E676" : "#4EC9FF"} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// ─── All edges in ONE draw call via LineSegments ────────────────────────────
function NetworkLines({ points }: { points: THREE.Vector3[] }) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const verts: THREE.Vector3[] = [];
    for (let i = 0; i < points.length; i++) {
      const sorted = points
        .map((p, idx) => ({ p, d: points[i].distanceTo(p), idx }))
        .filter(n => n.idx !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      sorted.forEach(n => verts.push(points[i], n.p));
    }
    return new THREE.BufferGeometry().setFromPoints(verts);
  }, [points]);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = 0.22 + Math.abs(Math.sin(performance.now() * 0.0004)) * 0.1;
    }
  });

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial ref={matRef} color="#1EA1F2" transparent opacity={0.25} />
    </lineSegments>
  );
}

// ─── Lightweight particle halo ──────────────────────────────────────────────
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 180;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (pseudoRandom(i + 1) - 0.5) * 14;
      arr[i * 3 + 1] = (pseudoRandom(i + 101) - 0.5) * 14;
      arr[i * 3 + 2] = (pseudoRandom(i + 1001) - 0.5) * 14;
    }
    return arr;
  }, []);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.04; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#1EA1F2" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

function Scene() {
  const nodes    = useMemo(() => generateFibonacciSphere(NUM_NODES, SPHERE_RADIUS), []);
  const groupRef = useRef<THREE.Group>(null);
  useFrame(state => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.07;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.035) * 0.12;
    }
  });
  return (
    <>
      <FloatingParticles />
      <group ref={groupRef}>
        <NetworkLines points={nodes} />
        {nodes.map((pos, i) => <HospitalNode key={i} position={pos} index={i} />)}
      </group>
    </>
  );
}

export default function NodeNetworkCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "15% 0px 15% 0px", amount: 0.15 });

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full pointer-events-auto">
      {isInView && (
        <Canvas camera={{ position: [0, 0, 9], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
          <color attach="background" args={["#030305"]} />
          <ambientLight intensity={0.6} />
          <pointLight position={[8, 8, 8]} intensity={2} color="#ffffff" />
          <pointLight position={[-8, -8, -8]} intensity={1} color="#8B4DFF" />
          <Scene />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.25} maxPolarAngle={Math.PI / 1.4} minPolarAngle={Math.PI / 4} />
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.8} intensity={1.4} mipmapBlur />
          </EffectComposer>
          <Preload all />
        </Canvas>
      )}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_center,transparent_30%,#030305_100%)]" />
    </div>
  );
}
