"use client";
import type { TemplateKey } from "./data/types";

/**
 * Audio Engine:
 * 1. Primary: Howler.js audio streaming for real mp3 tracks placed under /audio/
 * 2. Fallback: Tone.js live procedural synthesized chimes & music loop
 * 
 * Never autoplays: requires explicit user interaction (toggle or button tap).
 */

type ToneNS = typeof import("tone");
type HowlerNS = typeof import("howler");

let T: ToneNS | null = null;
let toneReady: Promise<ToneNS> | null = null;

let H: HowlerNS | null = null;
let howlerReady: Promise<HowlerNS> | null = null;

let musicOn = false;
let currentTpl: TemplateKey = "party";
const listeners = new Set<(on: boolean) => void>();

// Tone.js Synth State
let toneLoop: { stop: () => void } | null = null;
let fx: {
  box: import("tone").PolySynth;
  pluck: import("tone").PolySynth;
  noise: import("tone").NoiseSynth;
  pop: import("tone").MembraneSynth;
  reverb: import("tone").Reverb;
} | null = null;

// Howler Track State
let activeHowl: import("howler").Howl | null = null;
let activeTrackName: string | null = null;
let birthdayHowl: import("howler").Howl | null = null;

async function getTone() {
  if (typeof window === "undefined") return null;
  if (!toneReady) {
    toneReady = import("tone").then((m) => {
      T = m;
      return m;
    });
  }
  const t = await toneReady;
  await t.start();
  return t;
}

async function getHowler(): Promise<HowlerNS | null> {
  if (typeof window === "undefined") return null;
  if (!howlerReady) {
    howlerReady = import("howler").then((m) => {
      H = m;
      return m;
    });
  }
  return howlerReady;
}

async function voices() {
  const t = await getTone();
  if (!t) throw new Error("Audio unavailable in SSR");
  if (fx) return { t, ...fx };

  const reverb = new t.Reverb({ decay: 4.5, wet: 0.35 }).toDestination();
  const box = new t.PolySynth(t.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 2,
    envelope: { attack: 0.002, decay: 1.2, sustain: 0, release: 1.4 },
    modulationEnvelope: { attack: 0.002, decay: 0.4, sustain: 0, release: 0.2 },
  }).connect(reverb);
  box.volume.value = -14;

  const pluck = new t.PolySynth(t.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.5, sustain: 0.05, release: 0.8 },
  }).connect(reverb);
  pluck.volume.value = -22;

  const noise = new t.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.01, decay: 0.45, sustain: 0 },
  }).toDestination();
  noise.volume.value = -20;

  const pop = new t.MembraneSynth({
    octaves: 4,
    pitchDecay: 0.02,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
  }).toDestination();
  pop.volume.value = -14;

  fx = { box, pluck, noise, pop, reverb };
  return { t, ...fx };
}

const PATTERNS: Record<TemplateKey, { bpm: number; notes: string[]; drone?: string[] }> = {
  party: { bpm: 104, notes: ["C5", "E5", "G5", "E5", "A4", "C5", "E5", "C5", "F4", "A4", "C5", "A4", "G4", "B4", "D5", "B4"] },
  mehfil: { bpm: 72, notes: ["C5", "D5", "E5", "G5", "A5", "G5", "E5", "D5", "C5", "A4", "G4", "A4"], drone: ["C3", "G3"] },
  pinboard: { bpm: 96, notes: ["G4", "B4", "D5", "B4", "C5", "E5", "G5", "E5", "D5", "F#5", "A5", "F#5"] },
  starlight: { bpm: 58, notes: ["E5", "B5", "G#5", "E6", "C#6", "G#5", "B5", "E5"] },
  pop: { bpm: 124, notes: ["C5", "C5", "G5", "E5", "F5", "A5", "G5", "E5", "D5", "G5", "B5", "G5"] },
};

async function startToneLoop() {
  stopToneLoop();
  const { t, pluck } = await voices();
  const p = PATTERNS[currentTpl];
  t.getTransport().bpm.value = p.bpm;
  const seq = new t.Sequence((time, note) => pluck.triggerAttackRelease(note as string, "8n", time), p.notes, "8n").start(0);

  let drone: import("tone").Loop | null = null;
  if (p.drone) {
    const d = new t.Synth({ oscillator: { type: "sine" }, envelope: { attack: 2, decay: 0, sustain: 1, release: 3 } }).toDestination();
    d.volume.value = -30;
    drone = new t.Loop((time) => d.triggerAttackRelease(p.drone![0], "1m", time), "1m").start(0);
  }
  t.getTransport().start();
  toneLoop = {
    stop: () => {
      seq.dispose();
      drone?.dispose();
      t.getTransport().stop();
    },
  };
}

function stopToneLoop() {
  toneLoop?.stop();
  toneLoop = null;
}

/**
 * Attempts to play an MP3 track via Howler.
 * If the track file is missing (404) or fails to decode, returns false so we can fall back to Tone.js.
 */
