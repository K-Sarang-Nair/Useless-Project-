// Tiny synthesized sound engine (no audio files needed).
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambientStarted = false;

export const audio = {
  muted: false,
};

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(m: boolean) {
  audio.muted = m;
  if (master) master.gain.value = m ? 0 : 0.9;
}

export function unlockAudio() {
  const c = ac();
  if (c && !ambientStarted) {
    ambientStarted = true;
    startAmbient();
  }
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function env(g: GainNode, c: AudioContext, peak: number, attack: number, decay: number) {
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.2,
  slideTo?: number,
) {
  const c = ac();
  if (!c || !master) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
  env(g, c, gain, 0.01, dur);
  o.connect(g).connect(master);
  o.start();
  o.stop(c.currentTime + dur + 0.05);
}

function noise(dur: number, gain: number, filterType: BiquadFilterType, freq: number, q = 1) {
  const c = ac();
  if (!c || !master) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, Math.max(dur, 0.05));
  const f = c.createBiquadFilter();
  f.type = filterType;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  env(g, c, gain, 0.005, dur);
  src.connect(f).connect(g).connect(master);
  src.start();
  src.stop(c.currentTime + dur + 0.05);
}

function startAmbient() {
  const c = ac();
  if (!c || !master) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 4);
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 220;
  const g = c.createGain();
  g.gain.value = 0.035;
  src.connect(f).connect(g).connect(master);
  src.start();
}

export const sfx = {
  ropePull() {
    noise(0.18, 0.12, "bandpass", 900, 2);
  },
  switchClick() {
    tone(1600, 0.04, "square", 0.15, 700);
    noise(0.05, 0.2, "highpass", 2500);
  },
  buzz(dur = 0.25) {
    tone(120, dur, "sawtooth", 0.05);
    tone(60, dur, "square", 0.03);
  },
  flick() {
    noise(0.06, 0.12, "bandpass", 3000, 3);
  },
  creak() {
    const c = ac();
    if (!c || !master) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(70, c.currentTime);
    o.frequency.linearRampToValueAtTime(190, c.currentTime + 1.6);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 500;
    f.Q.value = 6;
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 7;
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(g.gain);
    g.gain.setValueAtTime(0.09, c.currentTime);
    g.gain.setValueAtTime(0.09, c.currentTime + 1.4);
    g.gain.linearRampToValueAtTime(0.0001, c.currentTime + 1.8);
    o.connect(f).connect(g).connect(master);
    o.start();
    lfo.start();
    o.stop(c.currentTime + 1.9);
    lfo.stop(c.currentTime + 1.9);
  },
  step(heavy = false) {
    noise(heavy ? 0.16 : 0.09, heavy ? 0.28 : 0.12, "lowpass", heavy ? 180 : 320);
    if (heavy) tone(70, 0.12, "sine", 0.2, 40);
  },
  grunt(pitch = 220) {
    tone(pitch, 0.22, "sawtooth", 0.09, pitch * 0.6);
  },
  yawn() {
    tone(300, 0.7, "sine", 0.07, 160);
  },
  boing() {
    tone(200, 0.35, "triangle", 0.14, 900);
  },
  dance() {
    [523, 659, 784, 659].forEach((f, i) => setTimeout(() => tone(f, 0.12, "square", 0.08), i * 130));
  },
  slam() {
    noise(0.5, 0.9, "lowpass", 300);
    tone(90, 0.5, "sine", 0.6, 35);
    tone(180, 0.25, "square", 0.25, 50);
  },
  growl(dur = 1.2) {
    tone(58, dur, "sawtooth", 0.09, 44);
    tone(88, dur * 0.8, "square", 0.04, 60);
    noise(dur * 0.7, 0.05, "lowpass", 220);
  },
  sniff() {
    noise(0.12, 0.07, "highpass", 1800);
    setTimeout(() => noise(0.1, 0.06, "highpass", 2200), 190);
  },
  roar() {
    tone(120, 0.7, "sawtooth", 0.13, 70);
    tone(240, 0.5, "square", 0.06, 110);
    noise(0.6, 0.14, "lowpass", 700);
  },
  sting() {
    tone(1300, 0.5, "sawtooth", 0.05, 1900);
    tone(1900, 0.5, "square", 0.03, 2600);
  },
  whoosh() {
    noise(0.3, 0.14, "bandpass", 800, 1.2);
  },
  jump() {
    tone(220, 0.22, "triangle", 0.12, 700);
    noise(0.12, 0.1, "lowpass", 400);
  },
  land() {
    noise(0.22, 0.3, "lowpass", 200);
    tone(80, 0.2, "sine", 0.28, 40);
  },
  blow() {
    noise(0.7, 0.16, "bandpass", 600, 0.7);
  },
  pop() {
    tone(900, 0.08, "square", 0.12, 200);
    noise(0.08, 0.12, "highpass", 3000);
  },
  clang() {
    tone(1400, 0.35, "square", 0.07, 500);
    tone(2100, 0.25, "triangle", 0.05, 900);
    noise(0.2, 0.08, "highpass", 2500);
  },
  spring() {
    [420, 520, 380, 600].forEach((f, i) =>
      setTimeout(() => tone(f, 0.1, "triangle", 0.07, f * 1.6), i * 90),
    );
  },
};
