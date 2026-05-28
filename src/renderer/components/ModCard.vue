<template>
  <div
    class="mod-card"
    :class="{ selected, disabled: !mod.enabled }"
    @click="$emit('select', mod.id)"
  >
    <div class="mod-left">
      <div class="mod-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <div class="mod-info">
        <span class="mod-name">{{ mod.name }}</span>
        <span class="mod-status" :class="{ enabled: mod.enabled }">
          {{ mod.enabled ? 'Enabled' : 'Disabled' }}
        </span>
      </div>
    </div>
    <label class="toggle" @click.stop>
      <input
        type="checkbox"
        :checked="mod.enabled"
        @change="$emit('toggle', mod.id, !mod.enabled)"
      />
      <span class="toggle-slider"></span>
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mod: InstalledMod
  selected: boolean
}>()

defineEmits<{
  select: [id: string]
  toggle: [id: string, enabled: boolean]
}>()
</script>

<style scoped>
.mod-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 3px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  gap: 8px;
}

.mod-card:hover {
  background: var(--bg-hover);
}

.mod-card.selected {
  background: var(--accent-subtle);
  border-color: var(--border-accent);
}

.mod-card.disabled {
  opacity: 0.45;
}

.mod-card.disabled:hover {
  opacity: 0.65;
}

.mod-left {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  flex: 1;
}

.mod-icon {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.mod-card.selected .mod-icon {
  color: var(--accent);
  background: rgba(5, 150, 105, 0.1);
}

.mod-icon svg {
  width: 14px;
  height: 14px;
}

.mod-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.mod-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mod-status {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.mod-status.enabled {
  color: var(--success);
}

/* Toggle switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 22px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--border-visible);
  border-radius: 22px;
  transition: all var(--transition-fast);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 2px;
  bottom: 2px;
  background: #fff;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.toggle input:checked + .toggle-slider {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(16px);
}
</style>
