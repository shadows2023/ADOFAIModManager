<template>
  <div class="progress-container" v-if="progress">
    <div class="progress-header">
      <span class="progress-label">Downloading MelonLoader</span>
      <span class="progress-pct">{{ progress.percentage }}%</span>
    </div>
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: progress.percentage + '%' }"
      ></div>
      <div
        class="progress-glow"
        :style="{ left: progress.percentage + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: ProgressInfo | null
}>()
</script>

<style scoped>
.progress-container {
  margin-top: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-pct {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.progress-track {
  position: relative;
  height: 6px;
  background: var(--bg-card);
  border-radius: 6px;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #34D399);
  border-radius: 6px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-glow {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 20px;
  background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
