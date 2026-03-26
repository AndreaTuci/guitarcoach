---

# GuitarCoach — Implementation Plan

## 1. Project Overview

A personal, browser-based guitar practice tool focused on rhythm and chord strumming.
The user wants to develop real strumming technique and chord transitions, not fingerpicking
or single-note melody. The app provides a structured 8-week program, a real-time beat lane
(Yousician-style), a metronome, and audio-based chord/timing feedback.

This is a personal tool — no multi-user auth, no cloud deployment requirement. The stack
should be as simple as the requirements allow.

---

## 2. Goals & Non-Goals

### Goals
- Help the user practice chord strumming with real-time timing feedback
- Detect which chord is being played via microphone
- Show a scrolling beat lane with chord blocks and strumming direction cues
- Guide the user through a structured 8-week curriculum
- Track session accuracy locally (localStorage, no server required initially)

### Non-Goals (at least initially)
- Single-note / fingerpicking exercises
- Tablature or sheet music display
- Multi-device sync or cloud persistence
- Multiple user accounts
- Mobile support (desktop/tablet only)

---

## 3. Program Content — 8-Week Curriculum

The program focuses entirely on open chords and strumming patterns.
Supported chord set: **Em, Am, G, C, D, A, E, Dm** (8 chords — explicitly stated in UI).

### Structure
- **4 Phases**, each 2 weeks
- Each week has 5 practice days with 2–3 exercises each
- Each exercise specifies: BPM, time signature, chord sequence, strumming pattern, duration

### Strumming Pattern Notation
Patterns are encoded as arrays of strokes: `D` = downstroke, `U` = upstroke, `-` = muted/rest.
Example: `["D", "-", "D", "U", "-", "U", "D", "U"]` for an 8th-note folk pattern.

### Phase Overview

| Phase | Weeks | Focus |
|-------|-------|-------|
| 1 | 1–2 | Open chord shapes (Em, Am, G, C). Downstroke only at 60 BPM. |
| 2 | 3–4 | Chord transitions. Alternating D-U at 70–80 BPM. |
| 3 | 5–6 | Full strumming patterns (D-DU-UDU). Songs introduced. |
| 4 | 7–8 | Speed and fluency. 90–110 BPM. Song full-takes. |

### Songs (unlocked progressively)
- "Wish You Were Here" — G, C, D, Am
- "Boulevard of Broken Dreams" — Em, G, D, A
- "Turn the Page" — Em, A, D
- "The Sound of Silence" — Am, G, C, F (introduces F chord as stretch goal)

---

## 4. Data Models (TypeScript, frontend-only)

All content lives in typed TypeScript data files — no backend database required.

```typescript
// types/program.ts

type Stroke = "D" | "U" | "-";

interface Exercise {
  id: string;
  title: string;
  description: string;
  bpm: number;
  timeSignature: [number, number];   // [4, 4]
  bars: number;
  chordSequence: string[];           // e.g. ["Em", "Em", "G", "G"]
  strummingPattern: Stroke[];        // per-beat strokes
  unlockThreshold: number;           // accuracy % to unlock next (0–1)
}

interface Day {
  id: string;
  dayNumber: number;                 // 1–5
  exercises: Exercise[];
}

interface Week {
  id: string;
  weekNumber: number;
  title: string;
  days: Day[];
}

interface Phase {
  id: string;
  phaseNumber: number;
  title: string;
  weeks: Week[];
}

interface Program {
  phases: Phase[];
}
```

Session state is kept in Pinia and persisted to `localStorage`:

```typescript
interface BeatResult {
  beatIndex: number;
  expectedChord: string;
  detectedChord: string | null;
  timingDeltaMs: number;
  accuracy: "perfect" | "good" | "miss";
}

interface PracticeSession {
  exerciseId: string;
  startedAt: number;
  completedAt?: number;
  beatResults: BeatResult[];
  tempoAccuracyPct: number;
  chordAccuracyPct: number;
}
```

---

## 5. Feature Deep-Dives

### 5A. Metronome

Implement entirely in the browser using the Web Audio API.

