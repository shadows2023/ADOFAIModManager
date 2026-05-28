<template>
  <div class="mod-manager" v-if="gameStore.gamePath">
    <h1 class="page-title">Mod Manager</h1>

    <div class="toolbar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          v-model="modStore.searchQuery"
          placeholder="Search mods..."
          class="search-input"
        />
      </div>
      <div class="toolbar-actions">
        <button class="btn-primary" @click="installMod">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Install Mod
        </button>
        <button class="btn-secondary" @click="openModsFolder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          Open Folder
        </button>
        <button class="btn-secondary" @click="refreshMods">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
        <button class="btn-secondary" disabled title="Coming soon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Browse Online
        </button>
      </div>
    </div>

    <p v-if="modStore.error" class="error-text">{{ modStore.error }}</p>

    <div class="mod-content">
      <div class="mod-list-panel">
        <div class="mod-list-header">
          <span class="mod-count">{{ modStore.filteredMods.length }} mod{{ modStore.filteredMods.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="mod-list" v-if="!modStore.isLoading">
          <ModCard
            v-for="mod in modStore.filteredMods"
            :key="mod.id"
            :mod="mod"
            :selected="modStore.selectedModId === mod.id"
            @select="modStore.selectedModId = $event"
            @toggle="handleToggle"
          />
          <div v-if="modStore.filteredMods.length === 0" class="empty-mods">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <path d="M20.91 8.84 12 3.5 3.09 8.84a1 1 0 0 0-.09.41v5.5a1 1 0 0 0 .5.86L12 20.5l8.5-4.89a1 1 0 0 0 .5-.86v-5.5a1 1 0 0 0-.09-.41z"/>
            </svg>
            <p>No mods installed</p>
            <button class="btn-primary" @click="installMod">Install your first mod</button>
          </div>
        </div>
        <div v-else class="loading">Loading mods...</div>
      </div>

      <div class="mod-detail-panel">
        <ModDetail
          :mod="modStore.selectedMod"
          @toggle="handleToggle"
          @uninstall="handleUninstall"
        />
      </div>
    </div>
  </div>
  <div class="no-game" v-else>
    <div class="no-game-content">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="no-game-icon">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <p>Please set up your game path first in <strong>Game Setup</strong>.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useModStore } from '../stores/modStore'
import ModCard from '../components/ModCard.vue'
import ModDetail from '../components/ModDetail.vue'

const gameStore = useGameStore()
const modStore = useModStore()

onMounted(async () => {
  await gameStore.loadGamePath()
  if (gameStore.gamePath) {
    await modStore.loadMods(gameStore.gamePath)
  }
})

watch(() => gameStore.gamePath, async (newPath) => {
  if (newPath) {
    await modStore.loadMods(newPath)
  }
})

async function installMod() {
  if (gameStore.gamePath) {
    await modStore.installFromFile(gameStore.gamePath)
  }
}

async function handleToggle(modId: string, enabled: boolean) {
  if (gameStore.gamePath) {
    await modStore.toggle(modId, gameStore.gamePath, enabled)
  }
}

async function handleUninstall(modId: string) {
  if (gameStore.gamePath) {
    await modStore.uninstall(modId, gameStore.gamePath)
  }
}

async function refreshMods() {
  if (gameStore.gamePath) {
    await modStore.loadMods(gameStore.gamePath)
  }
}

function openModsFolder() {
  if (gameStore.gamePath) {
    window.electronAPI.mod.openFolder(gameStore.gamePath)
  }
}
</script>

<style scoped>
.mod-manager {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 18px;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search-wrapper {
  flex: 1;
  max-width: 280px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  padding-left: 34px !important;
}

.toolbar-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.toolbar-actions .btn-primary,
.toolbar-actions .btn-secondary {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Content area */
.mod-content {
  flex: 1;
  display: flex;
  gap: 14px;
  overflow: hidden;
  min-height: 0;
}

.mod-list-panel {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.mod-list-header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}

.mod-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mod-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.mod-detail-panel {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow-y: auto;
}

/* Empty state */
.empty-mods {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  gap: 12px;
}

.empty-icon {
  width: 36px;
  height: 36px;
  color: var(--text-muted);
}

.empty-mods p {
  font-size: 13px;
  color: var(--text-secondary);
}

.loading {
  color: var(--text-secondary);
  font-size: 13px;
  padding: 20px;
  text-align: center;
}

/* No game state */
.no-game {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.no-game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: var(--text-secondary);
  font-size: 14px;
}

.no-game-icon {
  width: 40px;
  height: 40px;
  color: var(--text-muted);
}
</style>
