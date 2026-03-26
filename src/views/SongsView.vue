<script setup lang="ts">
  import { useProgramStore } from '@/stores/program'
  import SongRow from '@/components/molecules/SongRow.vue'

  const store = useProgramStore()
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="mb-2 text-2xl font-bold text-white">Songs</h1>
    <p class="mb-8 text-sm text-[var(--color-inactive)]">
      Songs unlock as you progress through the program.
    </p>

    <div class="space-y-3">
      <SongRow
        v-for="song in store.songs"
        :key="song.id"
        :song="song"
        :is-unlocked="store.isSongUnlocked(song)"
      />
    </div>
  </div>
</template>
