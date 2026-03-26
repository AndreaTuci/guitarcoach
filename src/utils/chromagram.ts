/**
 * Builds a 12-bin chroma vector (pitch class profile) from FFT frequency data.
 *
 * Maps each FFT bin to its pitch class (0=C … 11=B) and accumulates energy.
 * Only considers the guitar frequency range (~65 Hz–2000 Hz) to avoid
 * low-frequency noise and high-frequency harmonics that confuse matching.
 *
 * @param frequencyData  Uint8Array from AnalyserNode.getByteFrequencyData()
 * @param sampleRate     AudioContext.sampleRate (typically 44100 or 48000)
 * @param fftSize        AnalyserNode.fftSize (e.g. 2048)
 * @returns Normalized 12-element array, values in [0, 1]
 */
export function buildChromagram(
  frequencyData: Uint8Array,
  sampleRate: number,
  fftSize: number,
): number[] {
  const chroma = new Array<number>(12).fill(0)
  const numBins = frequencyData.length // = fftSize / 2

  for (let bin = 1; bin < numBins; bin++) {
    const freq = (bin * sampleRate) / fftSize

    // Focus on the fundamental range of open guitar chords
    if (freq < 65 || freq > 2000) continue

    // Frequency → MIDI note number → pitch class
    const midi = 12 * Math.log2(freq / 440) + 69
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12

    // Convert 0-255 byte to energy (squared for perceptual weighting)
    const energy = (frequencyData[bin] / 255) ** 2
    chroma[pitchClass] += energy
  }

  // L∞ normalise so the strongest pitch class = 1.0
  const max = Math.max(...chroma)
  if (max > 0) {
    for (let i = 0; i < 12; i++) chroma[i] /= max
  }

  return chroma
}