async function tryPlayHowlerTrack(tpl: TemplateKey): Promise<boolean> {
  const howler = await getHowler();
  if (!howler) return false;

  const src = `/audio/${tpl}.mp3`;

  return new Promise<boolean>((resolve) => {
    let resolved = false;

    const sound = new howler.Howl({
      src: [src],
      html5: true, // stream large audio
      loop: true,
      volume: 0,
      onload: () => {
        if (!musicOn) {
          sound.unload();
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
          return;
        }

        // Stop any previous track
        if (activeHowl && activeHowl !== sound) {
          activeHowl.fade(activeHowl.volume(), 0, 800);
          const prev = activeHowl;
          setTimeout(() => prev.stop(), 850);
        }

        // Stop Tone loop since real track is available
        stopToneLoop();

        activeHowl = sound;
        activeTrackName = tpl;
        sound.play();
        sound.fade(0, 0.65, 1200);

        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      },
      onloaderror: () => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      },
      onplayerror: () => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      },
    });

    // Timeout if file not reachable in 1.8s
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, 1800);
  });
}

function stopHowlerTrack() {
  if (activeHowl) {
    activeHowl.fade(activeHowl.volume(), 0, 600);
    const sound = activeHowl;
    setTimeout(() => {
      sound.stop();
    }, 650);
    activeHowl = null;
    activeTrackName = null;
  }
}

async function playMusic() {
  if (!musicOn) return;

  // 1. Attempt real Howler track for current template
  const howlerSuccess = await tryPlayHowlerTrack(currentTpl);

  // 2. Fall back to Tone.js synthesized loop if track not available
  if (!howlerSuccess && musicOn) {
    stopHowlerTrack();
    await startToneLoop();
  }
}

function stopMusic() {
  stopHowlerTrack();
  stopToneLoop();
}

export const audio = {
  isOn: () => musicOn,
  onChange(cb: (on: boolean) => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  async setMusic(on: boolean) {
    musicOn = on;
    listeners.forEach((cb) => cb(on));
    if (on) {
      await playMusic();
    } else {
      stopMusic();
    }
  },
  async setTemplate(key: TemplateKey) {
    if (key === currentTpl) return;
    currentTpl = key;
    if (musicOn) {
      await playMusic();
    }
  },
  /**
   * Happy Birthday Music:
   * 1. Try public/audio/happy-birthday.mp3
   * 2. Fall back to Tone.js synthesized music box
   */
  async birthdaySong() {
    const wasPlayingMusic = musicOn;

    // Temporarily pause background music
    if (activeHowl) {
      activeHowl.pause();
    }
    stopToneLoop();

    const howler = await getHowler();
    let playedWithHowler = false;

    if (howler) {
      playedWithHowler = await new Promise<boolean>((resolve) => {
        let done = false;
        const sound = new howler.Howl({
          src: ["/audio/happy-birthday.mp3"],
          html5: true,
          volume: 0.8,
          onload: () => {
            birthdayHowl = sound;
            sound.play();
            sound.on("end", () => {
              if (wasPlayingMusic && musicOn) {
                if (activeHowl) activeHowl.play();
                else startToneLoop();
              }
            });
            if (!done) {
              done = true;
              resolve(true);
            }
          },
          onloaderror: () => {
            if (!done) {
              done = true;
              resolve(false);
            }
          },
        });
        setTimeout(() => {
          if (!done) {
            done = true;
            resolve(false);
          }
        }, 1500);
      });
    }

    if (!playedWithHowler) {
      // Fallback: Tone.js music box
      const { t, box } = await voices();
      const seq: [string, number][] = [
        ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
        ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
        ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
        ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
      ];
      const beat = 0.4;
      let time = t.now() + 0.1;
      for (const [n, b] of seq) {
        box.triggerAttackRelease(n, Math.max(0.5, b * beat * 1.8), time);
        time += b * beat;
      }
      if (wasPlayingMusic && musicOn) {
        setTimeout(() => {
          if (musicOn) {
            if (activeHowl) activeHowl.play();
            else startToneLoop();
          }
        }, (time - t.now() + 1.5) * 1000);
      }
    }
  },
  async sfx(kind: "whoosh" | "pop" | "flip" | "chime" | "post") {
    try {
      const { t, noise, pop, pluck, box } = await voices();
      const now = t.now();
      if (kind === "whoosh") noise.triggerAttackRelease(0.45, now);
      else if (kind === "pop") {
        pop.triggerAttackRelease("C3", "16n", now);
        box.triggerAttackRelease(["C6", "E6", "G6"], 0.4, now + 0.05);
      } else if (kind === "flip") pluck.triggerAttackRelease("E6", "32n", now);
      else if (kind === "post") {
        pluck.triggerAttackRelease("G5", "16n", now);
        pluck.triggerAttackRelease("C6", "16n", now + 0.08);
      } else box.triggerAttackRelease(["G5", "B5", "D6"], 0.8, now);
    } catch {
      /* audio unavailable */
    }
  },
};

/** sound effects only play when the person has turned sound on */
export const sfx = (k: Parameters<typeof audio.sfx>[0]) => {
  if (musicOn) audio.sfx(k);
};
