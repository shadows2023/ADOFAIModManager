<template>
  <aside class="sidebar">
    <div class="sidebar-bg"></div>
    <div class="sidebar-header">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <div class="header-text">
        <h2 class="app-title">ADOFAI</h2>
        <span class="app-subtitle">Mod Manager</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <SidebarItem
        :active="currentView === 'setup'"
        @click="$emit('navigate', 'setup')"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </template>
        Game Setup
      </SidebarItem>

      <SidebarItem
        :active="currentView === 'mods'"
        @click="$emit('navigate', 'mods')"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.91 8.84 12 3.5 3.09 8.84a1 1 0 0 0-.09.41v5.5a1 1 0 0 0 .5.86L12 20.5l8.5-4.89a1 1 0 0 0 .5-.86v-5.5a1 1 0 0 0-.09-.41z"/>
            <polyline points="12 3.5 12 12 3.09 8.84"/>
            <polyline points="12 12 12 20.5 20.91 15.16"/>
            <line x1="3.09" y1="8.84" x2="12" y2="12"/>
            <line x1="20.91" y1="8.84" x2="12" y2="12"/>
          </svg>
        </template>
        Mod Manager
      </SidebarItem>

      <SidebarItem
        :active="currentView === 'about'"
        @click="$emit('navigate', 'about')"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </template>
        About
      </SidebarItem>
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
  position: relative;
  flex-shrink: 0;
}

.sidebar-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(5, 150, 105, 0.06) 0%, transparent 100%),
    radial-gradient(ellipse 60% 40% at 50% 100%, rgba(5, 150, 105, 0.03) 0%, transparent 100%);
  pointer-events: none;
}

.sidebar-header {
  padding: 20px 18px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.logo-icon {
  width: 34px;
  height: 34px;
  color: var(--accent);
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px var(--accent-glow));
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.app-title {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--text-primary);
  line-height: 1.2;
}

.app-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: var(--accent);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
}

.sidebar-footer {
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  position: relative;
}
</style>
