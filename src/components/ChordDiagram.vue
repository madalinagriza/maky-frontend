<template>
  <div class="chord-diagram" :style="{ width: width + 'px' }">
    <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" :width="width" :height="height">
      <!-- Nut (thick line at top if baseFret is 1) -->
      <rect
        v-if="diagram.baseFret === 1"
        :x="padding"
        :y="padding"
        :width="neckWidth"
        :height="nutHeight"
        fill="#333"
      />

      <!-- Base fret indicator -->
      <text
        v-if="diagram.baseFret > 1"
        :x="padding - 8"
        :y="padding + fretSpacing / 2 + 5"
        font-size="12"
        fill="#9ca3af"
        text-anchor="end"
      >
        {{ diagram.baseFret }}
      </text>

      <!-- Frets (horizontal lines) -->
      <line
        v-for="fret in 5"
        :key="'fret-' + fret"
        :x1="padding"
        :y1="padding + fret * fretSpacing"
        :x2="padding + neckWidth"
        :y2="padding + fret * fretSpacing"
        stroke="#555"
        stroke-width="1"
      />

      <!-- Strings (vertical lines) -->
      <line
        v-for="string in 6"
        :key="'string-' + string"
        :x1="padding + (string - 1) * stringSpacing"
        :y1="padding"
        :x2="padding + (string - 1) * stringSpacing"
        :y2="padding + 4 * fretSpacing"
        stroke="#888"
        stroke-width="1"
      />

      <!-- Muted/Open string indicators -->
      <template v-for="(fret, index) in diagram.frets" :key="'indicator-' + index">
        <!-- X for muted strings -->
        <text
          v-if="fret === -1"
          :x="padding + index * stringSpacing"
          :y="padding - 8"
          font-size="14"
          fill="#9ca3af"
          text-anchor="middle"
        >
          ×
        </text>
        <!-- O for open strings -->
        <circle
          v-else-if="fret === 0"
          :cx="padding + index * stringSpacing"
          :cy="padding - 10"
          r="5"
          fill="none"
          stroke="#9ca3af"
          stroke-width="1.5"
        />
      </template>

      <!-- Finger positions -->
      <template v-for="(fret, index) in diagram.frets" :key="'finger-' + index">
        <circle
          v-if="fret > 0"
          :cx="padding + index * stringSpacing"
          :cy="padding + (fret - 0.5) * fretSpacing"
          :r="dotRadius"
          fill="#818cf8"
        />
        <!-- Finger number -->
        <text
          v-if="fret > 0 && (diagram.fingers?.[index] ?? 0) > 0"
          :x="padding + index * stringSpacing"
          :y="padding + (fret - 0.5) * fretSpacing + 4"
          font-size="11"
          fill="#fff"
          text-anchor="middle"
          font-weight="bold"
        >
          {{ diagram.fingers?.[index] }}
        </text>
      </template>

      <!-- Barre indicator -->
      <rect
        v-for="(barre, idx) in diagram.barres || []"
        :key="'barre-' + idx"
        :x="padding - dotRadius"
        :y="padding + (barre - 0.5) * fretSpacing - dotRadius / 2"
        :width="neckWidth + dotRadius"
        :height="dotRadius"
        rx="4"
        fill="#818cf8"
        opacity="0.7"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChordDiagram } from '@/types/recommendation'

const props = withDefaults(defineProps<{
  diagram: ChordDiagram
  width?: number
}>(), {
  width: 120
})

// SVG dimensions
const padding = 25
const stringSpacing = 18
const fretSpacing = 22
const neckWidth = computed(() => 5 * stringSpacing)
const nutHeight = 4
const dotRadius = 7

const svgWidth = computed(() => neckWidth.value + padding * 2)
const svgHeight = computed(() => 4 * fretSpacing + padding * 2)

const height = computed(() => {
  return (props.width / svgWidth.value) * svgHeight.value
})
</script>

<style scoped>
.chord-diagram {
  display: inline-block;
}

.chord-diagram svg {
  display: block;
}
</style>
