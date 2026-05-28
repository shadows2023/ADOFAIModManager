<template>
  <div class="status-banner">
    <div class="status-dot" :class="{ active: !!gameInfo }">
      <span v-if="!!gameInfo" class="status-pulse"></span>
    </div>
    <span class="status-text">
      {{ gameInfo ? gameInfo.name : 'No game selected' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const gameInfo = computed(() => gameStore.gameInfo)
</script>

<style scoped>
.status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--danger);
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 0 8px var(--danger-glow);
  transition: all var(--transition);
}

.status-dot.active {
  background: var(--success);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.status-pulse {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid var(--success);
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
</style>
