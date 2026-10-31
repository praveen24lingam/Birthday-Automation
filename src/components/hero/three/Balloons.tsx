"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BallCollider, CuboidCollider, CylinderCollider, Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { sfx } from "@/lib/audio";
import { PLATE_Y, T1, T2 } from "./Cake3D";
import { rng } from "./util";

export type BalloonLook = { colors: string[]; count: number; size: number; roughness: number; metalness: number; iridescence?: number };

const balloonGeo = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, y = -Math.cos(Math.PI * t) * 0.5;
    pts.push(new THREE.Vector2(Math.max(0.001, Math.sin(Math.PI * t) * 0.37 * (t < 0.5 ? 0.72 + 0.56 * t : 1)), y));
  }
  return new THREE.LatheGeometry(pts, 36);
})();
const stringGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -0.55, 0), new THREE.Vector3(0.05, -0.85, 0.02), new THREE.Vector3(-0.04, -1.15, -0.02), new THREE.Vector3(0.03, -1.5, 0),
]), 20, 0.006, 4);

type Home = { x: number; y: number; z: number };
/** spots either side of the cake, so the balloons frame it instead of hiding it */
function homes(n: number): Home[] {
  const r = rng(99);
  return Array.from({ length: n }, (_, i) => {
    const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
    return { x: side * (2.35 + (row % 2) * 0.75 + r() * 0.3), y: 2.0 + ((row * 0.9 + r() * 0.5) % 1.9), z: -0.7 + r() * 1.2 };
  });
}

function Balloon({ home, color, look, seed, popAfter, onPop }: { home: Home; color: string; look: BalloonLook; seed: number; popAfter: number | null; onPop: (p: THREE.Vector3, c: string) => void }) {
  const rb = useRef<RapierRigidBody>(null);
  const tilt = useRef<THREE.Group>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (popAfter === null) return;
    const id = setTimeout(() => {
      const p = rb.current?.translation();
      if (p) onPop(new THREE.Vector3(p.x, p.y, p.z), color);
      setGone(true);
    }, popAfter);
    return () => clearTimeout(id);
  }, [popAfter, color, onPop]);

  useFrame(({ clock }, dt) => {
    const b = rb.current; if (!b || gone) return;
    const t = clock.elapsedTime + seed * 3.7, p = b.translation(), m = b.mass();
    const targetX = home.x + Math.sin(t * 0.37) * 0.18;
    const targetY = home.y + Math.sin(t * 0.8) * 0.22;
    const targetZ = home.z;
    b.resetForces(true);
    b.addForce({ x: (targetX - p.x) * 18 * m, y: (targetY - p.y) * 22 * m, z: (targetZ - p.z) * 18 * m }, true);
    const v = b.linvel();
    if (tilt.current) { tilt.current.rotation.z = THREE.MathUtils.damp(tilt.current.rotation.z, -v.x * 0.35, 4, dt); tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, v.z * 0.3, 4, dt); }
  });

  if (gone) return null;
  const s = look.size;
  return (
    <RigidBody ref={rb} colliders={false} position={[home.x, home.y, home.z]} linearDamping={1.6} lockRotations>
      <BallCollider args={[0.38 * s]} density={0.3} restitution={0.7} />
      <group ref={tilt} scale={s}
        onPointerDown={(e) => { e.stopPropagation(); const b = rb.current; if (b) b.applyImpulse({ x: (Math.random() - 0.5) * 1.4 * b.mass(), y: 1.8 * b.mass(), z: -0.6 * b.mass() }, true); }}>
        <mesh geometry={balloonGeo} castShadow>
          <meshPhysicalMaterial color={color} roughness={look.roughness} metalness={look.metalness} clearcoat={1} clearcoatRoughness={0.15} sheen={0.4} iridescence={look.iridescence ?? 0} />
        </mesh>
        <mesh position={[0, -0.53, 0]}>
          <coneGeometry args={[0.06, 0.08, 10]} />
          <meshStandardMaterial color={color} roughness={look.roughness} />
        </mesh>
        <mesh geometry={stringGeo}><meshBasicMaterial color="#e7dcf6" transparent opacity={0.7} /></mesh>
      </group>
    </RigidBody>
  );
}

/**
 * Latex shreds that fly out when a balloon pops. One instanced mesh is mounted up front and
 * recycled, so nothing new compiles mid-celebration (doing that blanked the bloom pass).
 */
