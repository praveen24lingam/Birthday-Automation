"use client";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let webgl: boolean | null = null;
export function hasWebGL() {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { webgl = false; }
  return webgl;
}

/** 3D only when the device can draw it and the person hasn't asked for less motion */
export const canUse3D = () => typeof window !== "undefined" && hasWebGL() && !prefersReducedMotion();
