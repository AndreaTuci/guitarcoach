import type { Program } from '@/types/program'
import { STRUMMING_PATTERNS as P } from '@/utils/strummingPatterns'

export const PROGRAM: Program = {
  phases: [
    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 1 — Weeks 1–2: Open chord shapes, downstrokes only, 60 BPM
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'p1',
      phaseNumber: 1,
      title: 'First Shapes',
      description: 'Learn Em, Am, G, C. Downstrokes only. Focus on clean chord shapes and muting.',
      weeks: [
        {
          id: 'p1w1',
          weekNumber: 1,
          title: 'Em & Am',
          days: [
            {
              id: 'p1w1d1',
              dayNumber: 1,
              exercises: [
                {
                  id: 'p1w1d1e1',
                  title: 'Em — Hold & Feel',
                  description: 'Hold Em for 4 bars. Focus on clean finger placement and all strings ringing.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['Em', 'Em', 'Em', 'Em'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p1w1d1e2',
                  title: 'Am — Hold & Feel',
                  description: 'Hold Am for 4 bars. Keep your wrist relaxed. All 5 strings should ring.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['Am', 'Am', 'Am', 'Am'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
              ],
            },
            {
              id: 'p1w1d2',
              dayNumber: 2,
              exercises: [
                {
                  id: 'p1w1d2e1',
                  title: 'Em → Am Transition',
                  description: 'Two bars of Em, two bars of Am. Lift fingers only when you must.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['Em', 'Em', 'Am', 'Am'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p1w1d2e2',
                  title: 'Em → Am × 2',
                  description: 'Repeat the Em–Am change twice. Stay with the beat.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'Em', 'Am', 'Am', 'Em', 'Em', 'Am', 'Am'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
              ],
            },
            {
              id: 'p1w1d3',
              dayNumber: 3,
              exercises: [
                {
                  id: 'p1w1d3e1',
                  title: 'Am → Em Transition',
                  description: 'Now start on Am. The finger movement is slightly different coming back.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['Am', 'Am', 'Em', 'Em'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p1w1d3e2',
                  title: 'Am → Em × 2',
                  description: 'Two full cycles. Keep the tempo — chord changes happen on beat 1.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Am', 'Am', 'Em', 'Em', 'Am', 'Am', 'Em', 'Em'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p1w1d4',
              dayNumber: 4,
              exercises: [
                {
                  id: 'p1w1d4e1',
                  title: 'Em ↔ Am — One Bar Each',
                  description: 'Switch every bar. This forces a faster transition. Slow down if needed.',
                  bpm: 55,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'Am', 'Em', 'Am', 'Em', 'Am', 'Em', 'Am'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p1w1d5',
              dayNumber: 5,
              exercises: [
                {
                  id: 'p1w1d5e1',
                  title: 'Em ↔ Am — Fluency Check',
                  description: 'One bar each at 60 BPM. This is your Week 1 benchmark.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'Am', 'Em', 'Am', 'Em', 'Am', 'Em', 'Am'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.7,
                },
              ],
            },
          ],
        },
        {
          id: 'p1w2',
          weekNumber: 2,
          title: 'G & C',
          days: [
            {
              id: 'p1w2d1',
              dayNumber: 1,
              exercises: [
                {
                  id: 'p1w2d1e1',
                  title: 'G — Hold & Feel',
                  description: 'G is a big stretch. Take your time placing all three fingers before strumming.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['G', 'G', 'G', 'G'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p1w2d1e2',
                  title: 'C — Hold & Feel',
                  description: 'C shape. Watch your 1st finger — it must not mute the B string.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['C', 'C', 'C', 'C'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
              ],
            },
            {
              id: 'p1w2d2',
              dayNumber: 2,
              exercises: [
                {
                  id: 'p1w2d2e1',
                  title: 'G → C Transition',
                  description: 'G and C share one finger (ring finger stays on 3rd string). Find the anchor.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['G', 'G', 'C', 'C', 'G', 'G', 'C', 'C'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p1w2d3',
              dayNumber: 3,
              exercises: [
                {
                  id: 'p1w2d3e1',
                  title: 'Em → G → Am → C',
                  description: 'One bar each of all four chords. The core of hundreds of songs.',
                  bpm: 58,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'G', 'Am', 'C', 'Em', 'G', 'Am', 'C'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p1w2d4',
              dayNumber: 4,
              exercises: [
                {
                  id: 'p1w2d4e1',
                  title: 'C → G → Am → Em',
                  description: 'Same four chords, reversed direction. Some transitions feel different.',
                  bpm: 58,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['C', 'G', 'Am', 'Em', 'C', 'G', 'Am', 'Em'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p1w2d5',
              dayNumber: 5,
              exercises: [
                {
                  id: 'p1w2d5e1',
                  title: 'Phase 1 Benchmark',
                  description: 'Em → G → Am → C at 60 BPM. Clean shapes, steady timing. Phase 1 complete.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'G', 'Am', 'C', 'Em', 'G', 'Am', 'C'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.7,
                },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 2 — Weeks 3–4: Chord transitions, D-U strumming, add D and A, 70–80 BPM
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'p2',
      phaseNumber: 2,
      title: 'Transitions & Rhythm',
      description: 'Add D-U strumming, introduce D and A chords, speed up to 70–80 BPM.',
      weeks: [
        {
          id: 'p2w3',
          weekNumber: 3,
          title: 'Down-Up Strumming',
          days: [
            {
              id: 'p2w3d1',
              dayNumber: 1,
              exercises: [
                {
                  id: 'p2w3d1e1',
                  title: 'Em — 8th Note Strum',
                  description: 'Introduce D-U on Em. Keep the wrist moving even on the "up" when you miss.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['Em', 'Em', 'Em', 'Em'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p2w3d1e2',
                  title: 'Am — 8th Note Strum',
                  description: 'Same pattern on Am. The chord shape is compact — easier to keep clean.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['Am', 'Am', 'Am', 'Am'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.6,
                },
              ],
            },
            {
              id: 'p2w3d2',
              dayNumber: 2,
              exercises: [
                {
                  id: 'p2w3d2e1',
                  title: 'G & C — 8th Note Strum',
                  description: 'Apply D-U to G and C. G may feel loose — focus on the top strings.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['G', 'G', 'C', 'C', 'G', 'G', 'C', 'C'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.6,
                },
              ],
            },
            {
              id: 'p2w3d3',
              dayNumber: 3,
              exercises: [
                {
                  id: 'p2w3d3e1',
                  title: 'D Chord — Introduction',
                  description: 'New chord: D. Three fingers clustered on frets 2–3. Avoid the low E string.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['D', 'D', 'D', 'D'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p2w3d3e2',
                  title: 'G → C → D',
                  description: 'The most common progression in pop music. Start slow.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 6,
                  chordSequence: ['G', 'G', 'C', 'C', 'D', 'D'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p2w3d4',
              dayNumber: 4,
              exercises: [
                {
                  id: 'p2w3d4e1',
                  title: 'G → C → D — 8th Note Strum',
                  description: 'Same progression with D-U. Chord changes still on beat 1.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 6,
                  chordSequence: ['G', 'G', 'C', 'C', 'D', 'D'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p2w3d5',
              dayNumber: 5,
              exercises: [
                {
                  id: 'p2w3d5e1',
                  title: 'Em → G → C → D',
                  description: 'Full four-chord loop with D-U at 70 BPM.',
                  bpm: 70,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'G', 'C', 'D', 'Em', 'G', 'C', 'D'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.65,
                },
              ],
            },
          ],
        },
        {
          id: 'p2w4',
          weekNumber: 4,
          title: 'Add A & E, Speed Up',
          days: [
            {
              id: 'p2w4d1',
              dayNumber: 1,
              exercises: [
                {
                  id: 'p2w4d1e1',
                  title: 'A Chord — Introduction',
                  description: 'New chord: A. Three fingers on the same fret — keep them bunched together.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['A', 'A', 'A', 'A'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p2w4d1e2',
                  title: 'D → A Transition',
                  description: 'D and A are closely related. Practice the move both ways.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['D', 'D', 'A', 'A', 'D', 'D', 'A', 'A'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p2w4d2',
              dayNumber: 2,
              exercises: [
                {
                  id: 'p2w4d2e1',
                  title: 'E Chord — Introduction',
                  description: 'E major is Em with one extra finger. Anchor on the Em shape first.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['E', 'E', 'E', 'E'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p2w4d2e2',
                  title: 'Em ↔ E Toggle',
                  description: 'Add / remove one finger. Practice hearing the major vs minor difference.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'Em', 'E', 'E', 'Em', 'Em', 'E', 'E'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p2w4d3',
              dayNumber: 3,
              exercises: [
                {
                  id: 'p2w4d3e1',
                  title: 'Em → Am → D → A',
                  description: 'Minor-flavoured loop using four chords. Common in rock.',
                  bpm: 70,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'Am', 'D', 'A', 'Em', 'Am', 'D', 'A'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p2w4d4',
              dayNumber: 4,
              exercises: [
                {
                  id: 'p2w4d4e1',
                  title: 'Dm — Introduction',
                  description: 'D minor. Fingers cluster on frets 1–3. Avoid low E and A strings.',
                  bpm: 65,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['Dm', 'Dm', 'Dm', 'Dm'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p2w4d4e2',
                  title: 'Am → Dm → E',
                  description: 'Classic minor key progression (i – iv – V in A minor).',
                  bpm: 70,
                  timeSignature: [4, 4],
                  bars: 6,
                  chordSequence: ['Am', 'Am', 'Dm', 'Dm', 'E', 'E'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p2w4d5',
              dayNumber: 5,
              exercises: [
                {
                  id: 'p2w4d5e1',
                  title: 'Phase 2 Benchmark',
                  description: 'Em → G → C → D at 80 BPM with D-U strumming. All transitions must be clean.',
                  bpm: 80,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'G', 'C', 'D', 'Em', 'G', 'C', 'D'],
                  strummingPattern: P.EIGHTH_ALTERNATING,
                  unlockThreshold: 0.7,
                },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3 — Weeks 5–6: Folk strumming pattern, songs introduced, 75–85 BPM
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'p3',
      phaseNumber: 3,
      title: 'Strumming & Songs',
      description: 'Master the folk strumming pattern (D-DU-UDU). First songs.',
      weeks: [
        {
          id: 'p3w5',
          weekNumber: 5,
          title: 'Folk Pattern',
          days: [
            {
              id: 'p3w5d1',
              dayNumber: 1,
              exercises: [
                {
                  id: 'p3w5d1e1',
                  title: 'Folk Pattern — Em Only',
                  description: 'D – DU – UDU. Keep the wrist moving constantly. Muted strokes are still strokes.',
                  bpm: 70,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['Em', 'Em', 'Em', 'Em'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.6,
                },
                {
                  id: 'p3w5d1e2',
                  title: 'Folk Pattern — Am & G',
                  description: 'Apply the folk pattern while switching chord. Slower.',
                  bpm: 68,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Am', 'Am', 'G', 'G', 'Am', 'Am', 'G', 'G'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.6,
                },
              ],
            },
            {
              id: 'p3w5d2',
              dayNumber: 2,
              exercises: [
                {
                  id: 'p3w5d2e1',
                  title: 'Folk Pattern — C & D',
                  description: 'C and D with the folk strum. D is tricky — stay relaxed.',
                  bpm: 70,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['C', 'C', 'D', 'D', 'C', 'C', 'D', 'D'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p3w5d3',
              dayNumber: 3,
              exercises: [
                {
                  id: 'p3w5d3e1',
                  title: 'G → C → D Folk Loop',
                  description: 'The pop progression with the folk pattern. This is most of your favourite songs.',
                  bpm: 72,
                  timeSignature: [4, 4],
                  bars: 6,
                  chordSequence: ['G', 'G', 'C', 'C', 'D', 'D'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p3w5d4',
              dayNumber: 4,
              exercises: [
                {
                  id: 'p3w5d4e1',
                  title: 'Em → G → C → D Folk',
                  description: 'Full four-chord folk strum at 75 BPM.',
                  bpm: 75,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'G', 'C', 'D', 'Em', 'G', 'C', 'D'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p3w5d5',
              dayNumber: 5,
              exercises: [
                {
                  id: 'p3w5d5e1',
                  title: 'Folk Pattern Benchmark',
                  description: 'Em → G → C → D at 80 BPM folk pattern. This unlocks the first song.',
                  bpm: 80,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'G', 'C', 'D', 'Em', 'G', 'C', 'D'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.7,
                },
              ],
            },
          ],
        },
        {
          id: 'p3w6',
          weekNumber: 6,
          title: 'First Songs',
          days: [
            {
              id: 'p3w6d1',
              dayNumber: 1,
              exercises: [
                {
                  id: 'p3w6d1e1',
                  title: 'Wish You Were Here — Chord Prep',
                  description: 'G, C, D, Am loop. Get familiar with the chord order.',
                  bpm: 72,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['G', 'C', 'D', 'Am', 'G', 'C', 'D', 'Am'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p3w6d2',
              dayNumber: 2,
              exercises: [
                {
                  id: 'p3w6d2e1',
                  title: 'Wish You Were Here — Full Take',
                  description: 'Full song form: verse G–C–D–Am repeated. Keep it steady.',
                  bpm: 76,
                  timeSignature: [4, 4],
                  bars: 16,
                  chordSequence: [
                    'G', 'C', 'D', 'Am', 'G', 'C', 'D', 'Am',
                    'G', 'C', 'D', 'Am', 'G', 'C', 'D', 'Am',
                  ],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p3w6d3',
              dayNumber: 3,
              exercises: [
                {
                  id: 'p3w6d3e1',
                  title: 'Boulevard of Broken Dreams — Chord Prep',
                  description: 'Em, G, D, A loop. Darker feel — minor opening chord.',
                  bpm: 76,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Em', 'G', 'D', 'A', 'Em', 'G', 'D', 'A'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p3w6d4',
              dayNumber: 4,
              exercises: [
                {
                  id: 'p3w6d4e1',
                  title: 'Boulevard of Broken Dreams — Full Take',
                  description: 'Full verse form. Em–G–D–A × 4.',
                  bpm: 80,
                  timeSignature: [4, 4],
                  bars: 16,
                  chordSequence: [
                    'Em', 'G', 'D', 'A', 'Em', 'G', 'D', 'A',
                    'Em', 'G', 'D', 'A', 'Em', 'G', 'D', 'A',
                  ],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p3w6d5',
              dayNumber: 5,
              exercises: [
                {
                  id: 'p3w6d5e1',
                  title: 'Phase 3 Benchmark',
                  description: 'Both song progressions back to back at 80 BPM. Smooth transitions.',
                  bpm: 80,
                  timeSignature: [4, 4],
                  bars: 16,
                  chordSequence: [
                    'G', 'C', 'D', 'Am', 'G', 'C', 'D', 'Am',
                    'Em', 'G', 'D', 'A', 'Em', 'G', 'D', 'A',
                  ],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.7,
                },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 4 — Weeks 7–8: Speed and fluency, 90–110 BPM, full song takes
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'p4',
      phaseNumber: 4,
      title: 'Speed & Fluency',
      description: 'Push BPM to 90–110. Introduce F chord. Complete all four songs.',
      weeks: [
        {
          id: 'p4w7',
          weekNumber: 7,
          title: 'Speed Up',
          days: [
            {
              id: 'p4w7d1',
              dayNumber: 1,
              exercises: [
                {
                  id: 'p4w7d1e1',
                  title: 'G → C → D → Em at 90 BPM',
                  description: 'Accented folk pattern. Higher BPM means tighter transitions.',
                  bpm: 90,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['G', 'C', 'D', 'Em', 'G', 'C', 'D', 'Em'],
                  strummingPattern: P.FOLK_ACCENTED,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p4w7d2',
              dayNumber: 2,
              exercises: [
                {
                  id: 'p4w7d2e1',
                  title: 'F Chord — Introduction',
                  description: 'F is the hardest open chord. Barre index across frets 1–2. Take it slow.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 4,
                  chordSequence: ['F', 'F', 'F', 'F'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.5,
                },
                {
                  id: 'p4w7d2e2',
                  title: 'C → F Transition',
                  description: 'C to F is the trickiest common change. Index partially barres on F.',
                  bpm: 60,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['C', 'C', 'F', 'F', 'C', 'C', 'F', 'F'],
                  strummingPattern: P.QUARTER_DOWN,
                  unlockThreshold: 0.55,
                },
              ],
            },
            {
              id: 'p4w7d3',
              dayNumber: 3,
              exercises: [
                {
                  id: 'p4w7d3e1',
                  title: 'Wish You Were Here at 95 BPM',
                  description: 'G–C–D–Am folk pattern, faster. Aim for zero hesitation on changes.',
                  bpm: 95,
                  timeSignature: [4, 4],
                  bars: 16,
                  chordSequence: [
                    'G', 'C', 'D', 'Am', 'G', 'C', 'D', 'Am',
                    'G', 'C', 'D', 'Am', 'G', 'C', 'D', 'Am',
                  ],
                  strummingPattern: P.FOLK_ACCENTED,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p4w7d4',
              dayNumber: 4,
              exercises: [
                {
                  id: 'p4w7d4e1',
                  title: 'Boulevard of Broken Dreams at 95 BPM',
                  description: 'Em–G–D–A faster. The Em→G transition is your key challenge here.',
                  bpm: 95,
                  timeSignature: [4, 4],
                  bars: 16,
                  chordSequence: [
                    'Em', 'G', 'D', 'A', 'Em', 'G', 'D', 'A',
                    'Em', 'G', 'D', 'A', 'Em', 'G', 'D', 'A',
                  ],
                  strummingPattern: P.FOLK_ACCENTED,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p4w7d5',
              dayNumber: 5,
              exercises: [
                {
                  id: 'p4w7d5e1',
                  title: 'Turn the Page — Chord Prep',
                  description: 'Em, A, D loop. The A here resolves to D nicely — listen for it.',
                  bpm: 90,
                  timeSignature: [4, 4],
                  bars: 6,
                  chordSequence: ['Em', 'Em', 'A', 'A', 'D', 'D'],
                  strummingPattern: P.FOLK_ACCENTED,
                  unlockThreshold: 0.65,
                },
              ],
            },
          ],
        },
        {
          id: 'p4w8',
          weekNumber: 8,
          title: 'Full Songs',
          days: [
            {
              id: 'p4w8d1',
              dayNumber: 1,
              exercises: [
                {
                  id: 'p4w8d1e1',
                  title: 'Turn the Page — Full Take',
                  description: 'Em–A–D × 4 at 100 BPM. Strong downbeat accents.',
                  bpm: 100,
                  timeSignature: [4, 4],
                  bars: 12,
                  chordSequence: [
                    'Em', 'Em', 'A', 'A', 'D', 'D',
                    'Em', 'Em', 'A', 'A', 'D', 'D',
                  ],
                  strummingPattern: P.FOLK_ACCENTED,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p4w8d2',
              dayNumber: 2,
              exercises: [
                {
                  id: 'p4w8d2e1',
                  title: 'Am → F Transition',
                  description: 'Sound of Silence prep. Am to F is a long stretch — plan your fingers early.',
                  bpm: 70,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Am', 'Am', 'F', 'F', 'Am', 'Am', 'F', 'F'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.6,
                },
              ],
            },
            {
              id: 'p4w8d3',
              dayNumber: 3,
              exercises: [
                {
                  id: 'p4w8d3e1',
                  title: 'Sound of Silence — Chord Prep',
                  description: 'Am, G, C, F. The F is new at speed — take it slow first.',
                  bpm: 75,
                  timeSignature: [4, 4],
                  bars: 8,
                  chordSequence: ['Am', 'G', 'C', 'F', 'Am', 'G', 'C', 'F'],
                  strummingPattern: P.FOLK,
                  unlockThreshold: 0.6,
                },
              ],
            },
            {
              id: 'p4w8d4',
              dayNumber: 4,
              exercises: [
                {
                  id: 'p4w8d4e1',
                  title: 'Sound of Silence — Full Take',
                  description: 'Am–G–C–F × 4 at 100 BPM. You have learned all 9 chords.',
                  bpm: 100,
                  timeSignature: [4, 4],
                  bars: 16,
                  chordSequence: [
                    'Am', 'G', 'C', 'F', 'Am', 'G', 'C', 'F',
                    'Am', 'G', 'C', 'F', 'Am', 'G', 'C', 'F',
                  ],
                  strummingPattern: P.FOLK_ACCENTED,
                  unlockThreshold: 0.65,
                },
              ],
            },
            {
              id: 'p4w8d5',
              dayNumber: 5,
              exercises: [
                {
                  id: 'p4w8d5e1',
                  title: 'Final Benchmark — All Songs',
                  description: 'One loop of each song progression back to back. 100 BPM. This is the end of the program.',
                  bpm: 100,
                  timeSignature: [4, 4],
                  bars: 16,
                  chordSequence: [
                    'G', 'C', 'D', 'Am',    // Wish You Were Here
                    'Em', 'G', 'D', 'A',    // Boulevard of Broken Dreams
                    'Em', 'A', 'D', 'D',    // Turn the Page
                    'Am', 'G', 'C', 'F',    // Sound of Silence
                  ],
                  strummingPattern: P.FOLK_ACCENTED,
                  unlockThreshold: 0.7,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
