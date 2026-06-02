<template>
  <svg
    :width="WIDTH"
    :height="HEIGHT"
    style="display: block; background: #1a1a2e"
    ref="svgEl"
  >
    <!-- Core rectangle -->
    <rect
      x="0"
      :y="CORE_TOP"
      :width="WIDTH"
      :height="CORE_BOTTOM - CORE_TOP"
      fill="#4a4a6a"
      stroke="#888"
      stroke-width="1"
    />

    <!-- Core axis -->
    <line
      x1="0"
      :y1="CORE_AXIS_Y"
      :x2="WIDTH"
      :y2="CORE_AXIS_Y"
      stroke="#aaa"
      stroke-width="1"
      stroke-dasharray="6 4"
    />

    <!-- Ellipse -->
    <ellipse
      :cx="ellipse.cx"
      :cy="ellipse.cy"
      :rx="ellipse.a"
      :ry="ellipse.b"
      :transform="`rotate(${ellipse.theta}, ${ellipse.cx}, ${ellipse.cy})`"
      fill="none"
      stroke="#4fc3f7"
      stroke-width="2"
    />

    <!-- Center handle -->
    <circle
      :cx="ellipse.cx"
      :cy="ellipse.cy"
      r="6"
      fill="#ffd740"
      stroke="#fff"
      stroke-width="1.5"
      style="cursor: grab"
      @pointerdown="startDragCenter"
    />

    <!-- Apex handle -->
    <circle
      :cx="apex.x"
      :cy="apex.y"
      r="6"
      fill="#ff6e6e"
      stroke="#fff"
      stroke-width="1.5"
      style="cursor: grab"
      @pointerdown="startDragApex"
    />

    <!-- Labels -->
    <text :x="ellipse.cx + 10" :y="ellipse.cy - 10" fill="#ffd740" font-size="11">center</text>
    <text :x="apex.x + 10" :y="apex.y - 10" fill="#ff6e6e" font-size="11">apex</text>
  </svg>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { computeApex, computeEllipseFromApex, type EllipseParams } from '../geometry/ellipse'

const WIDTH = 800
const HEIGHT = 220
const CORE_TOP = 30
const CORE_BOTTOM = 190
const CORE_AXIS_Y = 110

const ellipse = ref<EllipseParams>({
  cx: 300,
  cy: CORE_AXIS_Y,
  a: 100,
  b: 50,
  theta: 45,
})

const apex = computed(() => computeApex(ellipse.value))

const svgEl = ref<SVGSVGElement | null>(null)

function svgPoint(e: PointerEvent): { x: number; y: number } {
  const svg = svgEl.value!
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const transformed = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: transformed.x, y: transformed.y }
}

// ── Center drag ────────────────────────────────────────────────
function startDragCenter(e: PointerEvent) {
  (e.target as Element).setPointerCapture(e.pointerId)

  function onMove(ev: PointerEvent) {
    const { x } = svgPoint(ev)
    ellipse.value = {
      ...ellipse.value,
      cx: Math.max(0, Math.min(WIDTH, x)),
    }
  }

  function onUp(ev: PointerEvent) {
    ;(ev.target as Element).releasePointerCapture(ev.pointerId)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

// ── Apex drag ─────────────────────────────────────────────────
const MIN_DX = 10

function startDragApex(e: PointerEvent) {
  (e.target as Element).setPointerCapture(e.pointerId)

  function onMove(ev: PointerEvent) {
    const { x, y } = svgPoint(ev)
    const { cx, cy, b } = ellipse.value

    const clampedY = Math.max(CORE_TOP + 2, Math.min(CORE_BOTTOM - 2, y))
    const clampedX = Math.max(cx + b + MIN_DX, x)

    const updated = computeEllipseFromApex(cx, cy, clampedX, clampedY, b)
    ellipse.value = { cx, cy, ...updated }
  }

  function onUp(ev: PointerEvent) {
    ;(ev.target as Element).releasePointerCapture(ev.pointerId)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}
</script>