- **Scheduling strategy:** Look-ahead scheduler — do NOT use `setInterval`. Schedule beats
  ~100ms ahead using `AudioContext.currentTime` from inside a `Worker` or tight
  `setTimeout` loop. Reference: Chris Wilson's Web Audio scheduling article.
- **Click sound:** Generate programmatically via `OscillatorNode` (short decay envelope).
  No WAV assets needed — keep it dependency-free.
- **Controls exposed:**
  - BPM slider: range 40–220, step 1, displayed numerically
  - Tap-to-BPM button: calculates average interval of last 4 taps
  - Accent beat 1 toggle (higher pitch on beat 1)
  - Subdivision selector: quarter, eighth
  - Visual beat indicator: CSS transition flash, not a JS animation loop
- **Composable interface:**
```typescript
const { start, stop, setBpm, bpm, isRunning, currentBeat } = useMetronome()
```
- Fully usable as standalone panel, collapsible on smaller screens.

---

### 5B. Audio Input & Onset Detection

- Request `getUserMedia({ audio: true })` on explicit user click — never on page load.
- Share a single `AudioContext` instance via `services/audioEngine.ts` (singleton).
- Use `AnalyserNode` for both onset detection and chord detection.
- **Onset detection** (primary signal for timing scoring):
  - RMS amplitude follower over 10ms windows
  - Onset fires when RMS crosses threshold after minimum 80ms silence
  - Emits: `OnsetEvent { timestamp: number, rms: number }`
  - This is the primary timing signal — chord detection is secondary

> **Design note:** For rhythm/strumming focus, onset detection is more important than
> pitch detection. We are measuring *when* the user strums, not *what note* they play.

```typescript
const { start, stop, isListening, permissionState } = useAudioInput()
// emits: OnsetEvent (via event emitter or reactive ref)
```

---

### 5C. Chord Detection

Used to verify the user is playing the right chord shape, not for timing.

- Build a 12-bin chromagram (pitch class profile) from FFT frequency data.
- Match chromagram against templates for: **Em, Am, G, C, D, A, E, Dm**.
  Templates as constants in `utils/chordTemplates.ts` (document music theory source).
- Aggregate pitch data over a 500ms window before matching (chords ring).
- Emit `ChordDetectedEvent { chord: string, confidence: number, timestamp: number }`.
- Only report chord if confidence > 0.5; otherwise report `null`.
- Prefer pure JS — no WASM or external audio ML library needed at this scale.
- **Explicitly mark as experimental in the UI.**

```typescript
const { detectedChord, confidence } = useChordDetector()
```

Supported chord set is fixed at 8 chords. F chord (for Sound of Silence) is a stretch
goal — add template but do not guarantee detection quality.

---

### 5D. Tempo Detection & Scoring

- Compare each `OnsetEvent.timestamp` against the nearest expected beat timestamp.
  Expected beat timestamps are derived from metronome BPM + session start time.
- Delta window: ±50ms = **perfect** (green), ±100ms = **good** (amber), >100ms = **miss** (red).
- Running accuracy updates in real time.
- At each beat, also check `detectedChord` against `expectedChord` — result stored in
  `BeatResult`.
- Both tempo accuracy and chord accuracy are tracked separately in the session.

---

### 5E. Visual Beat Lane (Yousician-style)

**Visual reference:** `Screenshot from 2026-03-26 21-51-14.png` in the project root.
Future agents working on this component must read that screenshot before implementing.

From the reference screenshot, key design decisions:

- **Chord blocks**, not dots: each upcoming beat is a large, colored rectangular/trapezoidal
  block showing the chord name and strum direction arrows inside the block body.
- **Strum arrows:** Downstroke (↓) and upstroke (↑) drawn inside the block, repeated
  per subdivision. The visual weight matches the strumming pattern.
- **Color coding per chord:** each chord gets a distinct color (not per accuracy — that comes
  after the block passes the hit zone). Consistent chord → color mapping across the session.
