import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { getAudioContext } from '@/services/audioEngine'
import type { OnsetEvent } from '@/types/audio'

/**
 * RMS-based onset detector.
 *
 * Algorithm:
 * - Poll AnalyserNode via requestAnimationFrame (~60fps)
 * - Compute RMS over the full time-domain buffer
 * - State machine: silent → sounding → silent
 *   - silent → sounding: RMS crosses ONSET_THRESHOLD → fire OnsetEvent
 *   - sounding → silent: RMS drops below SILENCE_THRESHOLD
 * - Minimum silence gap of MIN_SILENCE_MS enforced between onsets
 *
 * A strum is detected on the rising edge (onset), not the full duration.
 */

const ONSET_THRESHOLD = 0.08    // RMS level that triggers an onset
const SILENCE_THRESHOLD = 0.03  // RMS level considered silence (hysteresis)
const MIN_SILENCE_MS = 80       // Minimum gap between two onsets

export function useOnsetDetector(analyserNode: Ref<AnalyserNode | null>) {
  const lastOnset = ref<OnsetEvent | null>(null)
  const currentRms = ref(0)

  type State = 'silent' | 'sounding'
  let state: State = 'silent'
  let lastOnsetTime = 0
  let rafId: number | null = null
  let buffer: Uint8Array | null = null

  function computeRms(analyser: AnalyserNode): number {
    if (!buffer || buffer.length !== analyser.fftSize) {
      buffer = new Uint8Array(analyser.fftSize)
    }
    analyser.getByteTimeDomainData(buffer)

    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      const sample = (buffer[i] - 128) / 128 // normalise to -1..1
      sum += sample * sample
    }
    return Math.sqrt(sum / buffer.length)
  }

  function poll(): void {
    const analyser = analyserNode.value
    if (!analyser) return

    const rms = computeRms(analyser)
    currentRms.value = rms

    const ctx = getAudioContext()
    const nowMs = ctx.currentTime * 1000

    if (state === 'silent') {
      if (rms > ONSET_THRESHOLD && nowMs - lastOnsetTime > MIN_SILENCE_MS) {
        state = 'sounding'
        lastOnsetTime = nowMs
        lastOnset.value = { timestamp: ctx.currentTime, rms }
      }
    } else {
      if (rms < SILENCE_THRESHOLD) {
        state = 'silent'
      }
    }

    rafId = requestAnimationFrame(poll)
  }

  function startPolling(): void {
    if (rafId !== null) return
    state = 'silent'
    rafId = requestAnimationFrame(poll)
  }

  function stopPolling(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    currentRms.value = 0
    state = 'silent'
  }

  // Start/stop polling automatically when the analyser appears/disappears
  watch(analyserNode, (node) => {
    if (node) startPolling()
    else stopPolling()
  })

  onUnmounted(() => stopPolling())

  return { lastOnset, currentRms }
}
