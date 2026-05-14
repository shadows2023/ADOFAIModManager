<template>
  <div class="mod-manager" v-if="gameStore.gamePath">
    <h1 class="page-title">Mod Manager</h1>

    <div class="toolbar">
      <div class="toolbar-left">
        <input
          type="text"
          v-model="modStore.searchQuery"
          placeholder="Search mods..."
          class="search-input"
        />
      </div>
      <div class="toolbar-right">
        <button class="btn-primary" @click="installMod">
          Install Mod
        </button>
        <button class="btn-secondary" @click="openModsFolder">
          Open Mods Folder
        </button>
        <button class="btn-secondary" @click="refreshMods">
          Refresh
        </button>
        <button class="btn-secondary" disabled title="Coming soon">
          Browse Online
        </button>
      </div>
    </div>

    <p v-if="modStore.error" class="error-text">{{ modStore.error }}</p>

    <div class="mod-content">
      <div class="mod-list-column">
        <div class="mod-count">{{ modStore.filteredMods.length }} mod(s)</div>
        <div class="mod-list" v-if="!modStore.isLoading">
          <ModCard
            v-for="mod in modStore.filteredMods"
            :key="mod.id"
            :mod="mod"
            :selected="modStore.selectedModId === mod.id"
            @select="modStore.selectedModId = $event"
            @toggle="handleToggle"
          />
        </div>
        <div v-else class="loading">Loading mods...</div>
      </div>
      <div class="mod-detail-column">
        <ModDetail
          :mod="modStore.selectedMod"
          @toggle="handleToggle"
          @uninstall="handleUninstall"
        />
      </div>
    </div>
  </div>
  <div class="no-game" v-else>
    <p>Please set up your game path first in Game Setup.</p>
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
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  flex: 1;
  max-width: 300px;
}

.toolbar-right {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.search-input {
  font-size: 13px;
}

.mod-content {
  flex: 1;
  display: flex;
  gap: 12px;
  overflow: hidden;
}

.mod-list-column {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.mod-count {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.mod-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.mod-detail-column {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow-y: auto;
}

.loading {
  color: var(--text-secondary);
  font-size: 13px;
  padding: 20px;
  text-align: center;
}

.no-game {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