- **Guitar neck motif** along the bottom edge of the lane (decorative fretboard).
- **Scrolling direction:** blocks travel right-to-left. Hit zone is a fixed vertical line
  ~20% from the left edge.
- **After the hit zone:** block changes color to accuracy color (green/amber/red/grey for
  missed).
- **Section labels** ("Part 1", "Part 2") displayed above the lane when the chord sequence
  loops.

Implementation:

- Render with `<canvas>` + `requestAnimationFrame`. No external rendering lib.
- Canvas composable:
```typescript
const { canvasRef, startRendering, stopRendering, pushBeatResult } =
  useBeatLane(bpm, chordSequence, strummingPattern)
```
- Block width proportional to beat duration at current BPM (constant visual speed,
  BPM changes block width not scroll speed).
- Color map for chords defined as a constant in `utils/chordColors.ts`.
- Must maintain 60fps. No layout thrash — all reads/writes inside rAF.

---

## 6. UX & Design Direction

Aesthetic: **dark, focused practice environment** — professional, not gamified.
Reference: the Yousician screenshot (`Screenshot from 2026-03-26 21-51-14.png`) for the
beat lane proportions, but the surrounding UI should be darker and more minimal.

- **Color palette:**
  - Background: near-black `#0D0D0D`
  - Surface: muted warm grey `#1A1A1A`
  - Accent: electric teal `#00D4AA` (single accent — commit to it)
  - Status: emerald `#22C55E` (perfect), amber `#F59E0B` (good), red `#EF4444` (miss)
  - Chord colors: a fixed palette of 8 saturated colors (one per chord)
- **Typography:**
  - BPM numbers, chord names: `JetBrains Mono` or `IBM Plex Mono`
  - Body: `Inter` is fine here despite general rule — or `DM Sans`
- **Layout:** single focused exercise screen. Beat lane takes center stage (~50% height).
  Metronome panel anchored bottom-right, collapsible. Chord display top-left.
- **Desktop-first.** Tablet functional. Phone not a target (mic UX is poor on phone).
- **Accessibility:** ARIA labels, keyboard-navigable, visible focus rings.

---

## 7. Tech Stack

Chosen for simplicity — no backend required.

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Vue 3 + Vite** | Lightweight, no SSR needed, fast dev cycle |
| Language | **TypeScript** (strict) | Type safety for audio event contracts |
| Styling | **Tailwind CSS v4** | Utility-first, pairs well with design tokens |
| State | **Pinia** | Simple, composable-friendly |
| Routing | **Vue Router 4** | Standard |
| Audio | **Web Audio API** (built-in) | No lib needed for metronome + onset |
| Chord lib | Custom chromagram (pure JS) | No deps, auditable |
| Persistence | **localStorage** via Pinia plugin | No backend, no auth |
| Linting | **ESLint** + **Prettier** | Standard |
| Runtime | **Node 22** | Developer's installed version — agents cannot run installs or scripts |

**No backend.** If session sync across devices becomes a goal later, a lightweight
Hono/Bun API with SQLite is the first choice — not Django + Postgres.

**No automated tests.** The developer tests manually. Do not write Vitest, Playwright,
or any other test files. Do not add test dependencies to `package.json`.

**No terminal execution by agents.** Node 22 is installed but agents cannot see it from
their terminal. Any command that needs to be run (`npm install`, `npm run dev`, etc.) must
be communicated to the developer as an instruction — not executed by the agent directly.
Agents must ask the developer to run it and wait for confirmation before proceeding.

---

## 8. Phased Implementation Plan

Each phase must:
1. Begin with a "What we build" summary
2. Include all file paths, component names, composable interfaces
3. List dependencies with versions (search before including)
4. End with a GATE block
5. Never write test files — all validation is manual by the developer
6. Never run terminal commands — communicate any required commands (`npm install`,
   `npm run dev`, etc.) to the developer as explicit instructions and wait for confirmation

---

### Phase 0 — Project Scaffold

**What we build:** Vite + Vue 3 + TypeScript project with Tailwind, Pinia, Vue Router,
ESLint/Prettier. Working dev server with a placeholder home page.

