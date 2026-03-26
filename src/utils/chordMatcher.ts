import type { Chord } from '@/types/program'
import { CHORD_TEMPLATES } from '@/utils/chordTemplates'

export interface ChordMatch {
  chord: Chord
  confidence: number // cosine similarity, 0–1
}

/**
 * Compares a chromagram against all chord templates using cosine similarity.
 * Returns the best match and its confidence score.
 *
 * Cosine similarity = dot(a, b) / (|a| * |b|)
 * Range: 0 (no match) to 1 (perfect match).
 */
// The best match must beat the second-best by at least this margin.
// Prevents reporting a chord when two candidates score similarly (ambiguous signal).
const MIN_MARGIN = 0.05

export function matchChord(chroma: number[]): ChordMatch {
  const chromaMag = magnitude(chroma)
  if (chromaMag === 0) return { chord: 'Em', confidence: 0 }

  const scores: { chord: Chord; score: number }[] = []

  for (const [chord, template] of Object.entries(CHORD_TEMPLATES) as [Chord, number[]][]) {
    scores.push({ chord, score: cosineSimilarity(chroma, template, chromaMag) })
  }

  scores.sort((a, b) => b.score - a.score)
  const best = scores[0]!
  const second = scores[1]!

  // Require a clear margin over the runner-up
  if (best.score - second.score < MIN_MARGIN) {
    return { chord: best.chord, confidence: best.score - (MIN_MARGIN - (best.score - second.score)) }
  }

  return { chord: best.chord, confidence: Math.max(0, best.score) }
}

function magnitude(v: number[]): number {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0))
}

function cosineSimilarity(a: number[], b: number[], aMag: number): number {
  const bMag = magnitude(b)
  if (bMag === 0) return 0
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0)
  return dot / (aMag * bMag)
}
