<template>
  <div class="progress-container" v-if="progress">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress.percentage + '%' }"></div>
    </div>
    <span class="progress-text">{{ progress.percentage }}%</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: ProgressInfo | null
}>()
</script>

<style scoped>
.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-card);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}
</style>
