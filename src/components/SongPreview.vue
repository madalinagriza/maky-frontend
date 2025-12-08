<template>
  <div class="song-preview">
    <!-- Album Art -->
    <img
      v-if="albumArtUrl"
      :src="albumArtUrl"
      :alt="`${title} album art`"
      class="album-art"
    />
    <div v-else class="album-art-placeholder">
      <span>🎵</span>
    </div>

    <!-- Preview Button -->
    <button
      v-if="previewUrl"
      class="preview-btn"
      :class="{ playing: isPlaying }"
      @click.stop="togglePreview"
      :title="isPlaying ? 'Pause preview' : 'Play preview'"
    >
      <span v-if="isPlaying">⏸</span>
      <span v-else>▶</span>
    </button>
    <span v-else class="no-preview" title="No preview available">
      🔇
    </span>

    <!-- Hidden audio element -->
    <audio
      ref="audioRef"
      :src="previewUrl"
      @ended="onEnded"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps<{
  previewUrl?: string
  albumArtUrl?: string
  title?: string
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)

function togglePreview() {
  if (!audioRef.value || !props.previewUrl) return

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    // Stop any other playing previews first
    document.querySelectorAll('audio').forEach((audio) => {
      if (audio !== audioRef.value) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    
    audioRef.value.play().catch((err) => {
      console.error('Error playing preview:', err)
    })
    isPlaying.value = true
  }
}

function onEnded() {
  isPlaying.value = false
}

function onError() {
  isPlaying.value = false
  console.error('Error loading audio preview')
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<style scoped>
.song-preview {
  display: flex;
  align-items: center;
  gap: 20px;
}

.album-art {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.album-art-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  background: #2d2d2d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.preview-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #D94634;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.preview-btn:hover {
  background: #F8717133;
  transform: scale(1.1);
}

.preview-btn.playing {
  background: #FAD386;
}

.no-preview {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  font-size: 18px;
  flex-shrink: 0;
}

audio {
  display: none;
}
</style>
