"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import { rng, softDot, stripes } from "./util";

export type CakeLook = {
  tier1: string; tier2: string; frost1: string; frost2: string; bead: string;
  plate: string; metal: number; frostMetal: number; candles: string[]; sprinkles: string[]; halo: string;
};

/* ---------- cake measurements, shared with the physics collider and the props ---------- */
export const PLATE_Y = 0.5, T1 = { r: 1.45, h: 1.0 }, T2 = { r: 0.98, h: 0.75 };
const T1_Y = PLATE_Y, T2_Y = T1_Y + T1.h + 0.04, TOP_Y = T2_Y + T2.h + 0.04;
const CANDLES = [
  { x: -0.44, z: 0.14, h: 0.55 },
  { x: 0, z: -0.12, h: 0.7 },
  { x: 0.44, z: 0.14, h: 0.55 },
];
export const CAKE_TOP = TOP_Y + 0.85;

/** Angular cut width for the cake slice (~33 degrees) */
const CUT_ANGLE = 0.58;

function createCutTierGeometry(r: number, h: number, cutAngle: number) {
  const half = cutAngle / 2;
  const a1 = Math.PI / 2 + half;
  const a2 = Math.PI / 2 - half;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(r * Math.cos(a1), r * Math.sin(a1));
  shape.absarc(0, 0, r, a1, a2 + 2 * Math.PI, false);
  shape.lineTo(0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 36 });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, h / 2, 0);
  return geo;
}

function createWedgeGeometry(r: number, h: number, cutAngle: number) {
  const half = cutAngle / 2;
  const a1 = Math.PI / 2 + half;
  const a2 = Math.PI / 2 - half;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(r * Math.cos(a2), r * Math.sin(a2));
  shape.absarc(0, 0, r, a2, a1, false);
  shape.lineTo(0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 36 });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, h / 2, 0);
  return geo;
}

/* ---------- flame: teardrop with a hot core and a soft halo ---------- */
const flameGeo = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 18; i++) { const y = i / 18; pts.push(new THREE.Vector2(Math.sin(Math.PI * y) * (1 - y * 0.62) * 0.5, y)); }
  return new THREE.LatheGeometry(pts, 20);
})();
const OUTER = new THREE.Color("#ff9a2e").multiplyScalar(3.2);
const CORE = new THREE.Color("#fff3c4").multiplyScalar(5);