const SHRED_PER = 14, SHRED_MAX = SHRED_PER * 8, SHRED_LIFE = 0.9;
type Shreds = { burst: (at: THREE.Vector3, color: string) => void };
function ShredPool({ api }: { api: { current: Shreds | null } }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const ps = useMemo(() => Array.from({ length: SHRED_MAX }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), rx: 0, ry: 0, age: SHRED_LIFE })), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const next = useRef(0), live = useRef(false);
  useLayoutEffect(() => {
    const m = mesh.current; if (!m) return;
    const white = new THREE.Color("#ffffff");
    o.position.set(0, -100, 0); o.updateMatrix();
    for (let i = 0; i < SHRED_MAX; i++) { m.setMatrixAt(i, o.matrix); m.setColorAt(i, white); }
    api.current = {
      burst(at, color) {
        const c = new THREE.Color(color);
        for (let i = 0; i < SHRED_PER; i++) {
          const k = next.current++ % SHRED_MAX, s = ps[k];
          s.p.copy(at); s.v.set((Math.random() - 0.5) * 5, Math.random() * 4 - 0.5, (Math.random() - 0.5) * 3);
          s.rx = Math.random() * 6; s.ry = Math.random() * 6; s.age = 0;
          m.setColorAt(k, c);
        }
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
        live.current = true;
      },
    };
    return () => { api.current = null; };
  }, [api, ps, o]);
  useFrame((_, dt) => {
    const m = mesh.current; if (!m || !live.current) return;
    let any = false;
    ps.forEach((s, i) => {
      if (s.age >= SHRED_LIFE) return;
      s.age += dt; any = true;
      s.v.y -= 9 * dt; s.v.multiplyScalar(0.97); s.p.addScaledVector(s.v, dt); s.rx += dt * 9; s.ry += dt * 7;
      if (s.age >= SHRED_LIFE) o.position.set(0, -100, 0); else o.position.copy(s.p);
      o.rotation.set(s.rx, s.ry, 0); o.scale.setScalar(Math.max(0.1, 1 - s.age / SHRED_LIFE));
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    live.current = any;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SHRED_MAX]} frustumCulled={false}>
      <planeGeometry args={[0.1, 0.07]} />
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.4} />
    </instancedMesh>
  );
}

export function Balloons({ look, lit, paused }: { look: BalloonLook; lit: boolean; paused: boolean }) {
  const spots = useMemo(() => homes(look.count), [look.count]);
  // a fresh bunch floats up each time the candles are relit
  const [gen, setGen] = useState(0);
  const wasLit = useRef(lit);
  useEffect(() => { if (lit && !wasLit.current) setGen((g) => g + 1); wasLit.current = lit; }, [lit]);
  const shreds = useRef<Shreds | null>(null);
  const onPop = useCallback((at: THREE.Vector3, color: string) => { sfx("pop"); shreds.current?.burst(at, color); }, []);

  return (
    <Physics gravity={[0, 0, 0]} paused={paused}>
      {/* invisible room: floor, ceiling, walls, and the cake itself to bump against */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[8, 0.1, 4]} position={[0, 0.2, 0]} />
        <CuboidCollider args={[8, 0.1, 4]} position={[0, 4.6, 0]} />
        <CuboidCollider args={[0.1, 4, 4]} position={[-4.4, 2, 0]} />
        <CuboidCollider args={[0.1, 4, 4]} position={[4.4, 2, 0]} />
        <CuboidCollider args={[8, 4, 0.1]} position={[0, 2, -1.6]} />
        <CuboidCollider args={[8, 4, 0.1]} position={[0, 2, 1.4]} />
        <CylinderCollider args={[T1.h / 2 + 0.3, T1.r + 0.05]} position={[0, PLATE_Y + T1.h / 2 - 0.3, 0]} />
        <CylinderCollider args={[T2.h / 2 + 0.5, T2.r]} position={[0, PLATE_Y + T1.h + T2.h / 2 + 0.5, 0]} />
      </RigidBody>
      {spots.map((h, i) => (
        <Balloon key={`${gen}-${i}`} home={h} color={look.colors[i % look.colors.length]} look={look} seed={i}
          popAfter={lit ? null : 900 + i * 160} onPop={onPop} />
      ))}
      <ShredPool api={shreds} />
    </Physics>
  );
}
