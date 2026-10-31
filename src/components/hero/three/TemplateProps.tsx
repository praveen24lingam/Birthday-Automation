"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard, Instance, Instances, Sparkles, Stars } from "@react-three/drei";
import type { Person, TemplateKey } from "@/lib/data/types";
import { Flame, PLATE_Y, T1 } from "./Cake3D";
import { crescent, polaroid, rng, softDot } from "./util";

const sway = (el: THREE.Object3D | null, t: number, amp: number, speed: number) => {
  if (!el) return;
  el.rotation.z = Math.sin(t * speed) * amp;
  el.rotation.x = Math.sin(t * speed * 0.7 + 1) * amp * 0.5;
};

/* ---------- shared: a wrapped gift ---------- */
function Gift({ position, size, color, ribbon, rot = 0 }: { position: [number, number, number]; size: number; color: string; ribbon: string; rot?: number }) {
  const s = size;
  return (
    <group position={position} rotation-y={rot}>
      <mesh castShadow receiveShadow position={[0, s / 2, 0]}><boxGeometry args={[s, s, s]} /><meshStandardMaterial color={color} roughness={0.45} /></mesh>
      <mesh position={[0, s / 2, 0]}><boxGeometry args={[s * 1.01, s * 1.01, s * 0.18]} /><meshStandardMaterial color={ribbon} roughness={0.3} metalness={0.3} /></mesh>
      <mesh position={[0, s / 2, 0]}><boxGeometry args={[s * 0.18, s * 1.01, s * 1.01]} /><meshStandardMaterial color={ribbon} roughness={0.3} metalness={0.3} /></mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} position={[d * s * 0.14, s + s * 0.1, 0]} rotation={[0, 0, d * 0.6]} scale={[1, 0.6, 1]}>
          <torusGeometry args={[s * 0.16, s * 0.05, 8, 20]} /><meshStandardMaterial color={ribbon} roughness={0.3} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- party: gifts and glitter (the 2D scenery already has bunting and streamers) ---------- */
function Party({ cols }: { cols: string[] }) {
  return (
    <>
      <Gift position={[-2.35, 0, 0.9]} size={0.55} color={cols[3]} ribbon={cols[0]} rot={0.4} />
      <Gift position={[2.4, 0, 1.0]} size={0.42} color={cols[2]} ribbon={cols[1]} rot={-0.3} />
      <Sparkles count={50} scale={[9, 4.5, 3]} position={[0, 2.6, -0.5]} size={5} speed={0.35} color={cols[0]} />
      <Sparkles count={30} scale={[9, 4.5, 3]} position={[0, 2.6, -0.5]} size={4} speed={0.25} color={cols[1]} />
    </>
  );
}

/* ---------- mehfil: hanging paper lanterns, marigold garland, clay diyas ---------- */
const lanternGeo = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(0.17 + Math.sin(Math.PI * t) * 0.17, (t - 0.5) * 0.62)); }
  return new THREE.LatheGeometry(pts, 24);
})();
function Lantern({ x, z, len, color, seed }: { x: number; z: number; len: number; color: string; seed: number }) {
  const g = useRef<THREE.Group>(null);
  const glow = useMemo(() => new THREE.Color(color).multiplyScalar(2.2), [color]);
  useFrame(({ clock }) => sway(g.current, clock.elapsedTime + seed * 2, 0.07, 0.8));
  return (
    <group ref={g} position={[x, 4.4, z]}>
      <mesh position={[0, -len / 2, 0]}><cylinderGeometry args={[0.008, 0.008, len, 4]} /><meshBasicMaterial color="#f3d9b8" /></mesh>
      <group position={[0, -len - 0.36, 0]}>
        <mesh position={[0, 0.34, 0]}><cylinderGeometry args={[0.12, 0.2, 0.08, 20]} /><meshStandardMaterial color="#d9a441" metalness={0.8} roughness={0.3} /></mesh>
        <mesh geometry={lanternGeo}><meshStandardMaterial color={color} emissive={glow} emissiveIntensity={1.4} toneMapped={false} transparent opacity={0.94} roughness={0.8} /></mesh>
        {[-0.18, 0, 0.18].map((y) => <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.17 + Math.cos((y / 0.31) * Math.PI / 2) * 0.17, 0.008, 6, 40]} /><meshStandardMaterial color="#d9a441" metalness={0.8} roughness={0.3} /></mesh>)}
        <mesh position={[0, -0.34, 0]}><cylinderGeometry args={[0.2, 0.12, 0.08, 20]} /><meshStandardMaterial color="#d9a441" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[0, -0.5, 0]}><coneGeometry args={[0.05, 0.24, 8]} /><meshStandardMaterial color="#c2185b" roughness={0.7} /></mesh>
      </group>
    </group>
  );
}

