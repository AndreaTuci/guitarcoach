<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { getAudioContext } from '@/services/audioEngine'
  import { CHORD_COLORS } from '@/utils/chordColors'
  import type { ScheduledBar } from '@/composables/useExerciseSession'
  import type { BeatResult } from '@/types/program'

  const props = defineProps<{
    scheduledBars: ScheduledBar[]
    barResults: Map<number, BeatResult>
    isRunning: boolean
  }>()

  // ─── Canvas setup ────────────────────────────────────────────────────────────

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let ctx2d: CanvasRenderingContext2D | null = null
  let rafId: number | null = null

  const SCROLL_SPEED = 120   // px/sec (constant — BPM changes block width)
  const HIT_ZONE_X_RATIO = 0.22
  const BLOCK_Y = 10
  const BLOCK_H = 95
  const BLOCK_GAP = 4
  const CANVAS_H = 160
  const NECK_Y_START = 116

  const STATUS_COLORS = {
    perfect: '#22c55e',
    good: '#f59e0b',
    miss: '#ef4444',
  }

  // ─── Rendering ───────────────────────────────────────────────────────────────

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = CANVAS_H
  }

  function drawGuitarNeck(W: number) {
    if (!ctx2d) return
    for (let i = 0; i < 6; i++) {
      const y = NECK_Y_START + (i / 5) * (CANVAS_H - NECK_Y_START - 4)
      const alpha = 0.12 + (i / 5) * 0.18
      const lineW = 0.6 + (5 - i) * 0.25
      ctx2d.strokeStyle = `rgba(190, 150, 70, ${alpha})`
      ctx2d.lineWidth = lineW
      ctx2d.beginPath()
      ctx2d.moveTo(0, y)
      ctx2d.lineTo(W, y)
      ctx2d.stroke()
    }
  }

  function drawBlock(
    x: number,
    blockW: number,
    color: string,
    chord: string,
    pattern: string[],
    dimmed: boolean,
    W: number,
  ) {
    if (!ctx2d || blockW <= 0) return

    ctx2d.save()
    ctx2d.globalAlpha = dimmed ? 0.55 : 0.92

    // Block fill
    ctx2d.fillStyle = color
    ctx2d.beginPath()
    ctx2d.roundRect(x, BLOCK_Y, blockW - BLOCK_GAP, BLOCK_H, 8)
    ctx2d.fill()

    // Only draw text if block is wide enough and at least partially visible
    const visibleX = Math.max(x, 0)
    const visibleRight = Math.min(x + blockW - BLOCK_GAP, W)
    if (visibleRight - visibleX < 20) {
      ctx2d.restore()
      return
    }

    // Chord name — anchored to visible center
    const labelCenterX = Math.max(x + (blockW - BLOCK_GAP) / 2, visibleX + 20)
    const clampedLabelX = Math.min(labelCenterX, visibleRight - 20)

    ctx2d.fillStyle = 'rgba(255,255,255,0.95)'
    ctx2d.font = 'bold 26px JetBrains Mono, monospace'
    ctx2d.textAlign = 'center'
    ctx2d.textBaseline = 'middle'
    ctx2d.fillText(chord, clampedLabelX, BLOCK_Y + BLOCK_H * 0.38)

    // Strum arrows — only if there's enough room
    if (blockW - BLOCK_GAP > 40) {
      const spacing = Math.min(18, (blockW - BLOCK_GAP - 16) / pattern.length)
      const arrowsW = spacing * pattern.length
      const arrowStartX = x + (blockW - BLOCK_GAP) / 2 - arrowsW / 2 + spacing / 2
      const arrowY = BLOCK_Y + BLOCK_H * 0.72
      const fontSize = Math.max(9, Math.min(13, spacing - 2))

      ctx2d.font = `${fontSize}px JetBrains Mono, monospace`

      for (let i = 0; i < pattern.length; i++) {
        const ax = arrowStartX + i * spacing
        if (ax < visibleX || ax > visibleRight) continue
        const stroke = pattern[i]
        ctx2d.fillStyle =
          stroke === 'D'
            ? 'rgba(255,255,255,0.9)'
            : stroke === 'U'
              ? 'rgba(167,139,250,0.9)'
              : 'rgba(255,255,255,0.25)'
        ctx2d.fillText(
          stroke === 'D' ? '↓' : stroke === 'U' ? '↑' : '·',
          ax,
          arrowY,
        )
      }
    }

    ctx2d.restore()
  }

  function drawFrame() {
    const canvas = canvasRef.value
    if (!canvas || !ctx2d) return

    const W = canvas.width
    const hitX = W * HIT_ZONE_X_RATIO
    const now = props.isRunning ? getAudioContext().currentTime : 0

    // Background
    ctx2d.fillStyle = '#0d0d0d'
    ctx2d.fillRect(0, 0, W, CANVAS_H)

    drawGuitarNeck(W)

    // Chord blocks
    for (const bar of props.scheduledBars) {
      const barDuration = bar.endAudioTime - bar.startAudioTime
      const blockW = barDuration * SCROLL_SPEED
      const x = hitX + (bar.startAudioTime - now) * SCROLL_SPEED

      if (x + blockW < 0 || x > W) continue

      const result = props.barResults.get(bar.barIndex)
      const color = result
        ? STATUS_COLORS[result.accuracy]
        : CHORD_COLORS[bar.chord]
      const dimmed = result !== undefined

      drawBlock(x, blockW, color, bar.chord, bar.strummingPattern as string[], dimmed, W)
    }

    // Hit zone line
    ctx2d.strokeStyle = '#00d4aa'
    ctx2d.lineWidth = 2
    ctx2d.setLineDash([4, 3])
    ctx2d.beginPath()
    ctx2d.moveTo(hitX, 0)
    ctx2d.lineTo(hitX, NECK_Y_START)
    ctx2d.stroke()
    ctx2d.setLineDash([])

    // Hit zone triangle marker at top
    ctx2d.fillStyle = '#00d4aa'
    ctx2d.beginPath()
    ctx2d.moveTo(hitX - 6, 0)
    ctx2d.lineTo(hitX + 6, 0)
    ctx2d.lineTo(hitX, 10)
    ctx2d.closePath()
    ctx2d.fill()

    rafId = requestAnimationFrame(drawFrame)
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  function startLoop() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(drawFrame)
  }

  function stopLoop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  }

  watch(() => props.isRunning, (running) => {
    if (running) startLoop()
    // Keep rendering after complete so final state is visible
  })

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    ctx2d = canvas.getContext('2d')
    resize()
    window.addEventListener('resize', resize)
    startLoop()
  })

  onUnmounted(() => {
    stopLoop()
    window.removeEventListener('resize', resize)
  })
</script>

<template>
  <div
    class="w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]"
    role="img"
    aria-label="Beat lane"
  >
    <canvas
      ref="canvasRef"
      class="block w-full"
      :height="160"
    />
  </div>
</template>
