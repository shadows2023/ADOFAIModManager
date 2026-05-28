<template>
  <button
    class="sidebar-item"
    :class="{ active }"
    @click="$emit('click')"
  >
    <span class="icon"><slot name="icon" /></span>
    <span class="label"><slot /></span>
    <span v-if="active" class="active-indicator"></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  transition: all var(--transition-fast);
  position: relative;
}

.sidebar-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: var(--accent-subtle);
  color: var(--accent);
}

.sidebar-item.active:hover {
  background: rgba(5, 150, 105, 0.15);
}

.active-indicator {
  position: absolute;
  right: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.icon svg {
  width: 100%;
  height: 100%;
}

.label {
  line-height: 1;
}
</style>
