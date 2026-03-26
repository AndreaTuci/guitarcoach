import type { Song } from '@/types/program'

export const SONGS: Song[] = [
  {
    id: 'song-wywh',
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    chords: ['G', 'C', 'D', 'Am'],
    bpm: 76,
    unlockAfterExerciseId: 'p3w5d5e1',
  },
  {
    id: 'song-bobd',
    title: 'Boulevard of Broken Dreams',
    artist: 'Green Day',
    chords: ['Em', 'G', 'D', 'A'],
    bpm: 80,
    unlockAfterExerciseId: 'p3w6d2e1',
  },
  {
    id: 'song-ttp',
    title: 'Turn the Page',
    artist: 'Bob Seger',
    chords: ['Em', 'A', 'D'],
    bpm: 100,
    unlockAfterExerciseId: 'p4w7d5e1',
  },
  {
    id: 'song-sos',
    title: 'The Sound of Silence',
    artist: 'Simon & Garfunkel',
    chords: ['Am', 'G', 'C', 'F'],
    bpm: 100,
    unlockAfterExerciseId: 'p4w8d3e1',
  },
]
