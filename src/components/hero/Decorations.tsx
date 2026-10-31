"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { canUse3D } from "@/lib/three/support";
import type { Person, TemplateKey } from "@/lib/data/types";
import { TEMPLATES } from "@/lib/templates";
import { colorFor, initials } from "@/lib/utils";

/**
 * Animated scenery behind the hero, one scene per template.
 * Built imperatively with SVG + GSAP (gsap.context cleans everything up),
 * with gentle mouse parallax on desktop.
 */
const NS = "http://www.w3.org/2000/svg";
type Attrs = Record<string, string | number>;
function sv<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs, parent?: Element) {
  const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, String(attrs[k])); parent?.appendChild(e); return e;
}
const place = (el: HTMLElement | SVGElement, css: Partial<CSSStyleDeclaration>) => { Object.assign(el.style, css); return el; };
function rnd(seed: number) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646); }

function balloon(color: string, w: number, string = "#cbbfe0") {
  const s = sv("svg", { viewBox: "0 0 70 150", width: w, height: (w * 150) / 70 });
  sv("path", { d: "M35 86 q-6 20 4 36 q8 14 -2 28", fill: "none", stroke: string, "stroke-width": 1.5, opacity: 0.7 }, s);
  sv("ellipse", { cx: 35, cy: 42, rx: 31, ry: 38, fill: color }, s);
  sv("path", { d: "M30 80 h10 l-5 7z", fill: color }, s);
  sv("ellipse", { cx: 24, cy: 28, rx: 7, ry: 11, fill: "#fff", opacity: 0.38 }, s);
  return s;
}

type Scene = (box: HTMLDivElement, W: number, H: number, cols: string[], people: Person[], motion: boolean) => void;

const float = (el: Element, amp: number, dur: number, motion: boolean) => motion && gsap.to(el, { y: `-=${amp}`, rotation: `+=${amp / 6}`, duration: dur, yoyo: true, repeat: -1, ease: "sine.inOut" });
const sway = (el: Element, deg: number, dur: number, motion: boolean) => { if (!motion) return; gsap.set(el, { transformOrigin: "50% 0%" }); gsap.fromTo(el, { rotation: -deg }, { rotation: deg, duration: dur, yoyo: true, repeat: -1, ease: "sine.inOut" }); };

