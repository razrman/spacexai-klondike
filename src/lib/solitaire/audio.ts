type Sfx = "draw" | "place" | "flip" | "illegal" | "win" | "deal";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = enabled ? 0.7 : 0;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function unlockAudio(): void {
  const audio = ensureContext();
  if (!audio) return;
  if (audio.state === "suspended") {
    void audio.resume();
  }
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (master && ctx) {
    master.gain.setTargetAtTime(value ? 0.7 : 0, ctx.currentTime, 0.02);
  }
}

function envGain(
  audio: AudioContext,
  duration: number,
  peak = 0.12,
): GainNode {
  const gain = audio.createGain();
  const now = audio.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  if (master) gain.connect(master);
  return gain;
}

function tone(
  audio: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  peak = 0.1,
  delay = 0,
): void {
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + delay);
  const gain = envGain(audio, duration, peak);
  osc.connect(gain);
  osc.start(audio.currentTime + delay);
  osc.stop(audio.currentTime + delay + duration + 0.02);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function noiseBurst(audio: AudioContext, duration: number, peak = 0.04): void {
  const length = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  filter.Q.value = 0.7;
  const gain = envGain(audio, duration, peak);
  src.connect(filter);
  filter.connect(gain);
  src.start();
  src.stop(audio.currentTime + duration + 0.02);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

export function playSfx(name: Sfx): void {
  if (!enabled) return;
  const audio = ensureContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const jitter = 0.94 + Math.random() * 0.12;

  switch (name) {
    case "place":
      tone(audio, 190 * jitter, 0.07, "sine", 0.08);
      noiseBurst(audio, 0.04, 0.03);
      break;
    case "draw":
      noiseBurst(audio, 0.07, 0.045);
      tone(audio, 240 * jitter, 0.05, "triangle", 0.04);
      break;
    case "flip":
      tone(audio, 520 * jitter, 0.04, "square", 0.03);
      tone(audio, 320 * jitter, 0.05, "triangle", 0.04, 0.03);
      break;
    case "deal":
      noiseBurst(audio, 0.05, 0.025);
      break;
    case "illegal":
      tone(audio, 110, 0.12, "sine", 0.06);
      break;
    case "win":
      tone(audio, 261.63, 0.16, "sine", 0.07, 0);
      tone(audio, 329.63, 0.16, "sine", 0.07, 0.12);
      tone(audio, 392.0, 0.16, "sine", 0.07, 0.24);
      tone(audio, 523.25, 0.28, "sine", 0.08, 0.38);
      break;
  }
}
