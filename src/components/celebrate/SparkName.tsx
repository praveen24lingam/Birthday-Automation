"use client";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/three/support";

export type SparkNameProps = {
  names: string[];
  currentNameIndex: number;
  origin: { x: number; y: number } | null;
  onNameSettled: (index: number) => void;
  active: boolean;
};

type Spark = {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  cx: number;
  cy: number;
  t0: number;
  dur: number;
  r: number;
  col: string;
  ph: number;
};

export function SparkName({ names, currentNameIndex, origin, onNameSettled, active }: SparkNameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const isSettledRef = useRef(false);

  useEffect(() => {
    if (!active || !names.length) return;
    const name = names[currentNameIndex] || "";
    if (!name) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);

    // If reduced motion, skip particle flight and settle immediately
    if (prefersReducedMotion()) {
      onNameSettled(currentNameIndex);
      return;
    }

    // Default flame origin at center bottom if not yet measured
    const ox = origin?.x ?? W / 2;
    const oy = origin?.y ?? H * 0.78;

    // Rasterize text on an offscreen canvas to sample particle targets
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;

    // Responsive font sizing based on viewport and name length
    const maxChars = name.length;
    const baseFontSize = Math.min(
      W < 640 ? 46 : 74,
      Math.max(28, Math.floor((W * 0.88) / (maxChars * 0.58)))
    );
    const font = `700 ${baseFontSize}px 'Rozha One', 'Yatra One', Georgia, serif`;
    octx.font = font;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#ffffff";

    // Target text vertical center is in the upper third of screen
    const targetY = H < 680 ? H * 0.32 : H * 0.36;
    octx.fillText(name, W / 2, targetY);

    const imgData = octx.getImageData(0, 0, W, H).data;
    const pts: [number, number][] = [];
    const gap = Math.max(3, Math.round(baseFontSize / (W < 640 ? 12 : 16)));

    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        if (imgData[(y * W + x) * 4 + 3] > 140) {
          pts.push([x, y]);
        }
      }
    }

    // Cap particles for smooth 60fps on mobile
    const cap = W < 640 ? 1100 : 2200;
    let sampled = pts;
    if (pts.length > cap) {
      const step = pts.length / cap;
      sampled = [];
      for (let k = 0; k < pts.length; k += step) {
        sampled.push(pts[Math.floor(k)]);
      }
    }

    // Sort/group by X so the fountain writes somewhat left-to-right
    let minX = Infinity,
      maxX = -Infinity;
    sampled.forEach(([px]) => {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
    });
    const span = Math.max(1, maxX - minX);

    const t0 = performance.now() / 1000;
    const duration = 2.2;
    const cols = ["#fff6d0", "#ffd479", "#ffb020", "#ffc24d", "#ff8a00", "#ffffff"];

    const sparks: Spark[] = sampled.map(([tx, ty]) => {
      const along = (tx - minX) / span;
      const sx = ox + (Math.random() - 0.5) * 16;
      const sy = oy + (Math.random() - 0.5) * 10;
      // High arching arc control point
      const cx = (sx + tx) / 2 + (Math.random() - 0.5) * W * 0.28;
      const cy = Math.min(sy, ty) - H * (0.12 + Math.random() * 0.26);

      return {
        sx,
        sy,
        tx,
        ty,
        cx,
        cy,
        t0: t0 + along * duration * 0.5 + Math.random() * 0.35,
        dur: duration * (0.42 + Math.random() * 0.22),
        r: Math.max(1.1, gap * 0.36),
        col: cols[Math.floor(Math.random() * cols.length)],
        ph: Math.random() * Math.PI * 2,
      };
    });

    sparksRef.current = sparks;
    isSettledRef.current = false;

    let notifiedSettled = false;

    const render = (nowMs: number) => {
      const tnow = nowMs / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      let allArrived = true;

      for (let i = 0; i < sparks.length; i++) {
        const p = sparks[i];
        const u = (tnow - p.t0) / p.dur;

        if (u < 0) {
          allArrived = false;
          continue;
        }

        if (u < 1) {
          allArrived = false;
        }

        const clampedU = Math.min(1, u);
        // Ease out cubic
        const e = 1 - Math.pow(1 - clampedU, 3);

        // Quadratic Bezier interpolation
        const inv = 1 - e;
        const x = inv * inv * p.sx + 2 * inv * e * p.cx + e * e * p.tx;
        const y = inv * inv * p.sy + 2 * inv * e * p.cy + e * e * p.ty;

        // Twinkle factor
        const tw = clampedU >= 1 ? 0.7 + 0.3 * Math.sin(tnow * 6 + p.ph) : 1;
        ctx.globalAlpha = Math.min(1, clampedU * 3) * tw;
        ctx.fillStyle = p.col;

        // Draw spark particle
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Flying spark head aura
        if (clampedU < 0.94) {
          ctx.globalAlpha = 0.25 * tw;
          ctx.beginPath();
          ctx.arc(x, y, p.r * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (allArrived && !notifiedSettled) {
        notifiedSettled = true;
        isSettledRef.current = true;
        onNameSettled(currentNameIndex);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, currentNameIndex, names, origin, onNameSettled]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      aria-hidden
    />
  );
}