const party: Scene = (box, W, H, cols, _p, motion) => {
  const bunt = sv("svg", { viewBox: `0 0 ${W} 90`, width: W, height: 90 }); place(bunt, { left: "0", top: "0" });
  const top = 8, c = 80;
  sv("path", { d: `M0 ${top} Q${W / 2} ${c} ${W} ${top}`, fill: "none", stroke: "#e7dcf6", "stroke-width": 2, opacity: 0.8 }, bunt);
  const n = Math.max(6, Math.floor(W / 46)), flags: SVGElement[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = W * t, y = (1 - t) * (1 - t) * top + 2 * t * (1 - t) * c + t * t * top;
    flags.push(sv("path", { d: `M${x - 15} ${y} L${x + 15} ${y} L${x} ${y + 32} Z`, fill: cols[i % cols.length] }, bunt));
  }
  box.appendChild(bunt);
  if (motion) gsap.from(flags, { scaleY: 0, transformOrigin: "50% 0%", duration: 0.5, stagger: 0.025, ease: "back.out(2)" });
  const pos = W < 700 ? [[0.02, 0], [0.92, 3]] : [[0.03, 0], [0.11, 1], [0.86, 2], [0.94, 3]];
  pos.forEach(([px, k]) => {
    const hgt = W < 700 ? 150 : 210 - (k % 2) * 40, s = sv("svg", { viewBox: `0 0 36 ${hgt}`, width: 36, height: hgt });
    let d = "";
    for (let t = 0; ; t += 0.14) { const x = 18 + 11 * Math.sin(t + k), y = 3.1 * t - 7 * Math.cos(t + k) + 7; if (y > hgt - 6) break; d += `${d ? " L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }
    sv("path", { d, fill: "none", stroke: cols[(k + 1) % cols.length], "stroke-width": 4, "stroke-linecap": "round" }, s);
    place(s, { left: `${px * W}px`, top: "16px" }); box.appendChild(s); sway(s, 4, 3 + k * 0.4, motion);
  });
  const bal = W < 700 ? [[-0.02, 0.8, 52], [0.88, 0.72, 52]] : [[0.05, 0.62, 74], [0.14, 0.48, 56], [0.84, 0.56, 74], [0.92, 0.4, 54]];
  bal.forEach(([bx, by, w], k) => { const s = balloon(cols[(k + 1) % cols.length], w); place(s, { left: `${bx * W}px`, top: `${by * H}px` }); s.dataset.depth = String(0.6 + k * 0.3); box.appendChild(s); float(s, 18, 3 + k * 0.6, motion); });
};

const mehfil: Scene = (box, W, H, cols, _p, motion) => {
  const size = Math.min(W * 0.95, 720);
  const rg = sv("svg", { viewBox: "-100 -100 200 200", width: size, height: size });
  place(rg, { left: `${(W - size) / 2}px`, top: `${H * 0.6 - size / 2}px`, opacity: "0.16" });
  [[22, 10, 2], [38, 18, 1.8], [54, 26, 1.6], [70, 34, 1.4], [86, 42, 1.2]].forEach(([r, n, cr], ri) => {
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + ri * 0.2; sv("circle", { cx: (Math.cos(a) * r).toFixed(2), cy: (Math.sin(a) * r).toFixed(2), r: cr, fill: ri % 2 ? "#f5b942" : "#ffd98a" }, rg); }
  });
  for (let k = 0; k < 12; k++) sv("path", { d: "M0 -26 C 9 -40, 9 -54, 0 -66 C -9 -54, -9 -40, 0 -26 Z", fill: "none", stroke: k % 2 ? "#e8572a" : "#2aa198", "stroke-width": 1, transform: `rotate(${k * 30})` }, rg);
  box.appendChild(rg);
  if (motion) gsap.to(rg, { rotation: 360, duration: 160, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  const spots = W < 700 ? [[0.1, 110], [0.9, 150]] : [[0.06, 120], [0.16, 190], [0.84, 160], [0.94, 110], [0.28, 70], [0.72, 80]];
  spots.forEach(([sx, len], i) => {
    const s = sv("svg", { viewBox: `0 0 60 ${len + 90}`, width: 60, height: len + 90 });
    sv("line", { x1: 30, y1: 0, x2: 30, y2: len, stroke: "#f3d9b8", "stroke-width": 1.2, opacity: 0.7 }, s);
    const gid = `lg${i}`, df = sv("defs", {}, s), rgd = sv("radialGradient", { id: gid }, df);
    sv("stop", { offset: "0", "stop-color": "#fff3c4" }, rgd); sv("stop", { offset: ".55", "stop-color": cols[i % 2 ? 1 : 0] }, rgd); sv("stop", { offset: "1", "stop-color": "#7a1530" }, rgd);
    const glow = sv("circle", { cx: 30, cy: len + 32, r: 34, fill: cols[0], opacity: 0.18 }, s);
    sv("rect", { x: 20, y: len, width: 20, height: 6, rx: 2, fill: "#f5b942" }, s);
    sv("path", { d: `M30 ${len + 6} c 24 6, 24 46, 0 52 c -24 -6, -24 -46, 0 -52z`, fill: `url(#${gid})` }, s);
    sv("path", { d: `M30 ${len + 6} v52 M18 ${len + 14} q -4 18 0 36 M42 ${len + 14} q 4 18 0 36`, stroke: "#7a1530", "stroke-width": 1, fill: "none", opacity: 0.4 }, s);
    sv("rect", { x: 22, y: len + 56, width: 16, height: 5, rx: 2, fill: "#f5b942" }, s);
    sv("path", { d: `M26 ${len + 61} v18 M30 ${len + 61} v22 M34 ${len + 61} v18`, stroke: "#e8572a", "stroke-width": 1.5 }, s);
    place(s, { left: `${sx * W - 30}px`, top: "-4px" }); box.appendChild(s); sway(s, 3, 2.6 + i * 0.3, motion);
    if (motion) gsap.to(glow, { opacity: 0.34, duration: 1.2 + i * 0.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  });
};

const pinboard: Scene = (box, W, H, cols, people, motion) => {
  const bunt = sv("svg", { viewBox: `0 0 ${W} 80`, width: W, height: 80 }); place(bunt, { left: "0", top: "0" });
  const n = Math.max(6, Math.floor(W / 52)); let d = "M0 6"; const flags: SVGElement[] = [];
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * W, y = 6 + 26 * Math.sin((Math.PI * (i + 0.5)) / n);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    flags.push(sv("path", { d: `M${x - 16} ${y} h32 v20 a16 16 0 0 1 -32 0z`, fill: cols[i % cols.length], stroke: "rgba(0,0,0,.12)" }, bunt));
  }
  bunt.insertBefore(sv("path", { d: `${d} L${W} 6`, fill: "none", stroke: "#fffaf0", "stroke-width": 2 }), bunt.firstChild);
  box.appendChild(bunt);
  if (motion) gsap.from(flags, { y: -30, opacity: 0, duration: 0.5, stagger: 0.03, ease: "back.out(2)" });
  const spots = W < 560 ? [] : W < 900 ? [[0.01, 0.3, -8], [0.86, 0.62, 7]] : [[0.04, 0.2, -8], [0.83, 0.26, 7], [0.07, 0.6, 5], [0.86, 0.66, -6]];
  spots.forEach(([sx, sy, rot], i) => {
    const p = people[i], size = W < 900 ? 90 : 120;
    const pol = document.createElement("div");
    pol.style.cssText = `position:absolute;width:${size}px;background:#fffdf7;padding:7px 7px 24px;box-shadow:0 8px 18px rgba(60,30,0,.35);left:${sx * W}px;top:${sy * H}px;transform:rotate(${rot}deg)`;
    const face = document.createElement("div");
    face.style.cssText = `width:100%;aspect-ratio:1;display:grid;place-items:center;font:700 ${size / 3}px Caveat,cursive;color:#2b1d12;background:${p ? colorFor(p.id) : cols[i % cols.length]};overflow:hidden`;
    if (p?.photo) { const img = document.createElement("img"); img.src = p.photo; img.alt = ""; img.style.cssText = "width:100%;height:100%;object-fit:cover"; face.appendChild(img); }
    else face.textContent = p ? initials(p.name) : "♥";
    const cap = document.createElement("div"); cap.textContent = p ? p.name.split(" ")[0] : "";
    cap.style.cssText = `position:absolute;left:0;right:0;bottom:2px;text-align:center;font:700 ${size / 6.5}px Caveat,cursive;color:#2b1d12`;
    const tape = document.createElement("div");
    tape.style.cssText = `position:absolute;top:-10px;left:50%;width:${size * 0.55}px;height:18px;transform:translateX(-50%) rotate(${i % 2 ? 4 : -5}deg);background:${cols[(i + 2) % cols.length]};opacity:.8`;
    pol.append(face, cap, tape); pol.dataset.depth = String(0.8 + i * 0.25); box.appendChild(pol);
    if (motion) gsap.from(pol, { y: -70, opacity: 0, rotation: rot * 3, duration: 0.9, delay: 0.2 + i * 0.12, ease: "back.out(1.4)", onComplete: () => { float(pol, 5, 2.8 + i * 0.5, motion); } });
  });
};

const starlight: Scene = (box, W, H, _cols, _p, motion) => {
  const s = sv("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H }); place(s, { left: "0", top: "0" });
  const df = sv("defs", {}, s), lg = sv("linearGradient", { id: "shootG" }, df);
  sv("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": "0" }, lg); sv("stop", { offset: "1", "stop-color": "#fff" }, lg);
  const r = rnd(7 + Math.round(W)), stars: SVGElement[] = [];
  for (let i = 0; i < Math.round((W * H) / 6000); i++) stars.push(sv("circle", { cx: (r() * W).toFixed(1), cy: (r() * H * 0.9).toFixed(1), r: (r() * 1.4 + 0.4).toFixed(2), fill: r() > 0.85 ? "#f6d36b" : "#ffffff", opacity: (r() * 0.6 + 0.3).toFixed(2) }, s));
  const mx = W < 700 ? W * 0.82 : W * 0.86;
  if (!canUse3D()) {
    const moon = sv("g", {}, s);
    sv("circle", { cx: mx, cy: 120, r: 32, fill: "#fdf3cf" }, moon); sv("circle", { cx: mx + 14, cy: 109, r: 30, fill: "#0b1640" }, moon);
  }
  const cons = [[0.07, 0.18], [0.13, 0.26], [0.2, 0.22], [0.25, 0.32], [0.18, 0.4]].map(([a, b]) => [a * W, b * H]);
  sv("polyline", { points: cons.map((p) => p.join(",")).join(" "), fill: "none", stroke: "#f6d36b", "stroke-width": 1, opacity: 0.45 }, s);
  cons.forEach(([cx, cy]) => sv("circle", { cx, cy, r: 2.6, fill: "#f6d36b" }, s));
  const shoot = sv("line", { x1: 0, y1: 0, x2: 110, y2: 36, stroke: "url(#shootG)", "stroke-width": 2, "stroke-linecap": "round", opacity: 0 }, s);
  box.appendChild(s);
  if (motion) {
    stars.forEach((st, k) => { if (k % 3 === 0) gsap.to(st, { opacity: 0.08, duration: 1 + (k % 7) * 0.3, yoyo: true, repeat: -1, ease: "sine.inOut", delay: (k % 11) * 0.2 }); });
    gsap.timeline({ repeat: -1, repeatDelay: 4 })
      .set(shoot, { x: W * 0.15, y: H * 0.08, opacity: 0 })
      .to(shoot, { x: W * 0.55, y: H * 0.24, opacity: 1, duration: 0.5, ease: "power1.in" })
      .to(shoot, { opacity: 0, duration: 0.25 });
  }
};

const pop: Scene = (box, W, H, cols, _p, motion) => {
  const r = rnd(42 + Math.round(W)), bits = sv("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H }); place(bits, { left: "0", top: "0" });
  for (let i = 0; i < 46; i++) {
    const x = r() * W, y = r() * H, side = x < W * 0.28 || x > W * 0.72;
    if (!side && y > 80) continue;
    const c = cols[i % cols.length];
    if (i % 3 === 0) sv("circle", { cx: x, cy: y, r: 4 + r() * 4, fill: c, opacity: 0.8 }, bits);
    else if (i % 3 === 1) sv("rect", { x, y, width: 10, height: 5, rx: 2.5, fill: c, transform: `rotate(${r() * 180} ${x} ${y})` }, bits);
    else sv("path", { d: `M${x} ${y} q 6 -8 12 0 t 12 0`, stroke: c, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, bits);
  }
  box.appendChild(bits);
  const bal = W < 700 ? [[-0.03, 0.52, 64], [0.84, 0.6, 64]] : [[0.03, 0.42, 100], [0.12, 0.58, 74], [0.2, 0.3, 58], [0.78, 0.34, 62], [0.85, 0.5, 100], [0.93, 0.28, 72]];
  bal.forEach(([bx, by, w], k) => {
    const s = balloon(cols[k % cols.length], w, "#7a6a96"); place(s, { left: `${bx * W}px`, top: `${by * H}px` }); s.dataset.depth = String(0.5 + (k % 3) * 0.4); box.appendChild(s);
    if (motion) gsap.from(s, { y: H, duration: 1.4, delay: k * 0.1, ease: "power2.out", onComplete: () => { float(s, 22, 2.4 + k * 0.4, motion); } });
  });
};

const SCENES: Record<TemplateKey, Scene> = { party, mehfil, pinboard, starlight, pop };

export function Decorations({ tpl, people }: { tpl: TemplateKey; people: Person[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const peopleKey = people.slice(0, 4).map((p) => p.id + (p.photo ? "1" : "0")).join(",");
  useLayoutEffect(() => {
    const box = ref.current; if (!box) return;
    const motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx: gsap.Context | null = null;
    const build = () => {
      ctx?.revert(); box.replaceChildren();
      const W = box.clientWidth, H = box.clientHeight; if (!W) return;
      ctx = gsap.context(() => SCENES[tpl](box, W, H, TEMPLATES[tpl].cols, people, motion), box);
    };
    build();
    let t: ReturnType<typeof setTimeout>; let lastW = box.clientWidth;
    const ro = new ResizeObserver(() => { if (Math.abs(box.clientWidth - lastW) < 40) return; lastW = box.clientWidth; clearTimeout(t); t = setTimeout(build, 150); });
    ro.observe(box);
    // mouse parallax (desktop only)
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      box.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => { const d = +(el.dataset.depth || 1); gsap.to(el, { x: dx * 26 * d, duration: 1.2, ease: "power3.out", overwrite: "auto" }); void dy; });
    };
    if (fine && motion) window.addEventListener("pointermove", onMove);
    return () => { ro.disconnect(); clearTimeout(t); window.removeEventListener("pointermove", onMove); ctx?.revert(); box.replaceChildren(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpl, peopleKey]);
  return <div ref={ref} className="deco" aria-hidden />;
}
