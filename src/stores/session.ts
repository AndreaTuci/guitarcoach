import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PracticeSession, BeatResult } from '@/types/program'

const STORAGE_KEY = 'sessionHistory'

function loadHistory(): PracticeSession[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as PracticeSession[]
}

function saveHistory(history: PracticeSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export const useSessionStore = defineStore('session', () => {
  // History of all completed sessions (shown on Dashboard)
  const history = ref<PracticeSession[]>(loadHistory())

  // Currently active session — null when no exercise is in progress
  const active = ref<PracticeSession | null>(null)

  function startSession(exerciseId: string): void {
    active.value = {
      id: crypto.randomUUID(),
      exerciseId,
      startedAt: Date.now(),
      beatResults: [],
      tempoAccuracyPct: 0,
      chordAccuracyPct: 0,
    }
  }

  function recordBeat(result: BeatResult): void {
    if (!active.value) return
    active.value.beatResults.push(result)
  }

  function completeSession(): PracticeSession | null {
    if (!active.value) return null

    const session = active.value
    session.completedAt = Date.now()

    const beats = session.beatResults
    if (beats.length > 0) {
      session.tempoAccuracyPct =
        beats.filter((b) => b.accuracy !== 'miss').length / beats.length
      session.chordAccuracyPct =
        beats.filter((b) => b.detectedChord === b.expectedChord).length / beats.length
    }

    history.value.unshift(session) // newest first
    saveHistory(history.value)
    active.value = null
    return session
  }

  function abandonSession(): void {
    active.value = null
  }

  return {
    history,
    active,
    startSession,
    recordBeat,
    completeSession,
    abandonSession,
  }
})