Deliverables:
- `vite.config.ts`, `tsconfig.json` (strict), `tailwind.config.ts`
- `src/main.ts`, `src/App.vue`, `src/router/index.ts`
- `src/stores/` — empty Pinia store files: `program.ts`, `session.ts`, `ui.ts`
- `src/types/program.ts` — all TypeScript interfaces from Section 4
- `src/composables/` directory structure
- ESLint flat config + Prettier
- `package.json` with all deps at pinned versions

GATE 0: `npm run dev` opens in browser, TypeScript compiles with zero errors, linting
passes. Developer approves structure before Phase 1.

---

### Phase 1 — Program Content

**What we build:** The full 8-week program as typed TypeScript data. No API, no DB.

Deliverables:
- `src/data/program.ts` — the full `Program` object (all phases, weeks, days, exercises)
- All 8 supported chord templates in `src/utils/chordTemplates.ts`
- Strumming pattern constants in `src/utils/strummingPatterns.ts`
- Chord color map in `src/utils/chordColors.ts`
- Pinia `program` store that imports and exposes program data, tracks
  completion state in localStorage

GATE 1: Developer reviews all exercises in browser console / Vue DevTools. Data shape
matches Section 3 curriculum. Approves before Phase 2.

---

### Phase 2 — Frontend Shell & Program Tracker

**What we build:** All screens, routing, and program overview UI (no audio yet).

Deliverables:
- Pages:
  - `/` → Dashboard: current week, next exercise CTA, overall progress
  - `/program` → Full 8-week timeline (locked/unlocked per exercise)
  - `/exercise/:id` → Exercise player shell (no audio — shows chord sequence, BPM)
  - `/songs` → Song library with unlock status
- Atomic components (Composition API + `<script setup>` only):
  - `ChordBadge.vue`, `BeatDot.vue`, `ProgressRing.vue`, `LockIcon.vue`
  - `ExerciseCard.vue`, `WeekRow.vue`, `PhaseHeader.vue`
  - `ProgramTimeline.vue`, `NavigationBar.vue`
- Design tokens as Tailwind CSS variables (accent, surface, status colors, chord colors)
- Dark theme only

GATE 2: Developer reviews all pages. Navigation works, data loads from store, visual
design direction confirmed. May provide feedback before Phase 3.

---

### Phase 3 — Metronome Engine

**What we build:** Full metronome, standalone + embedded in exercise player.

Deliverables:
- `src/composables/useMetronome.ts` — look-ahead scheduler
- `src/composables/useTapTempo.ts`
- `BpmSlider.vue`, `TapTempoButton.vue`, `SubdivisionSelector.vue`, `BeatIndicator.vue`
- `MetronomePanel.vue` organism (collapsible, Space = start/stop shortcut)
- Integrated into exercise player layout

GATE 3: Developer manually tests metronome at 60, 90, 120, 180 BPM. No jitter, tap tempo
works, visual syncs. Approves before Phase 4.

---

### Phase 4 — Audio Input & Onset Detection

**What we build:** Mic access, onset detection. This is the timing feedback core.

Deliverables:
- `src/services/audioEngine.ts` — singleton `AudioContext` (created on user gesture)
- `src/composables/useAudioInput.ts` — `getUserMedia`, exposes `start/stop/isListening/permissionState`
- `src/composables/useOnsetDetector.ts` — RMS envelope follower, emits `OnsetEvent`
- `AudioPermissionBanner.vue` (shown if mic denied)
- `AudioStatusBar.vue` — RMS level meter, onset flash indicator

GATE 4: Mic works, onset events fire visibly on each strum. Timing display is real-time.
Approves before Phase 5.

---

### Phase 5 — Chord Detection

**What we build:** Chromagram-based chord recognition.

Deliverables:
- `src/utils/chromagram.ts` — 12-bin pitch class profile from FFT data
- `src/utils/chordMatcher.ts` — matches chromagram against 8 chord templates
- `src/composables/useChordDetector.ts` — 500ms aggregation window, emits `ChordDetectedEvent`
- `ChordDisplay.vue` — real-time chord name + confidence bar. Shows "?" below 0.5.
- UI disclaimer: "Chord detection is experimental. Works best with clean, sustained chord
  shapes on acoustic guitar."

