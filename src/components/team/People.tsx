"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBoard } from "../providers";
import { Avatar } from "../ui/Avatar";
import type { Person } from "@/lib/data/types";
import { MONTHS, compressImage, fmtBday, imgErr, monthOnly, newId, parseBday, sortPeople } from "@/lib/utils";

const empty = { name: "", day: "", month: "", group: "", note: "", photo: "" };

export function People() {
  const { snap, repo, viewMonth, toast } = useBoard();
  const [f, setF] = useState(empty);
  const [editing, setEditing] = useState<Person | null>(null);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [bulk, setBulk] = useState("");
  const [bErr, setBErr] = useState("");
  const [show, setShow] = useState<"month" | "all" | "nophoto">("month");
  const formRef = useRef<HTMLFormElement>(null);
  const mm = viewMonth.split("-")[1];
  const list = sortPeople(snap.people).filter((p) => (show === "all" ? true : show === "nophoto" ? !p.photo : p.bday?.slice(0, 2) === mm));
  const groups = Array.from(new Set(snap.people.map((p) => p.group).filter(Boolean)));

  const edit = (p: Person) => {
    setEditing(p); setErr("");
    setF({ name: p.name, day: p.bday.slice(3), month: p.bday.slice(0, 2), group: p.group || "", note: p.note || "", photo: p.photo || "" });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const reset = () => { setEditing(null); setF(empty); setErr(""); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (!f.name.trim()) return setErr("Add a name.");
    if (!f.day || !f.month) return setErr("Pick the birthday day and month, so the board knows which month to show them.");
    const p: Person = { id: editing?.id || newId("p", f.name), name: f.name.trim().slice(0, 60), bday: `${f.month}-${f.day}`, group: f.group.trim().slice(0, 40), note: f.note.trim().slice(0, 400), photo: f.photo, hidden: editing?.hidden || false, createdAt: editing?.createdAt || Date.now() };
    try { await repo.savePerson(p); toast(editing ? `Saved ${p.name}` : `${p.name} added`); reset(); } catch { setErr("Couldn’t save. Only the birthday team can change people."); }
  };

  const addBulk = async (e: React.FormEvent) => {
    e.preventDefault(); setBErr("");
    const rows = bulk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => (l.includes("\t") ? l.split("\t") : l.split("|")).map((x) => x.trim()))
      .filter((r) => r[0] && !/^name$/i.test(r[0])).map((r) => ({ name: r[0], bday: parseBday(r[1]), group: r[2] || "", note: r.slice(3).join(" | ") }));
    if (!rows.length) return setBErr("Paste at least one line.");
    let added = 0;
    for (const r of rows) { await repo.savePerson({ id: newId("p", r.name), name: r.name.slice(0, 60), bday: r.bday, group: r.group.slice(0, 40), note: r.note.slice(0, 400), photo: "", createdAt: Date.now() + added }); added++; }
    toast(`${added} ${added === 1 ? "person" : "people"} added`); setBulk("");
    const noDate = rows.filter((r) => !r.bday).length;
    if (noDate) setBErr(`${noDate} ${noDate === 1 ? "person has" : "people have"} no birthday the board could read. Find them under Everyone and add it with Edit.`);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="grid gap-6">
        <form ref={formRef} onSubmit={save} noValidate className="panel grid scroll-mt-28 gap-4 p-5">
          <h2 className="text-[1.6rem]">{editing ? `Edit ${editing.name}` : "Add a person"}</h2>
          <p className="help">People stay on the board. Each month the wall shows only the people born that month, so you add someone once and they come back every year.</p>
          <div className="field"><label htmlFor="pName">Name</label><input id="pName" className="input" value={f.name} maxLength={60} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field"><span className="lbl">Birthday</span>
              <div className="grid grid-cols-[5.5rem_1fr] gap-2">
                <select aria-label="Birthday day" className="input" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })}><option value="">Day</option>{Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => <option key={d} value={d}>{+d}</option>)}</select>
                <select aria-label="Birthday month" className="input" value={f.month} onChange={(e) => setF({ ...f, month: e.target.value })}><option value="">Month</option>{MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}</select>
              </div>
            </div>
            <div className="field"><label htmlFor="pGroup">Team or campus</label><input id="pGroup" className="input" list="groups" placeholder="Optional" value={f.group} maxLength={40} onChange={(e) => setF({ ...f, group: e.target.value })} /><datalist id="groups">{groups.map((g) => <option key={g} value={g} />)}</datalist></div>
          </div>
          <div className="field"><label htmlFor="pNote">Note on the back of the card</label><textarea id="pNote" className="input" value={f.note} maxLength={400} onChange={(e) => setF({ ...f, note: e.target.value })} /><span className="justify-self-end text-xs text-muted">{f.note.length} / 400</span></div>
          <div className="field"><span className="lbl">Photo</span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Avatar person={{ id: editing?.id, name: f.name || "?", photo: f.photo }} className="h-[72px] w-[72px] rounded-xl text-xl shadow-md border-2 border-line" />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 text-white text-xs font-bold animate-pulse">
                    Processing...
                  </div>
                )}
              </div>
              <label htmlFor="pPhoto" className={`btn btn-sm cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading ? "Loading..." : f.photo ? "Change photo" : "Choose photo"}
              </label>
              <input
                id="pPhoto"
                type="file"
                accept="image/*"
                disabled={uploading}
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setErr("");
                  setUploading(true);
                  try {
                    const compressed = await compressImage(file, 480, 250_000, true);
                    setF((prev) => ({ ...prev, photo: compressed }));
                  } catch (x) {
                    setErr(imgErr(x));
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {f.photo && (
                <button type="button" className="link text-xs text-rose-500 font-semibold" onClick={() => setF((prev) => ({ ...prev, photo: "" }))}>
                  Remove photo
                </button>
              )}
            </div>
            <div className="mt-2.5">
              <input
                type="url"
                placeholder="Or paste an image URL directly (e.g. https://...)"
                className="input text-xs py-1.5"
                value={f.photo && !f.photo.startsWith("data:") ? f.photo : ""}
                onChange={(e) => {
                  const url = e.target.value.trim();
                  setF((prev) => ({ ...prev, photo: url }));
                }}
              />
            </div>
            <p className="help">Supports JPG, PNG, WebP or HEIC up to 15 MB, or a direct image URL. It’s cropped square and optimized.</p>
          </div>
          {err && <p role="alert" className="err">{err}</p>}
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" disabled={uploading}>
              {uploading ? "Processing photo..." : editing ? "Save changes" : "Add person"}
            </button>
            {editing && <button type="button" className="btn" onClick={reset}>Cancel editing</button>}
          </div>
        </form>

        <form onSubmit={addBulk} noValidate className="panel grid gap-4 p-5">
          <h2 className="text-[1.6rem]">Add many at once</h2>
          <div className="field"><label htmlFor="bulk">One person per line</label>
            <p className="help">Paste from a spreadsheet (columns: name, birthday, team, note) or type <code className="rounded border border-line bg-[var(--field)] px-1.5">Name | 14 Nov | Team | Note</code>. Add photos afterwards with Edit.</p>
            <textarea id="bulk" className="input min-h-36" value={bulk} onChange={(e) => setBulk(e.target.value)} />
          </div>
          {bErr && <p role="alert" className="err">{bErr}</p>}
          <button className="btn btn-primary justify-self-start">Add these people</button>
        </form>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label htmlFor="pShow" className="font-semibold">Show</label>
          <select id="pShow" className="input w-auto" value={show} onChange={(e) => setShow(e.target.value as typeof show)}>
            <option value="month">Born in {monthOnly(viewMonth)}</option><option value="all">Everyone ({snap.people.length})</option><option value="nophoto">People without a photo</option>
          </select>
        </div>
        <ul className="grid gap-2">
          <AnimatePresence initial={false}>
            {list.length === 0 && <li className="text-muted">{show === "month" ? `No birthdays in ${monthOnly(viewMonth)} yet. Add people with the forms.` : "No one here."}</li>}
            {list.map((p) => (
              <motion.li key={p.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface px-3 py-2">
                <Avatar person={p} className={`h-12 w-12 flex-none rounded-xl ${p.hidden ? "opacity-40" : ""}`} />
                <span className="min-w-0 flex-1"><b className="block truncate">{p.name}{p.hidden ? " (hidden)" : ""}</b><span className="text-sm text-muted">{[fmtBday(p.bday) || "No birthday set", p.group].filter(Boolean).join(", ")}</span></span>
                <span className="flex flex-none flex-wrap justify-end gap-1.5">
                  <button type="button" className="btn btn-sm" onClick={() => edit(p)} aria-label={`Edit ${p.name}`}>Edit</button>
                  <button type="button" className="btn btn-sm" onClick={() => repo.savePerson({ ...p, hidden: !p.hidden })} aria-label={`${p.hidden ? "Show" : "Hide"} ${p.name}`}>{p.hidden ? "Show" : "Hide"}</button>
                  <button type="button" className="btn btn-sm btn-danger" aria-label={`Delete ${p.name}`} onClick={async () => { if (confirm(`Delete ${p.name} for good? Use Hide if you only want them off the wall.`)) { await repo.deletePerson(p.id); toast(`${p.name} deleted`); } }}>Delete</button>
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
