<script setup lang="ts">
  import type { Song } from '@/types/program'
  import ChordBadge from '@/components/atoms/ChordBadge.vue'
  import LockIcon from '@/components/atoms/LockIcon.vue'
  import BpmBadge from '@/components/atoms/BpmBadge.vue'

  defineProps<{ song: Song; isUnlocked: boolean }>()
</script>

<template>
  <div
    class="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 transition-opacity"
    :class="!isUnlocked && 'opacity-50'"
  >
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-white truncate">{{ song.title }}</p>
      <p class="text-xs text-[var(--color-inactive)]">{{ song.artist }}</p>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <ChordBadge v-for="chord in song.chords" :key="chord" :chord="chord" size="sm" />
    </div>

    <BpmBadge :bpm="song.bpm" />

    <span v-if="!isUnlocked" class="text-[var(--color-inactive)]" aria-label="Locked">
      <LockIcon :size="16" />
    </span>
    <span v-else class="h-4 w-4 rounded-full bg-[var(--color-perfect)]" aria-label="Unlocked" />
  </div>
</template>
