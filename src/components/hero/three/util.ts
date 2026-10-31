import * as THREE from "three";
import type { Person } from "@/lib/data/types";
import { colorFor, firstName, initials } from "@/lib/utils";

/** small seeded random, so props land in the same place every visit */
export function rng(seed: number) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
}

export function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

/** soft round dot for halos and smoke puffs */
export const softDot = () => canvasTex(64, 64, (x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
});

/** candy-cane stripes wrapped round a candle */
export const stripes = (base: string, stripe: string) => {
  const t = canvasTex(64, 256, (x) => {
    x.fillStyle = base; x.fillRect(0, 0, 64, 256);
    x.fillStyle = stripe;
    for (let y = -64; y < 320; y += 52) { x.beginPath(); x.moveTo(0, y); x.lineTo(64, y - 34); x.lineTo(64, y - 16); x.lineTo(0, y + 18); x.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

export const crescent = () => canvasTex(256, 256, (x) => {
  const g = x.createRadialGradient(118, 128, 20, 128, 128, 110);
  g.addColorStop(0, "#fffbe8"); g.addColorStop(1, "#f6d36b");
  x.fillStyle = g; x.beginPath(); x.arc(128, 128, 104, 0, Math.PI * 2); x.fill();
  x.globalCompositeOperation = "destination-out";
  x.beginPath(); x.arc(176, 100, 96, 0, Math.PI * 2); x.fill();
});

/** polaroid with the person's photo (or initials) and first name in handwriting */
export function polaroid(p: Person) {
  const W = 256, H = 300;
  const paint = (x: CanvasRenderingContext2D, img?: HTMLImageElement) => {
    x.fillStyle = "#fbf8f1"; x.fillRect(0, 0, W, H);
    if (img) x.drawImage(img, 18, 18, 220, 220);
    else {
      x.fillStyle = colorFor(p.id); x.fillRect(18, 18, 220, 220);
      x.fillStyle = "#2b1747"; x.font = "400 92px 'Rozha One', Georgia, serif"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(initials(p.name), 128, 134);
    }
    x.fillStyle = "#2b1d12"; x.font = "700 40px Caveat, 'Segoe Print', cursive"; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(firstName(p.name).slice(0, 12), 128, 270);
  };
  let photo: HTMLImageElement | undefined;
  const tex = canvasTex(W, H, (x) => paint(x));
  const redraw = () => { paint((tex.image as HTMLCanvasElement).getContext("2d")!, photo); tex.needsUpdate = true; };
  document.fonts?.load("700 40px Caveat").then(redraw).catch(() => {});
  if (p.photo) { const img = new Image(); img.onload = () => { photo = img; redraw(); }; img.src = p.photo; }
  return tex;
}
