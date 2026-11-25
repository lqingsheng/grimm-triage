// Optional under-triage sound (task 13): three heartbeats, then a flatline beep.
// Everything is synthesised with the Web Audio API (oscillators and gain envelopes), so there are no
// audio files and no third-party recordings. Sound is OFF by default; app.js only calls playHaunt()
// after the player has switched it on with the "Sound effects" toggle.
//
// No DOM access here: playHaunt() takes an AudioContext (or a test double with the same methods).

export const SOUND_KEY = 'grimm-triage-sound';

// Only an explicit stored "on" turns sound on; anything else (null, junk, storage blocked) is off.
export const soundOnFrom = (stored) => stored === 'on';

// Timing in seconds after the answer. The beats line up with the vignette pulse in styles.css
// (animation: heartbeat 1s ... .2s 3, peaking 0.15 s into each cycle), and the beep starts when the
// ECG trace (3.6 s from 0.2 s) has gone flat.
export const HAUNT_SOUND = {
  firstBeat: 0.35,
  beatPeriod: 1,
  beats: 3,
  flatlineAt: 2.9,
  flatlineLength: 1.6,
  flatlineHz: 960, // a plain monitor-style sine tone
  maxGain: 0.25,   // master level: audible, never loud
};

// One soft thump: a low sine that drops in pitch, with a fast attack and a short decay.
function thump(ctx, out, at, hz, peak) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(hz, at);
  osc.frequency.exponentialRampToValueAtTime(hz * 0.6, at + 0.12);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + 0.2);
  return osc;
}

// Schedules the whole sequence on ctx and returns { end, stop }. stop() fades out within 50 ms,
// so moving to the next patient never leaves a beep running.
export function playHaunt(ctx, start = ctx.currentTime) {
  const s = HAUNT_SOUND;
  const master = ctx.createGain();
  master.gain.setValueAtTime(s.maxGain, start);
  master.connect(ctx.destination);
  const sources = [];

  for (let i = 0; i < s.beats; i += 1) {
    const at = start + s.firstBeat + i * s.beatPeriod;
    sources.push(thump(ctx, master, at, 70, 0.9));        // "lub"
    sources.push(thump(ctx, master, at + 0.22, 58, 0.6)); // "dub", softer
  }

  const at = start + s.flatlineAt;
  const end = at + s.flatlineLength;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(s.flatlineHz, at);
  // 20 ms ramps at both ends avoid clicks.
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.18, at + 0.02);
  gain.gain.setValueAtTime(0.18, end - 0.02);
  gain.gain.linearRampToValueAtTime(0, end);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(end);
  sources.push(osc);

  let stopped = false;
  return {
    end,
    stop() {
      if (stopped) return;
      stopped = true;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.05);
      for (const src of sources) {
        try { src.stop(now + 0.06); } catch { /* already stopped */ }
      }
    },
  };
}
