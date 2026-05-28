<template>
  <div class="mod-detail" v-if="mod">
    <div class="detail-header">
      <div class="detail-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <div>
        <h2 class="mod-name">{{ mod.name }}</h2>
        <span class="mod-badge" :class="{ enabled: mod.enabled }">
          <span class="badge-dot"></span>
          {{ mod.enabled ? 'Enabled' : 'Disabled' }}
        </span>
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-field">
        <span class="field-label">File Path</span>
        <code class="field-value">{{ mod.filePath }}</code>
      </div>
    </div>

    <div class="detail-actions">
      <button
        class="btn-secondary"
        @click="$emit('toggle', mod.id, !mod.enabled)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
          <path v-if="mod.enabled" d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
          <line v-if="mod.enabled" x1="12" y1="2" x2="12" y2="12"/>
          <path v-else d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        {{ mod.enabled ? 'Disable' : 'Enable' }}
      </button>
      <button class="btn-danger" @click="$emit('uninstall', mod.id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Uninstall
      </button>
    </div>
  </div>
  <div class="mod-detail empty" v-else>
    <div class="empty-content">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
      <p class="empty-title">No mod selected</p>
      <p class="empty-desc">Select a mod from the list to view details</p>
    </div>
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
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mod-detail.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-muted);
  margin-bottom: 14px;
  opacity: 0.5;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 12px;
  color: var(--text-muted);
}

/* Header */
.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
}

.detail-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius);
  background: var(--accent-subtle);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-icon svg {
  width: 20px;
  height: 20px;
}

.mod-name {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: 0.01em;
}

.mod-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  background: var(--bg-card);
  padding: 3px 10px;
  border-radius: 20px;
}

.mod-badge.enabled {
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--text-muted);
}

.mod-badge.enabled .badge-dot {
  background: var(--success);
  box-shadow: 0 0 5px rgba(16, 185, 129, 0.4);
}

/* Body */
.detail-body {
  flex: 1;
}

.detail-field {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
}

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.field-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-secondary);
  word-break: break-all;
  line-height: 1.6;
}

/* Actions */
.detail-actions {
  display: flex;
  gap: 8px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.detail-actions button {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
  padding: 10px 16px;
}

.btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
