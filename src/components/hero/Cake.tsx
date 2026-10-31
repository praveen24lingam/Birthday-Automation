import clsx from "clsx";

export function Cake({ out = false, className }: { out?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 320 300" className={clsx("cake block h-auto w-full overflow-visible", out && "out", className)} aria-hidden>
      <defs>
        <linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff7a00" /><stop offset=".6" stopColor="#ffb020" /><stop offset="1" stopColor="#fff2b0" /></linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".22" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <ellipse className="shadow" cx="160" cy="279" rx="150" ry="14" />
      <ellipse className="plate" cx="160" cy="268" rx="138" ry="14" />
      <g className="cake-body">
        <rect className="tier1" x="46" y="188" width="228" height="78" rx="12" />
        <rect className="tier1b" x="46" y="236" width="228" height="10" />
        <rect x="46" y="188" width="228" height="78" rx="12" fill="url(#shine)" />
        <path className="frost1" d="M46 196 q0 -10 12 -10 h204 q12 0 12 10 v10 q-10 14 -20 0 q-12 18 -24 0 q-12 14 -24 0 q-12 20 -24 0 q-12 14 -24 0 q-12 18 -24 0 q-12 14 -24 0 q-12 18 -24 0 q-10 14 -20 0 z" />
        <g className="dot1"><circle cx="78" cy="226" r="3.5" /><circle cx="120" cy="252" r="3.5" /><circle cx="168" cy="228" r="3.5" /><circle cx="214" cy="254" r="3.5" /><circle cx="250" cy="226" r="3.5" /></g>
        <g className="dot2"><rect x="96" y="232" width="9" height="3.5" rx="1.75" transform="rotate(30 100 233)" /><rect x="190" y="236" width="9" height="3.5" rx="1.75" transform="rotate(-25 194 237)" /><rect x="146" y="250" width="9" height="3.5" rx="1.75" /></g>
        <rect className="tier2" x="84" y="128" width="152" height="64" rx="10" />
        <rect x="84" y="128" width="152" height="64" rx="10" fill="url(#shine)" />
        <path className="frost2" d="M84 136 q0 -8 10 -8 h132 q10 0 10 8 v6 q-9 14 -18 0 q-10 18 -20 0 q-10 12 -20 0 q-10 18 -20 0 q-10 12 -20 0 q-10 18 -20 0 q-10 12 -20 0 q-8 12 -14 0 z" />
        <g className="dot3"><circle cx="110" cy="172" r="4" /><circle cx="160" cy="176" r="4" /><circle cx="210" cy="172" r="4" /></g>
        <rect className="cd1" x="117" y="82" width="12" height="48" rx="3" /><path d="M117 92 l12 -6 v8 l-12 6z M117 108 l12 -6 v8 l-12 6z" fill="#fff" opacity=".6" />
        <rect className="cd2" x="154" y="70" width="12" height="60" rx="3" /><path d="M154 80 l12 -6 v8 l-12 6z M154 96 l12 -6 v8 l-12 6z M154 112 l12 -6 v8 l-12 6z" fill="#fff" opacity=".6" />
        <rect className="cd3" x="191" y="82" width="12" height="48" rx="3" /><path d="M191 92 l12 -6 v8 l-12 6z M191 108 l12 -6 v8 l-12 6z" fill="#fff" opacity=".6" />
        <g stroke="#2b1747" strokeWidth="2" strokeLinecap="round"><path d="M123 82 v-6" /><path d="M160 70 v-6" /><path d="M197 82 v-6" /></g>
      </g>
      <circle className="glowc" cx="123" cy="62" r="20" /><circle className="glowc" cx="160" cy="50" r="22" /><circle className="glowc" cx="197" cy="62" r="20" />
      <path className="flame f1" d="M123 50 c8 10 9 18 0 26 c-9 -8 -8 -16 0 -26z" fill="url(#flameG)" />
      <path className="flame f2" d="M160 38 c8 10 9 18 0 26 c-9 -8 -8 -16 0 -26z" fill="url(#flameG)" />
      <path className="flame f3" d="M197 50 c8 10 9 18 0 26 c-9 -8 -8 -16 0 -26z" fill="url(#flameG)" />
      <g fill="none" stroke="#cbbfe0" strokeWidth="3" strokeLinecap="round">
        <path className="smoke k1" d="M123 72 q-6 -8 0 -16 q6 -8 0 -16" />
        <path className="smoke k2" d="M160 60 q-6 -8 0 -16 q6 -8 0 -16" />
        <path className="smoke k3" d="M197 72 q-6 -8 0 -16 q6 -8 0 -16" />
      </g>
    </svg>
  );
}
