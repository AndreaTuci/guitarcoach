/**
 * Chromagram (pitch class profile) builder using float frequency data.
 *
 * Uses Float32Array from AnalyserNode.getFloatFrequencyData() which provides
 * actual dB values (typically −100 to 0 dB) — much higher dynamic range than
 * the Uint8Array byte version, which collapsed silence and quiet signals together.
 *
 * Only the guitar fundamental range (80–2000 Hz) is considered.
 * dB values are converted to linear amplitude referenced to the noise floor.
 * Result is L² normalized.
 */

const GUITAR_FREQ_MIN = 80    // Just below E2 (82.41 Hz)
const GUITAR_FREQ_MAX = 2000
const NOISE_FLOOR_DB = -80    // Below this → treat as silence, skip bin

export function buildChromagram(
  floatFreqData: Float32Array,
  sampleRate: number,
  fftSize: number,
): number[] {
  const chroma = new Array<number>(12).fill(0)
  const numBins = floatFreqData.length

  for (let bin = 1; bin < numBins; bin++) {
    const freq = (bin * sampleRate) / fftSize
    if (freq < GUITAR_FREQ_MIN || freq > GUITAR_FREQ_MAX) continue

    const db = floatFreqData[bin]!
    if (db < NOISE_FLOOR_DB) continue

    // dB → linear amplitude, referenced to noise floor so values are always > 0
    const linearAmp = 10 ** ((db - NOISE_FLOOR_DB) / 20)

    // Frequency → MIDI note → pitch class (0=C … 11=B)
    const midi = 12 * Math.log2(freq / 440) + 69
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12
    chroma[pitchClass] += linearAmp
  }

  // L² normalize
  const norm = Math.sqrt(chroma.reduce((s, v) => s + v * v, 0))
  if (norm > 0) for (let i = 0; i < 12; i++) chroma[i] /= norm

  return chroma
}

/**
 * Computes two gate metrics in the guitar fundamental range (80–600 Hz):
 *
 * - peakDb:   the loudest bin value in that range
 * - contrast: peak − median (spectral contrast)
 *
 * A real guitar chord has strong harmonic peaks well above the spectral floor:
 *   contrast ≥ 12 dB and peakDb ≥ −55 dB.
 *
 * Background noise and metronome sine clicks have flat spectra (low contrast)
 * or are below the absolute level threshold.
 */
export function guitarSpectralContrast(
  floatFreqData: Float32Array,
  sampleRate: number,
  fftSize: number,
): { peakDb: number; contrast: number } {
  const values: number[] = []
  for (let bin = 1; bin < floatFreqData.length; bin++) {
    const freq = (bin * sampleRate) / fftSize
    if (freq < 80 || freq > 600) continue
    values.push(floatFreqData[bin]!)
  }
  if (values.length === 0) return { peakDb: -100, contrast: 0 }

  values.sort((a, b) => a - b)
  const peakDb = values[values.length - 1]!
  const medianDb = values[Math.floor(values.length / 2)]!
  return { peakDb, contrast: peakDb - medianDb }
}
