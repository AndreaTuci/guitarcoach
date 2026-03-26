// Supported chord set — 9 open guitar chords
export type Chord = 'Em' | 'Am' | 'G' | 'C' | 'D' | 'A' | 'E' | 'Dm' | 'F'

// Strumming stroke notation
export type Stroke = 'D' | 'U' | '-'

export interface Exercise {
  id: string
  title: string
  description: string
  bpm: number
  timeSignature: [number, number] // e.g. [4, 4]
  bars: number
  chordSequence: Chord[] // one chord per bar
  strummingPattern: Stroke[] // strokes per beat (length = timeSignature[0] * subdivisions)
  unlockThreshold: number // accuracy 0–1 required to unlock the next exercise
}

export interface Day {
  id: string
  dayNumber: number // 1–5
  exercises: Exercise[]
}

export interface Week {
  id: string
  weekNumber: number
  title: string
  days: Day[]
}

export interface Phase {
  id: string
  phaseNumber: number
  title: string
  description: string
  weeks: Week[]
}

export interface Program {
  phases: Phase[]
}

// ─── Song types ────────────────────────────────────────────────────────────────

export interface Song {
  id: string
  title: string
  artist: string
  chords: Chord[]
  bpm: number
  unlockAfterExerciseId: string // exercise that must be completed to unlock
}

// ─── Session types ─────────────────────────────────────────────────────────────

export type AccuracyLabel = 'perfect' | 'good' | 'miss'

export interface BeatResult {
  beatIndex: number
  expectedChord: Chord
  detectedChord: Chord | null
  timingDeltaMs: number
  accuracy: AccuracyLabel
}

export interface PracticeSession {
  id: string
  exerciseId: string
  startedAt: number // Unix ms
  completedAt?: number // Unix ms
  beatResults: BeatResult[]
  tempoAccuracyPct: number // 0–1
  chordAccuracyPct: number // 0–1
}
