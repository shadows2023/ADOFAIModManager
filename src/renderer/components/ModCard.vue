<template>
  <div
    class="mod-card"
    :class="{ selected, disabled: !mod.enabled }"
    @click="$emit('select', mod.id)"
  >
    <div class="mod-info">
      <span class="mod-name">{{ mod.name }}</span>
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
  margin-bottom: 4px;
  background: var(--bg-card);
  border: 1px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
}

.mod-card:hover {
  background: var(--bg-hover);
}

.mod-card.selected {
  border-color: var(--accent);
}

.mod-card.disabled {
  opacity: 0.5;
}

.mod-name {
  font-size: 13px;
  font-weight: 500;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
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
  background: var(--border);
  border-radius: 20px;
  transition: 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  left: 2px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

.toggle input:checked + .toggle-slider {
  background: var(--accent);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(16px);
}
</style>
