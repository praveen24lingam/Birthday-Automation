"use client";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { Person, TemplateKey } from "@/lib/data/types";
import { TEMPLATES } from "@/lib/templates";
import { Cake3D, type CakeLook } from "./Cake3D";
import { Balloons, type BalloonLook } from "./Balloons";
import { TemplateProps } from "./TemplateProps";

type Look = { cake: CakeLook; balloons: BalloonLook; sky: string; ground: string; key: number; bloom: number };

/** each month's template gets its own cake, balloons and light */
function looks(tpl: TemplateKey): Look {
  const c = TEMPLATES[tpl].cols;
  const cream = "#fff3d6";
  switch (tpl) {
    case "mehfil": return {
      cake: { tier1: "#7a1630", tier2: "#fff0d6", frost1: "#f5b942", frost2: "#f5b942", bead: "#ffd98a", plate: "#d9a441", metal: 0.85, frostMetal: 0.55, candles: ["#c2185b", "#f5b942", "#e8572a"], sprinkles: ["#f5b942", "#ffd98a", "#fff3d6"], halo: "#f5b942" },
      balloons: { colors: ["#f5b942", "#c2185b", "#e8572a", "#d9a441"], count: 4, size: 0.85, roughness: 0.22, metalness: 0.08 },
      sky: "#ffd9a0", ground: "#5c1230", key: 1.6, bloom: 1.1 };
    case "pinboard": return {
      cake: { tier1: c[1], tier2: cream, frost1: cream, frost2: c[0], bead: c[2], plate: "#fbf8f1", metal: 0, frostMetal: 0, candles: [c[2], c[3], c[1]], sprinkles: c, halo: "#ffb86b" },
      balloons: { colors: [c[2], c[0], c[1], c[3]], count: 4, size: 0.85, roughness: 0.55, metalness: 0 },
      sky: "#fff1dc", ground: "#b8844c", key: 2.2, bloom: 0.7 };
    case "starlight": return {
      cake: { tier1: "#1e2b6e", tier2: "#f4eee0", frost1: "#f6d36b", frost2: "#f6d36b", bead: "#f6d36b", plate: "#cfd6ee", metal: 0.9, frostMetal: 0.7, candles: ["#8fb3ff", "#f6d36b", "#ffb3c7"], sprinkles: ["#f6d36b", "#ffffff", "#8fb3ff"], halo: "#f6d36b" },
      balloons: { colors: ["#e8edff", "#f6d36b", "#b9a3ff"], count: 4, size: 0.85, roughness: 0.18, metalness: 0.12, iridescence: 1 },
      sky: "#8fb3ff", ground: "#0b1640", key: 1.4, bloom: 1.4 };
    case "pop": return {
      cake: { tier1: c[1], tier2: "#fff6c8", frost1: "#fff6c8", frost2: c[2], bead: c[0], plate: "#ffffff", metal: 0, frostMetal: 0, candles: [c[3], c[0], c[2]], sprinkles: [c[0], c[2], c[3], "#7bd389"], halo: "#ffcb47" },
      balloons: { colors: [c[1], c[2], c[0], c[3], "#7bd389"], count: 8, size: 1.05, roughness: 0.15, metalness: 0 },
      sky: "#ffffff", ground: "#ffd6e7", key: 2.4, bloom: 0.6 };
    default: return {
      cake: { tier1: c[1], tier2: cream, frost1: cream, frost2: c[0], bead: c[0], plate: "#efe7f8", metal: 0.1, frostMetal: 0, candles: [c[3], c[2], c[1]], sprinkles: [c[0], c[2], c[3], "#ffffff"], halo: c[0] },
      balloons: { colors: [c[0], c[1], c[2], c[3]], count: 6, size: 1, roughness: 0.2, metalness: 0.05 },
      sky: "#b9a3ff", ground: "#2a1a5c", key: 1.8, bloom: 1 };
  }
}

/** slow drift around the cake; leans a little toward the pointer; backs off on narrow screens */
function Rig() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, clock, pointer, size }) => {
    const t = clock.elapsedTime, aspect = size.width / size.height;
    const d = THREE.MathUtils.clamp(10.2 / aspect, 8.2, 12.5);
    v.set(Math.sin(t * 0.13) * 0.9 + pointer.x * 0.6, 2.5 + Math.sin(t * 0.09) * 0.25 + pointer.y * 0.3, d);
    camera.position.lerp(v, 0.04);
    camera.lookAt(0, 2.05, 0);
  });
  return null;
}

export type CakeSceneProps = {
  lit: boolean;
  tpl: TemplateKey;
  people: Person[];
  active: boolean;
  onLost: () => void;
  isCut?: boolean;
  showKnife?: boolean;
  cutting?: boolean;
};

export default function CakeScene({ lit, tpl, people, active, onLost, isCut = false, showKnife = false, cutting = false }: CakeSceneProps) {
  const look = useMemo(() => looks(tpl), [tpl]);
  const cols = TEMPLATES[tpl].cols;
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 3, 11], fov: 32, near: 0.1, far: 120 }}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); onLost(); }, { once: true })}
    >
      <Rig />
      <hemisphereLight args={[look.sky, look.ground, 1.25]} />
      <spotLight position={[3.5, 9, 6]} angle={0.42} penumbra={0.9} intensity={look.key} decay={0} castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.02} />
      <directionalLight position={[-5, 3, -5]} intensity={0.7} color={look.sky} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 6, -4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color={look.sky} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffd59a" position={[4, 3, 4]} scale={2} />
        <Lightformer form="rect" intensity={1} position={[0, 1, 8]} scale={[8, 4, 1]} />
      </Environment>

      <Cake3D lit={lit} look={look.cake} isCut={isCut} showKnife={showKnife} cutting={cutting} />
      <TemplateProps tpl={tpl} cols={cols} people={people} />
      {/* the physics engine streams in after the cake, so the cake never waits for it */}
      <Suspense fallback={null}>
        <Balloons look={look.balloons} lit={lit} paused={!active} />
      </Suspense>

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[7, 48]} />
        <shadowMaterial transparent opacity={tpl === "pop" || tpl === "pinboard" ? 0.18 : 0.32} />
      </mesh>

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={look.bloom} radius={0.75} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
