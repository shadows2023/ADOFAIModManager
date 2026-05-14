<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>ADOFAI Mod Manager</h2>
    </div>
    <nav class="sidebar-nav">
      <SidebarItem
        icon="⚙"
        label="Game Setup"
        :active="currentView === 'setup'"
        @click="$emit('navigate', 'setup')"
      />
      <SidebarItem
        icon="📦"
        label="Mod Manager"
        :active="currentView === 'mods'"
        @click="$emit('navigate', 'mods')"
      />
      <SidebarItem
        icon="ℹ"
        label="About"
        :active="currentView === 'about'"
        @click="$emit('navigate', 'about')"
      />
    </nav>
    <div class="sidebar-footer">
      <GameStatusBanner />
    </div>
  </aside>
</template>

<script setup lang="ts">
import SidebarItem from './SidebarItem.vue'
import GameStatusBanner from './GameStatusBanner.vue'

defineProps<{
  currentView: string
}>()

defineEmits<{
  navigate: [view: string]
}>()
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.sidebar-header h2 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
}
</style>
