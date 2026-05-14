<template>
  <div class="status-banner">
    <div class="status-indicator" :class="{ active: !!gameInfo }"></div>
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
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-card);
  border-radius: var(--radius);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
}

.status-indicator.active {
  background: var(--success);
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
