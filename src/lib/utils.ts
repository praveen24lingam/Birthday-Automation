export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MON = MONTHS.map((m) => m.slice(0, 3));
const PALETTE = ["#ffb020", "#ff8fab", "#5fd0c9", "#b9a3ff", "#ffc48c", "#ffe08a", "#8fd694"];

export const hash = (s: string) => { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x); };
export const colorFor = (id: string) => PALETTE[hash(id) % PALETTE.length];
export const initials = (name: string) => { const p = (name || "?").trim().split(/\s+/); return ((p[0] || "?")[0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase(); };
export const firstName = (name: string) => (name || "").trim().split(/\s+/)[0] || name;

export const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const curMonth = () => ym(new Date());
export const nextMonth = () => { const d = new Date(); return ym(new Date(d.getFullYear(), d.getMonth() + 1, 1)); };
export const monthName = (key: string) => { const [y, m] = key.split("-"); return `${MONTHS[+m - 1]} ${y}`; };
export const monthOnly = (key: string) => MONTHS[+key.split("-")[1] - 1];
export const todayKey = () => { const n = new Date(); return `${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`; };
export const fmtBday = (b?: string, long = false) => {
  if (!b) return "";
  const m = +b.slice(0, 2), d = +b.slice(3);
  if (!m || !d) return "";
  return `${d} ${long ? MONTHS[m - 1] : MON[m - 1]}`;
};
export const parseBday = (raw?: string) => {
  const s = String(raw || "").trim(); if (!s) return "";
  let m: RegExpMatchArray | null, d = 0, mo = 0;
  const monFrom = (w: string) => MON.findIndex((x) => x.toLowerCase() === w.slice(0, 3).toLowerCase()) + 1;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) { mo = +m[2]; d = +m[3]; }
  else if ((m = s.match(/^(\d{1,2})[\/\-. ](\d{1,2})(?:[\/\-. ]\d{2,4})?$/))) { d = +m[1]; mo = +m[2]; }
  else if ((m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s-]*([A-Za-z]{3,})/))) { d = +m[1]; mo = monFrom(m[2]); }
  else if ((m = s.match(/^([A-Za-z]{3,})[\s-]*(\d{1,2})/))) { mo = monFrom(m[1]); d = +m[2]; }
  if (!mo || !d || mo > 12 || d > 31) return "";
  return `${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};
export const ago = (ts: number) => {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = new Date(ts); return `${d.getDate()} ${MON[d.getMonth()]}`;
};

const BAD = ["fuck", "shit", "bitch", "bastard", "asshole", "cunt", "dick", "slut", "whore", "chutiya", "chutia", "madarchod", "behenchod", "bhenchod", "bsdk", "gandu", "randi", "harami"];
const badRe = new RegExp(`\\b(${BAD.join("|")})\\w*`, "gi");
export const cleanText = (s: string) => s.replace(badRe, (w) => w[0] + "*".repeat(w.length - 1));
export const linkCount = (s: string) => (s.match(/https?:\/\/|www\./gi) || []).length;
export const newId = (prefix: string, name = "") => `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20)}-${Math.random().toString(36).slice(2, 8)}`;

export const sortPeople = <T extends { bday?: string; name: string }>(list: T[]) =>
  list.slice().sort((a, b) => {
    if (a.bday && b.bday && a.bday !== b.bday) return a.bday < b.bday ? -1 : 1;
    if (a.bday && !b.bday) return -1;
    if (!a.bday && b.bday) return 1;
    return a.name.localeCompare(b.name);
  });

export const monthOf = (doc: { month?: string; createdAt?: number }) => doc.month || (doc.createdAt ? ym(new Date(doc.createdAt)) : curMonth());

export const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

export function compressImage(file: File, maxSide: number, maxChars: number, square: boolean): Promise<string> {
  return new Promise((res, rej) => {
    const isImg = file.type ? file.type.startsWith("image/") : /\.(jpe?g|png|webp|avif|gif|bmp|heic|heif)$/i.test(file.name);
    if (!isImg) return rej(new Error("type"));
    if (file.size > 15 * 1024 * 1024) return rej(new Error("size"));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      let sx = 0, sy = 0, sw = w, sh = h;
      if (square) {
        const s = Math.min(w, h);
        sx = (w - s) / 2;
        sy = Math.max(0, (h - s) / 2.6);
        sw = sh = s;
      }
      const draw = (scale: number) => {
        const c = document.createElement("canvas");
        c.width = Math.max(32, Math.round(sw * scale));
        c.height = Math.max(32, Math.round(sh * scale));
        const x = c.getContext("2d")!;
        x.imageSmoothingQuality = "high";
        x.fillStyle = "#ffffff";
        x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        return c;
      };

      let scale = Math.min(1, maxSide / Math.max(sw, sh));
      let c = draw(scale);
      let q = 0.85;
      let d = c.toDataURL("image/jpeg", q);

      while (d.length > maxChars && q > 0.35) {
        q -= 0.1;
        d = c.toDataURL("image/jpeg", q);
      }
      while (d.length > maxChars && scale > 0.15) {
        scale *= 0.75;
        c = draw(scale);
        d = c.toDataURL("image/jpeg", Math.max(0.4, q));
      }
      URL.revokeObjectURL(url);
      res(d);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rej(new Error("read"));
    };
    img.src = url;
  });
}
export const imgErr = (e: unknown) => {
  const m = e instanceof Error ? e.message : "";
  return m === "type" ? "Please choose an image file (JPG, PNG, WebP, etc.)." : m === "size" ? "That photo is over 15 MB. Please choose a smaller one." : "That image couldn’t be loaded. Try another photo.";
};
