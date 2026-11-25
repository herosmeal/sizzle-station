// All sound is synthesized with WebAudio: no audio files, no network, and
// nothing to load. The context starts on the first key or click, as browsers
// require, and M toggles mute.
export function createAudio() {
  let context = null;
  let muted = false;
  let sizzleNodes = null;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      return null;
    }
    return context;
  }

  function tone(frequency, duration, type, volume, when) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      const start = ctx.currentTime + (when ?? 0);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.05);
    } catch {
      // Sound is garnish: never let it break the game.
    }
  }

  function noise(duration, volume, filterFrequency) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    try {
      const length = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = filterFrequency;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch {
      // Sound is garnish: never let it break the game.
    }
  }

  return {
    unlock() {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    pickup() {
      tone(660, 0.09, 'sine', 0.12);
    },
    chop() {
      noise(0.08, 0.25, 1800);
      tone(180, 0.06, 'triangle', 0.15);
    },
    ding() {
      tone(880, 0.18, 'sine', 0.16);
      tone(1318, 0.28, 'sine', 0.14, 0.09);
    },
    buzz() {
      tone(140, 0.25, 'sawtooth', 0.1);
    },
    tick() {
      tone(1200, 0.05, 'square', 0.06);
    },
    startSizzle() {
      if (muted || sizzleNodes) return;
      const ctx = ensure();
      if (!ctx) return;
      try {
        const length = ctx.sampleRate;
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        const gain = ctx.createGain();
        gain.gain.value = 0.03;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        sizzleNodes = { source, gain };
      } catch {
        sizzleNodes = null;
      }
    },
    stopSizzle() {
      if (!sizzleNodes) return;
      try {
        sizzleNodes.source.stop();
      } catch {
        // Already stopped.
      }
      sizzleNodes = null;
    },
  };
}
