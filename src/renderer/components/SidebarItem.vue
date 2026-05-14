<template>
  <button
    class="sidebar-item"
    :class="{ active }"
    @click="$emit('click')"
  >
    <span class="icon">{{ icon }}</span>
    <span class="label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
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
  text-align: left;
  transition: all 0.15s;
}

.sidebar-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: var(--accent);
  color: white;
}

.icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}
</style>
