import type { Stroke } from '@/types/program'

/**
 * Named strumming patterns used across the curriculum.
 * Each array represents one bar's strokes.
 *
 * D = downstroke  U = upstroke  - = muted/rest (hand moves but doesn't hit strings)
 */
export const STRUMMING_PATTERNS = {
  /** Phase 1 — pure downstrokes, one per beat */
  QUARTER_DOWN: ['D', 'D', 'D', 'D'] as Stroke[],

  /** Phase 2 — 8th-note down-up alternating */
  EIGHTH_ALTERNATING: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'] as Stroke[],

  /** Phase 3 — folk pattern: D - DU - UDU (the most common strumming pattern) */
  FOLK: ['D', '-', 'D', 'U', '-', 'U', 'D', 'U'] as Stroke[],

  /** Phase 4 — accented folk: emphasis on beats 1 and 3 */
  FOLK_ACCENTED: ['D', '-', 'D', 'U', 'D', 'U', 'D', 'U'] as Stroke[],
} as const

export type StrummingPatternKey = keyof typeof STRUMMING_PATTERNS