export function Flame({ lit = true, seed = 0, scale = 1, halo = "#ffb020", dot }: { lit?: boolean; seed?: number; scale?: number; halo?: string; dot: THREE.Texture }) {
  const g = useRef<THREE.Group>(null);
  const level = useRef(lit ? 1 : 0);
  const out = useRef(0);
  useEffect(() => { if (!lit) out.current = performance.now(); }, [lit]);
  useFrame(({ clock }, dt) => {
    const el = g.current; if (!el) return;
    const t = clock.elapsedTime + seed * 7.3;
    const gust = !lit && performance.now() - out.current < 380;
    level.current = THREE.MathUtils.damp(level.current, lit ? 1 : 0, lit ? 3 : gust ? 2 : 14, dt);
    const l = level.current, f = 1 + Math.sin(t * 13) * 0.07 + Math.sin(t * 27.3) * 0.05 + (gust ? Math.sin(t * 60) * 0.25 : 0);
    el.scale.set(l * (2 - f) * scale, l * f * scale, l * (2 - f) * scale);
    el.rotation.z = Math.sin(t * 3.1) * 0.09 * l + (gust ? -0.5 : 0);
    el.visible = l > 0.02;
  });
  return (
    <group ref={g}>
      <mesh geometry={flameGeo} scale={[0.13, 0.3, 0.13]}><meshBasicMaterial color={OUTER} transparent opacity={0.92} toneMapped={false} /></mesh>
      <mesh geometry={flameGeo} scale={[0.065, 0.16, 0.065]} position={[0, 0.01, 0]}><meshBasicMaterial color={CORE} toneMapped={false} /></mesh>
      <sprite position={[0, 0.12, 0]} scale={0.75}>
        <spriteMaterial map={dot} color={halo} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
}

/* ---------- smoke: puffs after blowout ---------- */
const PUFFS = 10;
function Smoke({ lit, dot }: { lit: boolean; dot: THREE.Texture }) {
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const start = useRef(-1);
  const clock = useThree((s) => s.clock);
  useEffect(() => { start.current = lit ? -1 : clock.elapsedTime + 0.25; }, [lit, clock]);
  const seeds = useMemo(() => { const r = rng(42); return Array.from({ length: CANDLES.length * PUFFS }, () => [r(), r(), r()]); }, []);
  useFrame(({ clock }) => {
    sprites.current.forEach((s, i) => {
      if (!s) return;
      const c = CANDLES[Math.floor(i / PUFFS)], [a, b, d] = seeds[i];
      const age = start.current < 0 ? -1 : clock.elapsedTime - start.current - (i % PUFFS) * 0.12 - a * 0.1, life = 2.4;
      if (age < 0 || age > life) { s.visible = false; return; }
      const k = age / life;
      s.visible = true;
      s.position.set(c.x + Math.sin(age * 2.2 + b * 6) * 0.12 * k * 3, TOP_Y + c.h + 0.08 + age * 0.62, c.z + (d - 0.5) * 0.2 * k);
      s.scale.setScalar(0.12 + k * 0.7);
      (s.material as THREE.SpriteMaterial).opacity = 0.42 * (1 - k) * Math.min(1, age * 5);
    });
  });
  return (
    <>
      {seeds.map((_, i) => (
        <sprite key={i} ref={(el) => { sprites.current[i] = el; }} visible={false}>
          <spriteMaterial map={dot} color="#d8d0e6" transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </>
  );
}

/* ---------- one tier: sponge, frosting cap, drips, piped beads ---------- */
function Tier({
  y,
  r,
  h,
  color,
  frost,
  frostMetal,
  bead,
  seed,
  isCut,
}: {
  y: number;
  r: number;
  h: number;
  color: string;
  frost: string;
  frostMetal: number;
  bead: string;
  seed: number;
  isCut: boolean;
}) {
  const roundGeo = useMemo(() => new THREE.CylinderGeometry(r, r, h, 64), [r, h]);
  const cutGeo = useMemo(() => createCutTierGeometry(r, h, CUT_ANGLE), [r, h]);
  const roundFrostGeo = useMemo(() => new THREE.CylinderGeometry(r + 0.03, r + 0.03, 0.08, 64), [r]);
  const cutFrostGeo = useMemo(() => createCutTierGeometry(r + 0.03, 0.08, CUT_ANGLE), [r]);

  useEffect(() => {
    return () => {
      roundGeo.dispose();
      cutGeo.dispose();
      roundFrostGeo.dispose();
      cutFrostGeo.dispose();
    };
  }, [roundGeo, cutGeo, roundFrostGeo, cutFrostGeo]);

  const inCutAngle = (a: number) => {
    const norm = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return Math.abs(norm - Math.PI / 2) < CUT_ANGLE / 2;
  };

  const drips = useMemo(() => {
    const rand = rng(seed), n = Math.round(r * 18);
    return Array.from({ length: n }, (_, i) => ({ a: (i / n) * Math.PI * 2 + rand() * 0.08, len: 0.1 + rand() * rand() * 0.42 }))
      .filter((d) => !isCut || !inCutAngle(d.a));
  }, [r, seed, isCut]);

  const beads = useMemo(() => {
    const n = Math.round((Math.PI * 2 * r) / 0.15);
    return Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2)
      .filter((a) => !isCut || !inCutAngle(a));
  }, [r, isCut]);

  return (
    <group position={[0, y, 0]}>
      {/* Tier Sponge Body (Swaps seamlessly to cut geometry when isCut is true) */}
      <mesh
        castShadow
        receiveShadow
        position={[0, h / 2, 0]}
        geometry={isCut ? cutGeo : roundGeo}
      >
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>

      {/* Frosting Cap on top of tier */}
      <mesh
        castShadow
        receiveShadow
        position={[0, h + 0.01, 0]}
        geometry={isCut ? cutFrostGeo : roundFrostGeo}
      >
        <meshPhysicalMaterial color={frost} roughness={0.3} metalness={frostMetal} clearcoat={0.6} />
      </mesh>

      {/* Torus rim frosting (rendered when whole cake) */}
      {!isCut && (
        <mesh position={[0, h + 0.04, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[r + 0.02, 0.06, 12, 80]} />
          <meshPhysicalMaterial color={frost} roughness={0.3} metalness={frostMetal} clearcoat={0.6} />
        </mesh>
      )}

      {/* Drips along outer rim */}
      <Instances limit={drips.length} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshPhysicalMaterial color={frost} roughness={0.3} metalness={frostMetal} clearcoat={0.6} />
        {drips.map((d, i) => (
          <Instance
            key={i}
            position={[Math.cos(d.a) * (r + 0.015), h - d.len * 0.45, Math.sin(d.a) * (r + 0.015)]}
            scale={[0.075, d.len * 0.62, 0.075]}
          />
        ))}
      </Instances>

      {/* Piped beads around base */}
      <Instances limit={beads.length}>
        <sphereGeometry args={[0.075, 10, 8]} />
        <meshStandardMaterial color={bead} roughness={0.4} metalness={frostMetal * 0.6} />
        {beads.map((a, i) => (
          <Instance key={i} position={[Math.cos(a) * (r + 0.02), 0.06, Math.sin(a) * (r + 0.02)]} />
        ))}
      </Instances>
    </group>
  );
}

/** The Cut Piece: Exactly matches the cut gap and glides forward right to the center of the plate */
function CakeSlice({ isCut, look }: { isCut: boolean; look: CakeLook }) {
  const sliceGroup = useRef<THREE.Group>(null);
  const posZ = useRef(0);
  const posY = useRef(0);

  const t1Wedge = useMemo(() => createWedgeGeometry(T1.r, T1.h, CUT_ANGLE), []);
  const t1FrostWedge = useMemo(() => createWedgeGeometry(T1.r + 0.03, 0.08, CUT_ANGLE), []);
  const t2Wedge = useMemo(() => createWedgeGeometry(T2.r, T2.h, CUT_ANGLE), []);
  const t2FrostWedge = useMemo(() => createWedgeGeometry(T2.r + 0.03, 0.08, CUT_ANGLE), []);

  useEffect(() => {
    return () => {
      t1Wedge.dispose();
      t1FrostWedge.dispose();
      t2Wedge.dispose();
      t2FrostWedge.dispose();
    };
  }, [t1Wedge, t1FrostWedge, t2Wedge, t2FrostWedge]);

  useFrame((_, dt) => {
    if (!sliceGroup.current) return;
    const targetZ = isCut ? 0.88 : 0;
    const targetY = isCut ? -0.02 : 0;
    const targetScale = isCut ? 1 : 0.001;

    posZ.current = THREE.MathUtils.damp(posZ.current, targetZ, 4.2, dt);
    posY.current = THREE.MathUtils.damp(posY.current, targetY, 4.2, dt);

    sliceGroup.current.position.z = posZ.current;
    sliceGroup.current.position.y = posY.current;
    sliceGroup.current.position.x = 0; // Center aligned!
    sliceGroup.current.rotation.y = 0;
    sliceGroup.current.scale.setScalar(THREE.MathUtils.damp(sliceGroup.current.scale.x, targetScale, 6, dt));
  });

  if (!isCut) return null;

  return (
    <group ref={sliceGroup}>
      {/* Bottom tier wedge */}
      <group position={[0, T1_Y, 0]}>
        <mesh geometry={t1Wedge} position={[0, T1.h / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={look.tier1} roughness={0.62} />
        </mesh>
        <mesh geometry={t1FrostWedge} position={[0, T1.h + 0.01, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={look.frost1} roughness={0.3} metalness={look.frostMetal} clearcoat={0.6} />
        </mesh>
      </group>

      {/* Top tier wedge */}
      <group position={[0, T2_Y, 0]}>
        <mesh geometry={t2Wedge} position={[0, T2.h / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={look.tier2} roughness={0.62} />
        </mesh>
        <mesh geometry={t2FrostWedge} position={[0, T2.h + 0.01, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={look.frost2} roughness={0.3} metalness={look.frostMetal} clearcoat={0.6} />
        </mesh>
      </group>

      {/* Subtle dessert saucer under the cut slice */}
      <mesh position={[0, PLATE_Y - 0.01, 0.72]} receiveShadow>
        <cylinderGeometry args={[0.74, 0.8, 0.02, 36]} />
        <meshPhysicalMaterial color={look.plate} roughness={0.2} metalness={look.metal} clearcoat={1} />
      </mesh>

      {/* Glossy Birthday Cherry on top of the slice */}
      <mesh position={[0, TOP_Y + 0.12, 0.48]} castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshPhysicalMaterial color="#e11d48" roughness={0.15} metalness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0.02, TOP_Y + 0.22, 0.47]} rotation-z={0.25}>
        <cylinderGeometry args={[0.01, 0.01, 0.13, 8]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** 3D Festive Birthday Knife: hovers gracefully, then cuts straight down through the center seam */
function BirthdayKnife({ cutting, showKnife }: { cutting: boolean; showKnife: boolean }) {
  const knifeRef = useRef<THREE.Group>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (showKnife || cutting) {
      setActive(true);
    } else {
      const t = setTimeout(() => setActive(false), 900);
      return () => clearTimeout(t);
    }
  }, [showKnife, cutting]);

  useFrame(({ clock }, dt) => {
    if (!knifeRef.current) return;
    if (!active) {
      knifeRef.current.visible = false;
      return;
    }
    knifeRef.current.visible = true;

    if (cutting) {
      // Plunging down into the cake cut seam right in the front center!
      knifeRef.current.position.x = THREE.MathUtils.damp(knifeRef.current.position.x, 0, 10, dt);
      knifeRef.current.position.z = THREE.MathUtils.damp(knifeRef.current.position.z, 0.65, 10, dt);
      knifeRef.current.position.y = THREE.MathUtils.damp(knifeRef.current.position.y, PLATE_Y + 0.25, 10, dt);
      knifeRef.current.rotation.x = THREE.MathUtils.damp(knifeRef.current.rotation.x, 0.15, 10, dt);
      knifeRef.current.rotation.y = THREE.MathUtils.damp(knifeRef.current.rotation.y, 0, 10, dt);
      knifeRef.current.rotation.z = THREE.MathUtils.damp(knifeRef.current.rotation.z, 0, 10, dt);
    } else if (showKnife) {
      // Hovering above cake gently bobbing, ready to cut
      const t = clock.elapsedTime;
      const targetY = TOP_Y + 1.1 + Math.sin(t * 3) * 0.06;
      knifeRef.current.position.y = THREE.MathUtils.damp(knifeRef.current.position.y, targetY, 6, dt);
      knifeRef.current.position.x = THREE.MathUtils.damp(knifeRef.current.position.x, 0.2, 6, dt);
      knifeRef.current.position.z = THREE.MathUtils.damp(knifeRef.current.position.z, 0.7, 6, dt);
      knifeRef.current.rotation.x = THREE.MathUtils.damp(knifeRef.current.rotation.x, -0.3, 6, dt);
      knifeRef.current.rotation.y = THREE.MathUtils.damp(knifeRef.current.rotation.y, 0.15, 6, dt);
      knifeRef.current.rotation.z = THREE.MathUtils.damp(knifeRef.current.rotation.z, 0.2, 6, dt);
    } else {
      // Retracting upward and fading out
      knifeRef.current.position.y = THREE.MathUtils.damp(knifeRef.current.position.y, TOP_Y + 2.5, 6, dt);
    }
  });

  return (
    <group ref={knifeRef} position={[0.2, TOP_Y + 1.1, 0.7]}>
      {/* Blade */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.025, 0.8, 0.14]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.12} />
      </mesh>
      {/* Golden hilt */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.05, 0.06, 0.2]} />
        <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Wooden handle */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.045, 0.38, 16]} />
        <meshStandardMaterial color="#3e2723" roughness={0.4} />
      </mesh>
    </group>
  );
}

/** sprinkles lying flat on the side of the bottom tier and its ledge */
function Sprinkles({ colors, isCut }: { colors: string[]; isCut: boolean }) {
  const items = useMemo(() => {
    const rand = rng(7), q = new THREE.Quaternion(), e = new THREE.Euler(), n = new THREE.Vector3();
    const inCutAngle = (a: number) => {
      const norm = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      return Math.abs(norm - Math.PI / 2) < CUT_ANGLE / 2;
    };

    const side = Array.from({ length: 90 }, (_, i) => {
      const a = rand() * Math.PI * 2;
      n.set(Math.cos(a), 0, Math.sin(a)); q.setFromAxisAngle(n, rand() * Math.PI); e.setFromQuaternion(q);
      return { p: [Math.cos(a) * (T1.r + 0.012), T1_Y + 0.2 + rand() * (T1.h - 0.55), Math.sin(a) * (T1.r + 0.012)] as [number, number, number], r: [e.x, e.y, e.z] as [number, number, number], c: colors[i % colors.length], a };
    }).filter((s) => !isCut || !inCutAngle(s.a));

    const ledge = Array.from({ length: 40 }, (_, i) => {
      const a = rand() * Math.PI * 2, d = T2.r + 0.12 + rand() * (T1.r - T2.r - 0.25);
      return { p: [Math.cos(a) * d, T1_Y + T1.h + 0.06, Math.sin(a) * d] as [number, number, number], r: [Math.PI / 2, 0, rand() * Math.PI] as [number, number, number], c: colors[(i + 1) % colors.length], a };
    }).filter((s) => !isCut || !inCutAngle(s.a));

    return [...side, ...ledge];
  }, [colors, isCut]);
  return (
    <Instances limit={items.length}>
      <capsuleGeometry args={[0.02, 0.07, 2, 6]} />
      <meshStandardMaterial roughness={0.4} />
      {items.map((s, i) => <Instance key={i} position={s.p} rotation={s.r} color={s.c} />)}
    </Instances>
  );
}

function Stand({ color, metal }: { color: string; metal: number }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, PLATE_Y - 0.05, 0]}>
        <cylinderGeometry args={[2.0, 1.85, 0.1, 72]} />
        <meshPhysicalMaterial color={color} roughness={0.25} metalness={metal} clearcoat={1} />
      </mesh>
      <mesh castShadow position={[0, PLATE_Y - 0.25, 0]}>
        <cylinderGeometry args={[0.32, 0.55, 0.32, 40]} />
        <meshPhysicalMaterial color={color} roughness={0.25} metalness={metal} clearcoat={1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 0.06, 48]} />
        <meshPhysicalMaterial color={color} roughness={0.25} metalness={metal} clearcoat={1} />
      </mesh>
    </group>
  );
}

function Candle({ x, z, h, color, lit, seed, halo, dot }: { x: number; z: number; h: number; color: string; lit: boolean; seed: number; halo: string; dot: THREE.Texture }) {
  const tex = useMemo(() => { const t = stripes(color, "#fffaf0"); t.repeat.set(1, h * 2); return t; }, [color, h]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group position={[x, TOP_Y, z]}>
      <mesh castShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.065, 0.07, h, 20]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
      <mesh position={[0, h + 0.04, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.08, 6]} />
        <meshStandardMaterial color="#2b1747" />
      </mesh>
      <group position={[0, h + 0.06, 0]}><Flame lit={lit} seed={seed} halo={halo} dot={dot} /></group>
    </group>
  );
}

/** warm light thrown by the candles; it fades as they go out */
function CandleLight({ lit }: { lit: boolean }) {
  const l = useRef<THREE.PointLight>(null);
  useFrame(({ clock }, dt) => {
    if (!l.current) return;
    const t = clock.elapsedTime, target = lit ? 2.6 + Math.sin(t * 11) * 0.25 + Math.sin(t * 23) * 0.15 : 0;
    l.current.intensity = THREE.MathUtils.damp(l.current.intensity, target, lit ? 3 : 6, dt);
  });
  return <pointLight ref={l} position={[0, TOP_Y + 0.9, 0.3]} color="#ffb35c" intensity={2.6} distance={7} decay={1.4} />;
}

export function Cake3D({
  lit,
  look,
  isCut = false,
  showKnife = false,
  cutting = false,
}: {
  lit: boolean;
  look: CakeLook;
  isCut?: boolean;
  showKnife?: boolean;
  cutting?: boolean;
}) {
  const dot = useMemo(() => softDot(), []);
  useEffect(() => () => dot.dispose(), [dot]);
  const g = useRef<THREE.Group>(null);
  const rise = useRef(0);

  useFrame((_, dt) => {
    if (!g.current || rise.current > 0.999) return;
    rise.current = THREE.MathUtils.damp(rise.current, 1, 2.6, dt);
    const k = rise.current;
    g.current.position.y = (1 - k) * -1.6;
    g.current.scale.setScalar(0.7 + 0.3 * k);
    g.current.rotation.y = (1 - k) * -0.9;
  });

  return (
    <group ref={g}>
      <Stand color={look.plate} metal={look.metal} />
      <Tier y={T1_Y} r={T1.r} h={T1.h} color={look.tier1} frost={look.frost1} frostMetal={look.frostMetal} bead={look.bead} seed={11} isCut={isCut} />
      <Tier y={T2_Y} r={T2.r} h={T2.h} color={look.tier2} frost={look.frost2} frostMetal={look.frostMetal} bead={look.bead} seed={23} isCut={isCut} />
      <CakeSlice isCut={isCut} look={look} />
      <BirthdayKnife cutting={cutting} showKnife={showKnife} />
      <Sprinkles colors={look.sprinkles} isCut={isCut} />
      {CANDLES.map((c, i) => <Candle key={i} {...c} color={look.candles[i % look.candles.length]} lit={lit} seed={i} halo={look.halo} dot={dot} />)}
      <CandleLight lit={lit} />
      <Smoke lit={lit} dot={dot} />
    </group>
  );
}