GATE 5: Developer plays each of 8 chords manually, at least 6/8 detected correctly in
normal conditions. Approves before Phase 6.

---

### Phase 6 — Exercise Player & Beat Lane

**What we build:** The full exercise experience — beat lane, real-time scoring, session save.

Deliverables:
- `src/composables/useBeatLane.ts` + `BeatLane.vue` (canvas-based)
  - See Section 5E for visual spec and reference screenshot
  - Chord blocks with strum arrows, chord colors, guitar neck motif, hit zone line
- Beat scoring: onset timestamps vs expected beat timestamps → `BeatResult`
- Chord scoring: `detectedChord` at each beat vs `expectedChord`
- Pinia `session` store: accumulates `BeatResult[]`, saves completed `PracticeSession`
  to localStorage on exercise completion
- Post-exercise summary screen: accuracy chart, beat event timeline, "Save & Continue"
  / "Retry" actions
- Progressive unlock: `tempoAccuracyPct > exercise.unlockThreshold` unlocks next exercise

GATE 6: Full end-to-end flow works. Developer completes 2–3 exercises, sessions persist
across refresh, unlock works. Approves before Phase 7.

---

### Phase 7 — Polish & Quality

**What we build:** Performance audit, error handling, final UX pass.

Deliverables:
- Lighthouse: performance > 85, accessibility > 95
- Web Audio: verify no `AudioContext` memory leaks on unmount
- Beat lane: 60fps verified at all BPMs
- Error boundaries for all async operations (mic denied, no audio support)
- Keyboard shortcut help overlay (`?` key)
- Loading skeletons for program data

GATE 7 (Final): Developer manually signs off on the complete application.

---

## 9. Decisions (pre-Phase 0)

1. **Beat lane scroll:** Continuous right-to-left (Yousician-style). ✓
2. **Metronome during exercises:** Keeps playing if it was already on. Onset detection
   runs in parallel — it does not replace the click.
3. **F chord:** Included from Phase 1 — template and data ready from the start.
   Chord set is now 9: Em, Am, G, C, D, A, E, Dm, F.
4. **Session history:** Dashboard shows a log of past sessions (date, exercise, accuracy).
5. **PWA / offline caching:** Deferred — not in scope for any current phase.

---

## 10. What You Should NOT Do

- Do not write production code before Gate 0 is approved.
- Do not write any test files (Vitest, Playwright, Jest, or otherwise). No test deps in
  `package.json`. The developer tests manually.
- Do not run terminal commands. Node 22 is installed but invisible to agents. Any command
  that needs running must be handed to the developer as a clear instruction to execute.
- Do not invent curriculum content not defined in Section 3.
- Do not use class-based Vue components — Composition API + `<script setup>` only.
- Do not use `any` in TypeScript without an inline comment explaining why.
- Do not add dependencies without checking current version and license.
- Do not put business logic in Vue components.
- Do not use `console.log` in committed code — use a configurable logger.
- Do not focus on single-note or fingerpicking detection — the current scope is
  chord strumming and rhythm only.
- Do not add a backend before the localStorage approach proves insufficient.
- Do not claim chord detection accuracy higher than it is — surface uncertainty in the UI.

---

## 11. Visual Reference

`Screenshot from 2026-03-26 21-51-14.png` (project root) — Yousician beat lane reference.

Key observations for implementation agents:
- Chord blocks are large, colored, trapezoidal/rectangular with rounded edges
- Strum direction arrows (↓) are drawn inside each block body
- Each chord has its own distinct color (D = blue, Em = orange/brown, A = purple in screenshot)
- Guitar fretboard decorates the bottom edge of the lane
- Hit zone is a fixed vertical line; blocks travel right-to-left
- Section labels ("Part 2") appear above the lane
- Background behind the lane is a contrasting color (green in reference — use dark teal
  or near-black in our palette)