function Marigolds() {
  // swags of marigolds round the bottom tier, a bigger bloom at each tie point
  const beads = useMemo(() => {
    const out: { p: [number, number, number]; c: string; s: number }[] = [];
    const swags = 9, r = T1.r + 0.08, top = PLATE_Y + T1.h * 0.62, sag = 0.28;
    for (let i = 0; i < swags; i++) {
      for (let j = 0; j <= 10; j++) {
        const s = j / 10, a = ((i + s) / swags) * Math.PI * 2;
        out.push({ p: [Math.cos(a) * r, top - Math.sin(Math.PI * s) * sag, Math.sin(a) * r], c: j % 2 ? "#ffb300" : "#ff7a00", s: j === 0 ? 1.6 : 1 });
      }
    }
    return out;
  }, []);
  return (
    <Instances limit={beads.length} castShadow>
      <icosahedronGeometry args={[0.065, 1]} />
      <meshStandardMaterial roughness={0.95} />
      {beads.map((b, i) => <Instance key={i} position={b.p} color={b.c} scale={b.s} />)}
    </Instances>
  );
}

const diyaGeo = (() => {
  const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.12, 0.01), new THREE.Vector2(0.2, 0.06), new THREE.Vector2(0.22, 0.11), new THREE.Vector2(0.19, 0.12), new THREE.Vector2(0.15, 0.07), new THREE.Vector2(0.001, 0.06)];
  return new THREE.LatheGeometry(pts, 24);
})();
function Diya({ position, seed, dot }: { position: [number, number, number]; seed: number; dot: THREE.Texture }) {
  return (
    <group position={position}>
      <mesh geometry={diyaGeo} castShadow receiveShadow scale={[1, 1, 0.8]}><meshStandardMaterial color="#b5532a" roughness={0.85} /></mesh>
      <group position={[0.15, 0.12, 0]}><Flame seed={seed} scale={0.75} halo="#f5b942" dot={dot} /></group>
    </group>
  );
}

function Mehfil({ cols }: { cols: string[] }) {
  const dot = useMemo(() => softDot(), []);
  useEffect(() => () => dot.dispose(), [dot]);
  return (
    <>
      <Lantern x={-2.9} z={-0.9} len={0.9} color="#e8572a" seed={0} />
      <Lantern x={-1.7} z={-1.3} len={0.4} color="#f5b942" seed={1} />
      <Lantern x={1.8} z={-1.3} len={0.55} color="#c2185b" seed={2} />
      <Lantern x={3.0} z={-0.9} len={1.0} color="#f5b942" seed={3} />
      <Marigolds />
      <Diya position={[-1.75, 0, 1.75]} seed={4} dot={dot} />
      <Diya position={[1.8, 0, 1.7]} seed={5} dot={dot} />
      <Diya position={[-2.6, 0, 1.0]} seed={6} dot={dot} />
      <Diya position={[2.65, 0, 0.95]} seed={7} dot={dot} />
      <Sparkles count={45} scale={[9, 4.5, 3]} position={[0, 2.8, -0.5]} size={4} speed={0.2} color={cols[0]} />
    </>
  );
}

/* ---------- pinboard: polaroids of this month's people pegged on a line ---------- */
function Polaroid({ person, x, y, z, seed }: { person: Person; x: number; y: number; z: number; seed: number }) {
  const g = useRef<THREE.Group>(null);
  // only redraw when what's printed on it changes, not on every board update
  const tex = useMemo(() => polaroid(person), [person.id, person.name, person.photo]);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame(({ clock }) => sway(g.current, clock.elapsedTime + seed * 1.7, 0.08, 1.1));
  return (
    <group ref={g} position={[x, y, z]} rotation-z={(seed % 2 ? 1 : -1) * 0.06}>
      <mesh position={[0, 0.02, 0.02]}><boxGeometry args={[0.06, 0.16, 0.05]} /><meshStandardMaterial color="#d4a373" roughness={0.8} /></mesh>
      <mesh castShadow position={[0, -0.46, 0]}><planeGeometry args={[0.76, 0.89]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.35} roughness={0.85} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function Pinboard({ people, cols }: { people: Person[]; cols: string[] }) {
  const line = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-4.2, 4.5, -1.2), new THREE.Vector3(0, 4.05, -1.2), new THREE.Vector3(4.2, 4.5, -1.2)]), []);
  const slots = [-2.85, -1.6, 1.6, 2.85];
  const fill: Person[] = people.length ? people : [{ id: "you", name: "You", bday: "", createdAt: 0 }];
  return (
    <>
      <mesh><tubeGeometry args={[line, 60, 0.012, 5]} /><meshStandardMaterial color="#f3e6cf" roughness={0.9} /></mesh>
      {slots.map((x, i) => {
        const y = line.getPoint((x + 4.2) / 8.4).y;
        return <Polaroid key={i} person={fill[i % fill.length]} x={x} y={y} z={-1.18} seed={i} />;
      })}
      <Gift position={[2.4, 0, 1.0]} size={0.45} color={cols[2]} ribbon={cols[0]} rot={-0.3} />
    </>
  );
}

