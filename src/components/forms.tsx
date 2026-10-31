"use client";
import { useEffect, useRef, useState } from "react";
import { useBoard } from "./providers";
import { cleanText, compressImage, curMonth, imgErr, linkCount, store } from "@/lib/utils";
import { smallBurst } from "@/lib/celebrate";
import { sfx } from "@/lib/audio";
import { TEMPLATES } from "@/lib/templates";
import { GiftSuccessModal } from "./ui/GiftSuccessModal";

function useName() {
  const [name, setName] = useState("");
  const { viewer } = useBoard();
  useEffect(() => { setName(store.get("bb-name") || viewer?.name || ""); }, [viewer]);
  return [name, (v: string) => { setName(v); }] as const;
}

function cooldown(kind: string) {
  const last = +(store.get(`bb-last-${kind}`) || 0);
  return Date.now() - last < 15000;
}

export function WishForm({ onPosted }: { onPosted?: () => void }) {
  const { monthPeople, repo, viewer, viewMonth, tpl, toast } = useBoard();
  const [name, setName] = useName();
  const [to, setTo] = useState("all");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [recipient, setRecipient] = useState("Everyone");
  const btn = useRef<HTMLButtonElement>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setErr("");
    if ((e.currentTarget.elements.namedItem("website") as HTMLInputElement).value) return;
    if (viewMonth !== curMonth()) return setErr("You’re previewing next month. Switch back to this month to post.");
    if (name.trim().length < 2) return setErr("Add your name so they know who it’s from.");
    if (text.trim().length < 2) return setErr("Write a wish first.");
    if (linkCount(text) > 1) return setErr("Wishes can include at most one link.");
    if (cooldown("wish")) return setErr("You just posted. Wait a few seconds before posting again.");
    const p = monthPeople.find((x) => x.id === to);
    setBusy(true);
    try {
      await repo.addWish({ from: cleanText(name.trim()).slice(0, 60), to: p ? p.id : "all", toName: p ? p.name : "", text: cleanText(text.trim()).slice(0, 300), createdAt: Date.now(), month: curMonth(), uid: viewer!.uid, pinned: false });
      store.set("bb-name", name.trim()); store.set("bb-last-wish", String(Date.now()));
      setRecipient(p ? p.name : "Everyone");
      setText("");
      toast("Wish posted");
      sfx("post");
      smallBurst(TEMPLATES[tpl].confetti, btn.current);
      setShowGift(true);
      onPosted?.();
    } catch { setErr("That didn’t post. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  return (
    <>
      <form onSubmit={submit} noValidate className="panel grid gap-4 p-5 lg:sticky lg:top-24">
        <h2 className="text-[1.6rem]">Write a wish</h2>
        <div className="field"><label htmlFor="wName">Your name</label><input id="wName" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" /></div>
        <div className="field"><label htmlFor="wTo">Who is it for?</label>
          <select id="wTo" className="input" value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="all">Everyone</option>
            {monthPeople.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="wText">Your wish</label>
          <textarea id="wText" className="input" value={text} onChange={(e) => setText(e.target.value)} maxLength={300} />
          <span className="justify-self-end text-xs text-muted">{text.length} / 300</span>
        </div>
        <div className="hp" aria-hidden><label htmlFor="website">Leave empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
        {err && <p role="alert" className="err">{err}</p>}
        <button ref={btn} className="btn btn-primary justify-self-start" disabled={busy}>{busy ? "Posting…" : "Post wish"}</button>
      </form>
      <GiftSuccessModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
        recipientName={recipient}
      />
    </>
  );
}

export function MemoryForm() {
  const { monthPeople, repo, viewer, viewMonth, isTeam, snap, toast } = useBoard();
  const [name, setName] = useName();
  const [about, setAbout] = useState("");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const needsOk = snap.config.approvePhotos !== false && !isTeam;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setErr("");
    if ((e.currentTarget.elements.namedItem("website") as HTMLInputElement).value) return;
    if (viewMonth !== curMonth()) return setErr("You’re previewing next month. Switch back to this month to post.");
    if (name.trim().length < 2) return setErr("Add your name so people know who shared it.");
    const p = monthPeople.find((x) => x.id === about);
    if (!p) return setErr("Choose who the memory is about.");
    if (text.trim().length < 10 && !photo) return setErr("Tell the story in a sentence or two, or add a photo.");
    if (linkCount(text) > 2) return setErr("Memories can include at most two links.");
    if (cooldown("memory")) return setErr("You just posted. Wait a few seconds before posting again.");
    setBusy(true);
    try {
      await repo.addMemory({ from: cleanText(name.trim()).slice(0, 60), about: p.id, aboutName: p.name, text: cleanText(text.trim()).slice(0, 1000), createdAt: Date.now(), month: curMonth(), uid: viewer!.uid, photo, photoStatus: photo ? (needsOk ? "pending" : "approved") : "" });
      store.set("bb-name", name.trim()); store.set("bb-last-memory", String(Date.now()));
      toast(photo && needsOk ? "Memory shared. The photo shows once the birthday team approves it." : "Memory shared");
      sfx("post"); setText(""); setPhoto("");
    } catch { setErr("That didn’t post. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="panel grid gap-4 p-5 lg:sticky lg:top-24">
      <h2 className="text-[1.6rem]">Share a memory</h2>
      <div className="field"><label htmlFor="mName">Your name</label><input id="mName" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" /></div>
      <div className="field"><label htmlFor="mAbout">Who is it about?</label>
        <select id="mAbout" className="input" value={about} onChange={(e) => setAbout(e.target.value)}>
          <option value="">Choose a person</option>
          {monthPeople.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="mText">Your memory</label>
        <textarea id="mText" className="input min-h-40" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
        <span className="justify-self-end text-xs text-muted">{text.length} / 1000</span>
      </div>
      <div className="field">
        <span className="lbl">Photo (optional)</span>
        <div className="flex flex-wrap items-center gap-3">
          {photo && <img src={photo} alt="Photo you’re adding" className="h-16 w-16 rounded-xl border-2 border-line object-cover" />}
          <label htmlFor="mPhoto" className="btn btn-sm cursor-pointer">{photo ? "Change photo" : "Add a photo"}</label>
          <input id="mPhoto" type="file" accept="image/*" className="sr-only"
            onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; setErr(""); try { setPhoto(await compressImage(f, 1100, 300_000, false)); } catch (x) { setErr(imgErr(x)); } }} />
          {photo && <button type="button" className="link" onClick={() => setPhoto("")}>Remove photo</button>}
        </div>
        <p className="help">JPG, PNG, WebP or HEIC up to 15 MB.{needsOk ? " The birthday team approves photos before they show." : ""}</p>
      </div>
      <div className="hp" aria-hidden><label htmlFor="website2">Leave empty</label><input id="website2" name="website" tabIndex={-1} autoComplete="off" /></div>
      {err && <p role="alert" className="err">{err}</p>}
      <button className="btn btn-primary justify-self-start" disabled={busy}>{busy ? "Sharing…" : "Share memory"}</button>
    </form>
  );
}
