<template>
  <div class="mod-detail" v-if="mod">
    <h2 class="mod-name">{{ mod.name }}</h2>

    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value" :class="{ enabled: mod.enabled }">
          {{ mod.enabled ? 'Enabled' : 'Disabled' }}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">File:</span>
        <span class="detail-value file-path">{{ mod.filePath }}</span>
      </div>
    </div>

    <div class="detail-actions">
      <button
        class="btn-secondary"
        @click="$emit('toggle', mod.id, !mod.enabled)"
      >
        {{ mod.enabled ? 'Disable' : 'Enable' }}
      </button>
      <button class="btn-danger" @click="$emit('uninstall', mod.id)">
        Uninstall
      </button>
    </div>
  </div>
  <div class="mod-detail empty" v-else>
    <p class="empty-text">Select a mod to view details</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mod: InstalledMod | null
}>()

defineEmits<{
  toggle: [id: string, enabled: boolean]
  uninstall: [id: string]
}>()
</script>

<style scoped>
.mod-detail {
  padding: 20px;
}

.mod-detail.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.mod-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.detail-section {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: var(--text-secondary);
  min-width: 50px;
}

.detail-value.enabled {
  color: var(--success);
}

.file-path {
  word-break: break-all;
  font-size: 12px;
}

.detail-actions {
  display: flex;
  gap: 8px;
}
</style>
