/**
 * Audio module — footsteps + ambient drone (ported from v1)
 */

export function playFootstep(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.08);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 300 + Math.random() * 200;
  filter.Q.value = 1;
  const gain = ctx.createGain();
  gain.gain.value = 0.08;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(now);
}

export type AmbientNodes = {
  oscs: OscillatorNode[];
  gains: GainNode[];
};

export function startAmbient(ctx: AudioContext): AmbientNodes {
  const freqs = [55, 82.5, 110];
  const volumes = [0.03, 0.03, 0.01];
  const detunes = [3, -2, 1];
  const oscs: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.detune.value = detunes[i];
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volumes[i], ctx.currentTime + 1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    oscs.push(osc);
    gains.push(gain);
  });

  return { oscs, gains };
}

export function stopAmbient(
  ctx: AudioContext,
  nodes: AmbientNodes
): void {
  nodes.gains.forEach((g) => {
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  });
  setTimeout(() => {
    nodes.oscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        // already stopped
      }
    });
  }, 600);
}
