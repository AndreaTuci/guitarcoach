import { ref, computed, onUnmounted } from 'vue'
import { getAudioContext } from '@/services/audioEngine'

/**
 * Look-ahead audio scheduler based on Chris Wilson's web audio scheduling pattern.
 * Audio scheduling runs on the AudioContext clock (sample-accurate).
 * Visual updates are driven by a separate setTimeout that fires slightly after each beat.
 */

const LOOKAHEAD_S = 0.1    // Schedule beats this far ahead (seconds)
const SCHEDULER_MS = 25    // How often to run the scheduler loop (ms)

export type Subdivision = 'quarter' | 'eighth'

export function useMetronome() {
  const bpm = ref(80)
  const isRunning = ref(false)
  const currentBeat = ref(0)       // 0-indexed, resets each bar
  const subdivision = ref<Subdivision>('quarter')
  const accentBeat1 = ref(true)

  let nextBeatTime = 0             // AudioContext time of next scheduled beat
  let beatIndex = 0                // Beat counter (wraps at beatsPerBar)
  let schedulerTimer: ReturnType<typeof setTimeout> | null = null

  const beatsPerBar = computed(() =>
    subdivision.value === 'eighth' ? 8 : 4,
  )

  const beatDuration = computed(() => {
    const quarterDuration = 60 / bpm.value
    return subdivision.value === 'eighth' ? quarterDuration / 2 : quarterDuration
  })

  function scheduleClick(audioCtx: AudioContext, time: number, beat: number): void {
    const isAccent = accentBeat1.value && beat === 0
    const freq = isAccent ? 1200 : 900
    const peakGain = isAccent ? 0.7 : 0.4

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.connect(gain)
    gain.connect(audioCtx.destination)

    osc.frequency.value = freq
    osc.type = 'sine'

    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(peakGain, time + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045)

    osc.start(time)
    osc.stop(time + 0.05)
  }

  function scheduleBeats(): void {
    const audioCtx = getAudioContext()

    while (nextBeatTime < audioCtx.currentTime + LOOKAHEAD_S) {
      const beat = beatIndex

      scheduleClick(audioCtx, nextBeatTime, beat)

      // Delay visual update to match when beat actually fires
      const delayMs = (nextBeatTime - audioCtx.currentTime) * 1000
      setTimeout(() => {
        if (isRunning.value) currentBeat.value = beat
      }, Math.max(0, delayMs))

      beatIndex = (beatIndex + 1) % beatsPerBar.value
      nextBeatTime += beatDuration.value
    }

    schedulerTimer = setTimeout(scheduleBeats, SCHEDULER_MS)
  }

  function start(): void {
    if (isRunning.value) return
    const audioCtx = getAudioContext()
    nextBeatTime = audioCtx.currentTime
    beatIndex = 0
    isRunning.value = true
    scheduleBeats()
  }

  function stop(): void {
    isRunning.value = false
    if (schedulerTimer !== null) {
      clearTimeout(schedulerTimer)
      schedulerTimer = null
    }
    currentBeat.value = 0
  }

  function toggle(): void {
    isRunning.value ? stop() : start()
  }

  function setBpm(value: number): void {
    bpm.value = Math.max(40, Math.min(220, Math.round(value)))
  }

  onUnmounted(() => {
    stop()
  })

  return {
    bpm,
    isRunning,
    currentBeat,
    beatsPerBar,
    subdivision,
    accentBeat1,
    start,
    stop,
    toggle,
    setBpm,
  }
}
