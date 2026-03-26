import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { getAudioContext } from '@/services/audioEngine'
import { buildChromagram } from '@/utils/chromagram'
import { matchChord } from '@/utils/chordMatcher'
import type { Chord } from '@/types/program'

/**
 * Detects the currently played chord by aggregating FFT frames over a time window
 * and matching the averaged chromagram against known chord templates.
 *
 * Detection runs every DETECTION_INTERVAL_MS. Each detection averages all
 * FFT snapshots collected in the last WINDOW_MS to reduce noise.
 *
 * Confidence threshold: results below MIN_CONFIDENCE are reported as null.
 * The UI must label chord detection as experimental.
 */

const WINDOW_MS = 500              // Aggregation window
const DETECTION_INTERVAL_MS = 200  // How often to run matching
const MIN_CONFIDENCE = 0.5         // Below this → null (shown as "?" in UI)
// Mean byte energy across the guitar-range FFT bins required before matching.
// Prevents spurious chord detection from background noise/silence.
// Scale: 0–255 byte values. Silence ≈ 0–3, light picking ≈ 8–15, chord ≈ 15+.
// Raised to handle noisy environments / poor microphones.
// If guitar-range signal energy (mean byte value 0–255) is below this, skip the frame.
const MIN_ENERGY = 18

export function useChordDetector(analyserNode: Ref<AnalyserNode | null>) {
  const detectedChord = ref<Chord | null>(null)
  const confidence = ref(0)

  // Ring buffer of recent chromagrams accumulated within WINDOW_MS
  const chromaBuffer: number[][] = []
  let bufferTimer: ReturnType<typeof setInterval> | null = null
  let detectionTimer: ReturnType<typeof setInterval> | null = null
  let freqBuffer: Uint8Array | null = null

  /** Mean energy of FFT bins in the guitar frequency range (65–2000 Hz) */
  function guitarRangeEnergy(analyser: AnalyserNode, data: Uint8Array): number {
    const sampleRate = getAudioContext().sampleRate
    let sum = 0
    let count = 0
    for (let bin = 1; bin < data.length; bin++) {
      const freq = (bin * sampleRate) / analyser.fftSize
      if (freq < 65 || freq > 2000) continue
      sum += data[bin]
      count++
    }
    return count > 0 ? sum / count : 0
  }

  /** Snapshot the current FFT frame into the ring buffer */
  function snapshot(): void {
    const analyser = analyserNode.value
    if (!analyser) return

    if (!freqBuffer || freqBuffer.length !== analyser.frequencyBinCount) {
      freqBuffer = new Uint8Array(analyser.frequencyBinCount)
    }
    analyser.getByteFrequencyData(freqBuffer)

    // Skip frame if signal is below energy threshold (silence / background noise)
    if (guitarRangeEnergy(analyser, freqBuffer) < MIN_ENERGY) return

    const ctx = getAudioContext()
    const chroma = buildChromagram(freqBuffer, ctx.sampleRate, analyser.fftSize)
    chromaBuffer.push(chroma)

    // Keep only frames within the last WINDOW_MS (at ~30fps ≈ 15 frames)
    if (chromaBuffer.length > 30) chromaBuffer.shift()
  }

  /** Average buffered chromagrams and run chord matching */
  function detect(): void {
    if (chromaBuffer.length === 0) {
      detectedChord.value = null
      confidence.value = 0
      return
    }

    // Average across buffered frames
    const avg = new Array<number>(12).fill(0)
    for (const frame of chromaBuffer) {
      for (let i = 0; i < 12; i++) avg[i] += (frame[i] ?? 0)
    }
    for (let i = 0; i < 12; i++) avg[i] /= chromaBuffer.length

    const result = matchChord(avg)
    confidence.value = result.confidence
    detectedChord.value = result.confidence >= MIN_CONFIDENCE ? result.chord : null

    // Flush buffer so next detection uses fresh frames only
    chromaBuffer.length = 0
  }

  function startDetection(): void {
    chromaBuffer.length = 0
    // Snapshot at ~30fps for smooth buffer
    bufferTimer = setInterval(snapshot, 33)
    detectionTimer = setInterval(detect, DETECTION_INTERVAL_MS)
  }

  function stopDetection(): void {
    if (bufferTimer !== null) { clearInterval(bufferTimer); bufferTimer = null }
    if (detectionTimer !== null) { clearInterval(detectionTimer); detectionTimer = null }
    chromaBuffer.length = 0
    detectedChord.value = null
    confidence.value = 0
  }

  watch(analyserNode, (node) => {
    if (node) startDetection()
    else stopDetection()
  })

  onUnmounted(() => stopDetection())

  return { detectedChord, confidence }
}
