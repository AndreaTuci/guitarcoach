import type { Chord } from '@/types/program'

/**
 * 12-bin chromagram templates for open guitar chords.
 *
 * Index: 0=C 1=C# 2=D 3=D# 4=E 5=F 6=F# 7=G 8=G# 9=A 10=A# 11=B
 *
 * Weights reflect which notes actually dominate the microphone signal
 * for each open chord on EADGBE guitar, not just which notes are theoretically present.
 *
 * Key calibration decisions:
 *   - C: E(4) is the most prominent note in C voicing (3 of 5 strings), so raised to 1.5.
 *     C(0) is present but not the loudest string. G(7) is secondary.
 *   - D: F#(6) raised to 2.0 — it's the key distinguishing note (B string 2nd fret).
 *   - Dm vs F: they share F(5) and A(9). D(2) is heavily weighted in Dm;
 *     F(5) is the only root in F barre, so it gets the highest weight.
 *   - E vs Em: B(11) is unique and loud in E (3 strings); G(7) is the minor 3rd in Em.
 */
export const CHORD_TEMPLATES: Record<Chord, number[]> = {
  //           C     C#    D     D#    E     F     F#    G     G#    A     A#    B
  Em:        [0,    0,    0,    0,    1.5,  0,    0,    2.0,  0,    0,    0,    1.0],
  Am:        [1.0,  0,    0,    0,    1.0,  0,    0,    0,    0,    2.0,  0,    0  ],
  G:         [0,    0,    1.0,  0,    0,    0,    0,    2.0,  0,    0,    0,    1.5],
  C:         [1.5,  0,    0,    0,    1.5,  0,    0,    1.0,  0,    0,    0,    0  ],
  D:         [0,    0,    2.0,  0,    0,    0,    2.0,  0,    0,    1.0,  0,    0  ],
  A:         [0,    1.5,  0,    0,    1.0,  0,    0,    0,    0,    2.0,  0,    0  ],
  E:         [0,    0,    0,    0,    1.5,  0,    0,    0,    1.0,  0,    0,    2.0],
  Dm:        [0,    0,    2.5,  0,    0,    0.5,  0,    0,    0,    1.5,  0,    0  ],
  F:         [1.0,  0,    0,    0,    0,    2.5,  0,    0,    0,    0.8,  0,    0  ],
}
