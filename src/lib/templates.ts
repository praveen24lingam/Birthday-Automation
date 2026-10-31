import type { TemplateKey } from "./data/types";

export type TemplateInfo = {
  key: TemplateKey;
  name: string;
  desc: string;
  swatch: string;
  cols: string[];
  confetti: string[];
};

export const TEMPLATES: Record<TemplateKey, TemplateInfo> = {
  party: { key: "party", name: "Party Night", desc: "Night sky with bunting, curly streamers and balloons.", swatch: "linear-gradient(180deg,#0e0928,#2a1a5c)", cols: ["#ffb020", "#ff5d86", "#18a19c", "#9b7bff"], confetti: ["#ffb020", "#ff5d86", "#18a19c", "#9b7bff", "#ffe39a", "#ffffff"] },
  mehfil: { key: "mehfil", name: "Mehfil", desc: "Maroon and gold, glowing lanterns and a slow rangoli.", swatch: "linear-gradient(180deg,#2b0716,#7a2a1a)", cols: ["#f5b942", "#e8572a", "#2aa198", "#c2185b"], confetti: ["#f5b942", "#ffd98a", "#e8572a", "#c2185b", "#fff3d6"] },
  pinboard: { key: "pinboard", name: "Pinboard", desc: "A cork board with polaroids, tape and handwritten notes.", swatch: "linear-gradient(180deg,#c99a62,#b8844c)", cols: ["#ffd166", "#ff6b6b", "#06aed5", "#8ac926"], confetti: ["#ffd166", "#ff6b6b", "#06aed5", "#8ac926", "#ffffff"] },
  starlight: { key: "starlight", name: "Starlight", desc: "Deep navy, twinkling stars, shooting stars and gold.", swatch: "linear-gradient(180deg,#040820,#16245e)", cols: ["#f6d36b", "#ffb3c7", "#8fb3ff", "#b9a3ff"], confetti: ["#f6d36b", "#ffffff", "#8fb3ff", "#ffb3c7"] },
  pop: { key: "pop", name: "Confetti Pop", desc: "Bright pastels with big bouncy balloons.", swatch: "linear-gradient(160deg,#ffd6e7,#fff1bd,#cdefff)", cols: ["#ffcb47", "#ff7eb6", "#4cc9f0", "#9d7bff"], confetti: ["#ffcb47", "#ff7eb6", "#4cc9f0", "#9d7bff", "#7bd389"] },
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATES) as TemplateKey[];
