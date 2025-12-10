<template>
  <div 
    class="chord-tooltip-wrapper"
    @mouseenter="loadDiagram"
    @mouseleave="resetHover"
  >
    <slot></slot>
    
    <!-- Tooltip -->
    <div v-if="showTooltip && diagram" class="chord-tooltip">
      <div class="tooltip-header">{{ chordName }}</div>
      <div class="chord-diagram-mini">
        <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="chord-svg">
          <!-- Strings (vertical lines) -->
          <line
            v-for="string in 6"
            :key="`string-${string}`"
            :x1="margin + (string - 1) * stringSpacing"
            :y1="margin"
            :x2="margin + (string - 1) * stringSpacing"
            :y2="margin + fretHeight * numFrets"
            stroke="#e5e7eb"
            stroke-width="1.5"
          />
          
          <!-- Frets (horizontal lines) -->
          <line
            v-for="fret in numFrets + 1"
            :key="`fret-${fret}`"
            :x1="margin"
            :y1="margin + (fret - 1) * fretHeight"
            :x2="margin + stringSpacing * 5"
            :y2="margin + (fret - 1) * fretHeight"
            stroke="#e5e7eb"
            :stroke-width="fret === 1 && diagram.baseFret === 1 ? 3 : 1.5"
          />
          
          <!-- Base fret number -->
          <text
            v-if="diagram.baseFret > 1"
            :x="margin - 15"
            :y="margin + fretHeight / 2 + 4"
            class="fret-number"
            fill="#9ca3af"
            font-size="12"
          >
            {{ diagram.baseFret }}
          </text>
          
          <!-- Finger positions -->
          <template v-for="(fret, stringIndex) in diagram.frets" :key="`finger-${stringIndex}`">
            <circle
              v-if="fret > 0"
              :cx="margin + (stringIndex as number) * stringSpacing"
              :cy="margin + (fret - 0.5) * fretHeight"
              r="8"
              fill="#818cf8"
              stroke="#6366f1"
              stroke-width="2"
            />
          </template>
          
          <!-- Finger numbers -->
          <template v-for="(finger, stringIndex) in diagram.fingers" :key="`finger-text-${stringIndex}`">
            <text
              v-if="diagram.frets && (diagram.frets[stringIndex as number] ?? 0) > 0 && finger > 0"
              :x="margin + (stringIndex as number) * stringSpacing"
              :y="margin + ((diagram.frets[stringIndex as number] ?? 0) - 0.5) * fretHeight + 4"
              text-anchor="middle"
              fill="white"
              font-size="11"
              font-weight="bold"
            >
              {{ finger }}
            </text>
          </template>
          
          <!-- Open/muted strings -->
          <template v-for="(fret, stringIndex) in diagram.frets" :key="`open-${stringIndex}`">
            <text
              v-if="fret === 0"
              :x="margin + (stringIndex as number) * stringSpacing"
              :y="margin - 8"
              text-anchor="middle"
              fill="#10b981"
              font-size="14"
              font-weight="bold"
            >
              O
            </text>
          </template>
          
          <template v-for="(fret, stringIndex) in diagram.frets" :key="`muted-${stringIndex}`">
            <text
              v-if="fret === -1"
              :x="margin + (stringIndex as number) * stringSpacing"
              :y="margin - 8"
              text-anchor="middle"
              fill="#ef4444"
              font-size="14"
              font-weight="bold"
            >
              X
            </text>
          </template>
        </svg>
      </div>
    </div>
    
    <div v-else-if="showTooltip && loading" class="chord-tooltip loading-tooltip">
      Loading...
    </div>
    
    <div v-else-if="showTooltip && error" class="chord-tooltip error-tooltip">
      No diagram available
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getChordDiagramByName } from '@/services/chordService'
import type { ChordDiagram } from '@/types/recommendation'

const props = defineProps<{
  chordName: string
}>()

const showTooltip = ref(false)
const diagram = ref<ChordDiagram | null>(null)
const loading = ref(false)
const error = ref(false)
let hoverTimeout: number | null = null

// SVG dimensions
const stringSpacing = 20
const fretHeight = 25
const numFrets = 4
const margin = 20
const svgWidth = computed(() => margin * 2 + stringSpacing * 5)
const svgHeight = computed(() => margin * 2 + fretHeight * numFrets)

async function loadDiagram() {
  // Delay showing tooltip slightly to avoid flickering on quick hovers
  hoverTimeout = window.setTimeout(async () => {
    showTooltip.value = true
    loading.value = true
    error.value = false
    
    try {
      const diagrams = await getChordDiagramByName(props.chordName)
      
      if (diagrams && diagrams.length > 0 && diagrams[0]) {
        diagram.value = diagrams[0] // Use first diagram
      } else {
        error.value = true
      }
    } catch (err) {
      console.error('Error fetching chord diagram:', err)
      error.value = true
    } finally {
      loading.value = false
    }
  }, 300) // 300ms delay
}

function resetHover() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  showTooltip.value = false
  diagram.value = null
  loading.value = false
  error.value = false
}
</script>

<style scoped>
.chord-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.chord-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: #1f2937;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  pointer-events: none;
  min-width: 140px;
}

.chord-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1f2937;
}

.tooltip-header {
  text-align: center;
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 8px;
  font-size: 14px;
}

.chord-diagram-mini {
  display: flex;
  justify-content: center;
}

.chord-svg {
  width: 100%;
  max-width: 140px;
  height: auto;
}

.loading-tooltip,
.error-tooltip {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 8px 12px;
}

.error-tooltip {
  color: #ef4444;
}
</style>
