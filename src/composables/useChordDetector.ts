import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { getAudioContext } from '@/services/audioEngine'
import { buildChromagram, guitarSpectralContrast } from '@/utils/chromagram'
import { matchChord } from '@/utils/chordMatcher'
import { CHORD_STRING_FREQS, detectSoundingStrings } from '@/utils/chordNotes'
import type { Chord } from '@/types/program'

/**
 * Real-time chord detector. Uses float frequency data (dB values) for accurate
 * energy gating, then matches a time-averaged chromagram against chord templates.
 *
 * Three-layer noise rejection:
 *
 * 1. Spectral gate — each FFT snapshot must pass both:
 *    a) peakDb > MIN_PEAK_DB: absolute signal floor (loud enough to be guitar)
 *    b) contrast > MIN_CONTRAST_DB: spectral contrast check (tonal, not flat noise)
 *    Metronome clicks at a single frequency have high peak but very low contrast
 *    in the broader 80–600 Hz range, so they are blocked here.
 *
 * 2. Confidence gate — cosine similarity with best template must exceed
 *    MIN_CONFIDENCE after the frame average.
 *
 * 3. Temporal stability — the same chord must appear in STABILITY_COUNT
 *    consecutive detection windows (~200 ms each) before being reported.
 *    This eliminates single-frame transients (stray noise, brief harmonics).
 *
 * Also exposes per-string state: for the matched chord, each string is classified
 * as 'sounding' | 'deaf' | 'muted'. 'deaf' means the string should ring for this
 * chord voicing but has no detectable energy — player's finger is not pressing properly.
 */

export type StringState = 'sounding' | 'deaf' | 'muted'

const DETECTION_INTERVAL_MS = 200   // Run matching every N ms
const MIN_CONFIDENCE = 0.50         // Cosine similarity floor
const MIN_PEAK_DB = -52             // Absolute signal floor in guitar range
const MIN_CONTRAST_DB = 12          // Spectral contrast (peak − median) floor
const STABILITY_COUNT = 2           // Consecutive matching windows required
const MAX_BUFFER_FRAMES = 30        // Ring buffer cap

export function useChordDetector(analyserNode: Ref<AnalyserNode | null>) {
  const detectedChord = ref<Chord | null>(null)
  const confidence = ref(0)
  const stringStates = ref<StringState[]>(['muted', 'muted', 'muted', 'muted', 'muted', 'muted'])

  const chromaBuffer: number[][] = []
  let bufferTimer: ReturnType<typeof setInterval> | null = null
  let detectionTimer: ReturnType<typeof setInterval> | null = null
  let floatBuffer: Float32Array | null = null

  // Temporal stability state
  let prevChord: Chord | null = null
  let stabilityCount = 0

  // ─── Snapshot ─────────────────────────────────────────────────────────────

  function snapshot(): void {
    const analyser = analyserNode.value
    if (!analyser) return

    if (!floatBuffer || floatBuffer.length !== analyser.frequencyBinCount) {
      floatBuffer = new Float32Array(analyser.frequencyBinCount)
    }
    analyser.getFloatFrequencyData(floatBuffer)

    const ctx = getAudioContext()
    const { peakDb, contrast } = guitarSpectralContrast(
      floatBuffer,
      ctx.sampleRate,
      analyser.fftSize,
    )

    // Layer 1: gate — skip frames that are too quiet or spectrally flat
    if (peakDb < MIN_PEAK_DB || contrast < MIN_CONTRAST_DB) return

    const chroma = buildChromagram(floatBuffer, ctx.sampleRate, analyser.fftSize)
    chromaBuffer.push(chroma)
    if (chromaBuffer.length > MAX_BUFFER_FRAMES) chromaBuffer.shift()
  }

  // ─── Detect ───────────────────────────────────────────────────────────────

  function detect(): void {
    if (chromaBuffer.length === 0) {
      // No valid frames this window → reset stability
      prevChord = null
      stabilityCount = 0
      detectedChord.value = null
      confidence.value = 0
      stringStates.value = ['muted', 'muted', 'muted', 'muted', 'muted', 'muted']
      return
    }

    // Average chromagrams over the window
    const avg = new Array<number>(12).fill(0)
    for (const frame of chromaBuffer) {
      for (let i = 0; i < 12; i++) avg[i] += frame[i] ?? 0
    }
    for (let i = 0; i < 12; i++) avg[i] /= chromaBuffer.length

    chromaBuffer.length = 0  // flush for next window

    const result = matchChord(avg)

    // Layer 2: confidence gate
    if (result.confidence < MIN_CONFIDENCE) {
      prevChord = null
      stabilityCount = 0
      detectedChord.value = null
      confidence.value = 0
      stringStates.value = ['muted', 'muted', 'muted', 'muted', 'muted', 'muted']
      return
    }

    // Layer 3: temporal stability
    if (result.chord === prevChord) {
      stabilityCount = Math.min(stabilityCount + 1, STABILITY_COUNT)
    } else {
      prevChord = result.chord
      stabilityCount = 1
    }

    if (stabilityCount < STABILITY_COUNT) return  // not stable yet — keep previous output

    // All gates passed — update output
    detectedChord.value = result.chord
    confidence.value = result.confidence

    // Per-string state for the matched chord
    if (floatBuffer && analyserNode.value) {
      const analyser = analyserNode.value
      const ctx = getAudioContext()
      const sounding = detectSoundingStrings(
        result.chord,
        floatBuffer,
        ctx.sampleRate,
        analyser.fftSize,
      )
      const freqs = CHORD_STRING_FREQS[result.chord]
      stringStates.value = freqs.map((expectedFreq, i): StringState => {
        if (expectedFreq === null) return 'muted'
        return sounding[i] ? 'sounding' : 'deaf'
      })
    }
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  function startDetection(): void {
    chromaBuffer.length = 0
    prevChord = null
    stabilityCount = 0
    bufferTimer = setInterval(snapshot, 33)
    detectionTimer = setInterval(detect, DETECTION_INTERVAL_MS)
  }

  function stopDetection(): void {
    if (bufferTimer !== null) { clearInterval(bufferTimer); bufferTimer = null }
    if (detectionTimer !== null) { clearInterval(detectionTimer); detectionTimer = null }
    chromaBuffer.length = 0
    prevChord = null
    stabilityCount = 0
    detectedChord.value = null
    confidence.value = 0
    stringStates.value = ['muted', 'muted', 'muted', 'muted', 'muted', 'muted']
  }

  watch(analyserNode, (node) => {
    if (node) startDetection()
    else stopDetection()
  })

  onUnmounted(() => stopDetection())

  return { detectedChord, confidence, stringStates }
}