/* ---------- starlight: glowing crescent moon, gold stars, a sky of tiny stars ---------- */
const starGeo = (() => {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.11 : 0.26; s[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
  return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }).center();
})();
function GoldStar({ position, seed, gold }: { position: [number, number, number]; seed: number; gold: THREE.Color }) {
  const m = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { const t = clock.elapsedTime + seed * 2.3; if (m.current) { m.current.rotation.y = t * 0.7; m.current.position.y = position[1] + Math.sin(t * 0.9) * 0.12; } });
  return <mesh ref={m} geometry={starGeo} position={position} scale={0.9 + (seed % 3) * 0.2}><meshStandardMaterial color="#f6d36b" emissive={gold} emissiveIntensity={0.9} metalness={1} roughness={0.25} toneMapped={false} /></mesh>;
}

function Starlight({ cols }: { cols: string[] }) {
  const moon = useMemo(() => crescent(), []);
  useEffect(() => () => moon.dispose(), [moon]);
  const gold = useMemo(() => new THREE.Color("#f6d36b").multiplyScalar(0.9), []);
  const moonCol = useMemo(() => new THREE.Color("#ffffff").multiplyScalar(1.6), []);
  const r = rng(5);
  const spots: [number, number, number][] = [[-2.6, 3.6, -0.6], [-3.3, 2.2, 0.2], [2.7, 2.6, 0.1], [-1.9, 4.3, -1.2], [3.4, 3.7, -0.8]];
  return (
    <>
      <Stars radius={30} depth={20} count={900} factor={3} saturation={0} fade speed={0.6} />
      <Billboard position={[2.8, 4.4, -3]}>
        <mesh><planeGeometry args={[1.5, 1.5]} /><meshBasicMaterial map={moon} color={moonCol} transparent depthWrite={false} toneMapped={false} /></mesh>
      </Billboard>
      {spots.map((p, i) => <GoldStar key={i} position={p} seed={i + r()} gold={gold} />)}
      <Sparkles count={60} scale={[9, 5, 3]} position={[0, 2.8, -0.5]} size={3} speed={0.3} color={cols[0]} />
    </>
  );
}

/* ---------- confetti pop: pastel confetti tumbling through the air, gifts ---------- */
function FallingConfetti({ cols }: { cols: string[] }) {
  const N = 110;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const state = useMemo(() => { const r = rng(3); return Array.from({ length: N }, () => ({ x: (r() - 0.5) * 9, y: r() * 5.5, z: (r() - 0.5) * 3, s: 0.4 + r() * 0.6, rx: r() * 6, ry: r() * 6, sp: 0.35 + r() * 0.4 })); }, []);
  useEffect(() => {
    const m = mesh.current; if (!m) return;
    const c = new THREE.Color();
    state.forEach((_, i) => m.setColorAt(i, c.set(cols[i % cols.length])));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [cols, state]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, dt) => {
    const m = mesh.current; if (!m) return;
    const t = clock.elapsedTime;
    state.forEach((p, i) => {
      p.y -= p.sp * dt; if (p.y < 0.05) p.y = 5.6;
      o.position.set(p.x + Math.sin(t * 0.8 + i) * 0.25, p.y, p.z);
      o.rotation.set(p.rx + t * 2 * p.sp, p.ry + t * 1.4, 0); o.scale.setScalar(p.s);
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N]}>
      <planeGeometry args={[0.12, 0.08]} />
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.5} />
    </instancedMesh>
  );
}

function Pop({ cols }: { cols: string[] }) {
  return (
    <>
      <FallingConfetti cols={cols} />
      <Gift position={[-2.4, 0, 0.95]} size={0.6} color={cols[1]} ribbon={cols[0]} rot={0.3} />
      <Gift position={[-1.85, 0, 1.55]} size={0.36} color={cols[2]} ribbon={cols[3]} rot={-0.5} />
      <Gift position={[2.4, 0, 1.0]} size={0.5} color={cols[3]} ribbon={cols[0]} rot={-0.3} />
    </>
  );
}

export function TemplateProps({ tpl, cols, people }: { tpl: TemplateKey; cols: string[]; people: Person[] }) {
  if (tpl === "mehfil") return <Mehfil cols={cols} />;
  if (tpl === "pinboard") return <Pinboard people={people} cols={cols} />;
  if (tpl === "starlight") return <Starlight cols={cols} />;
  if (tpl === "pop") return <Pop cols={cols} />;
  return <Party cols={cols} />;
}
