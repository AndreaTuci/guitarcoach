import { ref, computed, watch, onUnmounted } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { getAudioContext } from '@/services/audioEngine'
import { useMetronomeStore } from '@/stores/metronome'
import { useSessionStore } from '@/stores/session'
import { useProgramStore } from '@/stores/program'
import type { Exercise, BeatResult, Chord, Stroke } from '@/types/program'
import type { OnsetEvent } from '@/types/audio'

export interface ScheduledBar {
  barIndex: number
  chord: Chord
  startAudioTime: number
  endAudioTime: number
  strummingPattern: Stroke[]
  /** AudioContext times of each scorable (D/U) stroke within the bar */
  scorableStrokeTimes: number[]
}

const PERFECT_MS = 50
const GOOD_MS = 100

export function useExerciseSession(
  exercise: ComputedRef<Exercise | undefined>,
  lastOnset: Ref<OnsetEvent | null>,
  detectedChord: Ref<Chord | null>,
) {
  const metro = useMetronomeStore()
  const sessionStore = useSessionStore()
  const programStore = useProgramStore()

  const isRunning = ref(false)
  const isComplete = ref(false)
  const scheduledBars = ref<ScheduledBar[]>([])
  const barResults = ref(new Map<number, BeatResult>())
  const sessionStartAudioTime = ref<number | null>(null)
  const sessionBpm = ref(0)

  // Buffers for scoring
  const onsetBuffer: OnsetEvent[] = []
  const chordLog: { time: number; chord: Chord | null }[] = []

  let scoringTimer: ReturnType<typeof setInterval> | null = null
  let sessionId = ''

  // ─── Buffer incoming onsets and chord detections ────────────────────────────

  watch(lastOnset, (onset) => {
    if (!onset || !isRunning.value) return
    onsetBuffer.push(onset)
    if (onsetBuffer.length > 60) onsetBuffer.shift()
  })

  watch(detectedChord, (chord) => {
    if (!isRunning.value) return
    chordLog.push({ time: getAudioContext().currentTime, chord })
    if (chordLog.length > 100) chordLog.shift()
  })

  // ─── Build the bar schedule ─────────────────────────────────────────────────

  function buildSchedule(ex: Exercise, startTime: number, bpm: number): ScheduledBar[] {
    const barDuration = (ex.timeSignature[0] * 60) / bpm
    const strokeDuration = barDuration / ex.strummingPattern.length

    return Array.from({ length: ex.bars }, (_, barIndex) => {
      const barStart = startTime + barIndex * barDuration
      const chord = ex.chordSequence[barIndex] as Chord

      const scorableStrokeTimes: number[] = []
      ex.strummingPattern.forEach((stroke, i) => {
        if (stroke !== '-') scorableStrokeTimes.push(barStart + i * strokeDuration)
      })

      return {
        barIndex,
        chord,
        startAudioTime: barStart,
        endAudioTime: barStart + barDuration,
        strummingPattern: ex.strummingPattern,
        scorableStrokeTimes,
      }
    })
  }

  // ─── Score a completed bar ──────────────────────────────────────────────────

  function scoreBar(bar: ScheduledBar): BeatResult {
    // ── Timing: find closest onset for each scorable stroke ──
    const deltas: number[] = []

    for (const strokeTime of bar.scorableStrokeTimes) {
      const windowStart = strokeTime - GOOD_MS / 1000
      const windowEnd = strokeTime + GOOD_MS / 1000

      const candidate = onsetBuffer
        .filter((o) => o.timestamp >= windowStart && o.timestamp <= windowEnd)
        .sort((a, b) => Math.abs(a.timestamp - strokeTime) - Math.abs(b.timestamp - strokeTime))[0]

      deltas.push(candidate ? Math.abs(candidate.timestamp - strokeTime) * 1000 : GOOD_MS + 1)
    }

    const avgDelta =
      deltas.length > 0 ? deltas.reduce((s, d) => s + d, 0) / deltas.length : GOOD_MS + 1

    const accuracy =
      avgDelta <= PERFECT_MS ? 'perfect' : avgDelta <= GOOD_MS ? 'good' : 'miss'

    // ── Chord: most common detection during this bar ──
    const chordsInBar = chordLog
      .filter((c) => c.time >= bar.startAudioTime && c.time < bar.endAudioTime && c.chord !== null)
      .map((c) => c.chord as Chord)

    let detectedChordForBar: Chord | null = null
    if (chordsInBar.length > 0) {
      const freq = new Map<Chord, number>()
      for (const c of chordsInBar) freq.set(c, (freq.get(c) ?? 0) + 1)
      detectedChordForBar = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]![0]
    }

    return {
      beatIndex: bar.barIndex,
      expectedChord: bar.chord,
      detectedChord: detectedChordForBar,
      timingDeltaMs: Math.round(avgDelta),
      accuracy,
    }
  }

  // ─── Scoring loop (runs every 80ms while session is active) ─────────────────

  function runScoringLoop(): void {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    // Score any bar whose endTime is at least 150ms in the past (buffer for late onsets)
    for (const bar of scheduledBars.value) {
      if (!barResults.value.has(bar.barIndex) && now > bar.endAudioTime + 0.15) {
        barResults.value.set(bar.barIndex, scoreBar(bar))
        sessionStore.recordBeat(barResults.value.get(bar.barIndex)!)
      }
    }

    // All bars scored → auto-complete
    if (
      isRunning.value &&
      scheduledBars.value.length > 0 &&
      barResults.value.size >= scheduledBars.value.length
    ) {
      completeSession()
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  function start(): void {
    if (isRunning.value || !exercise.value) return

    const ctx = getAudioContext()
    // Small lead-in so first block arrives at hit zone looking natural
    const startTime = ctx.currentTime + 0.3

    sessionStartAudioTime.value = startTime
    sessionBpm.value = metro.bpm
    scheduledBars.value = buildSchedule(exercise.value, startTime, metro.bpm)
    barResults.value = new Map()
    onsetBuffer.length = 0
    chordLog.length = 0
    isComplete.value = false
    isRunning.value = true

    if (!metro.isRunning) metro.start(startTime)

    sessionStore.startSession(exercise.value.id)
    sessionId = sessionStore.active?.id ?? ''

    scoringTimer = setInterval(runScoringLoop, 80)
  }

  function stop(): void {
    isRunning.value = false
    if (scoringTimer !== null) { clearInterval(scoringTimer); scoringTimer = null }
    if (metro.isRunning) metro.stop()
  }

  function completeSession(): void {
    stop()
    isComplete.value = true

    const session = sessionStore.completeSession()
    if (!session || !exercise.value) return

    if (session.tempoAccuracyPct >= exercise.value.unlockThreshold) {
      programStore.markExerciseCompleted(exercise.value.id)
    }
  }

  function reset(): void {
    stop()
    isComplete.value = false
    scheduledBars.value = []
    barResults.value = new Map()
    sessionStartAudioTime.value = null
    sessionBpm.value = 0
  }

  const completedBarCount = computed(() => barResults.value.size)

  onUnmounted(() => stop())

  return {
    isRunning,
    isComplete,
    scheduledBars,
    barResults,
    sessionStartAudioTime,
    sessionBpm,
    completedBarCount,
    start,
    stop,
    reset,
  }
}
