<template>
  <div class="game-setup">
    <h1 class="page-title">Game Setup</h1>

    <section class="section">
      <h2 class="section-title">Game Directory</h2>
      <p class="section-desc">Select the folder containing <code>A Dance of Fire and Ice.exe</code></p>

      <div class="path-input-row">
        <input
          type="text"
          :value="gameStore.gamePath || ''"
          placeholder="Click Browse to select game folder..."
          readonly
        />
        <button class="btn-primary" @click="gameStore.selectDirectory()" :disabled="gameStore.isLoading">
          Browse
        </button>
      </div>
      <p v-if="gameStore.error" class="error-text">{{ gameStore.error }}</p>
    </section>

    <section class="section" v-if="gameStore.gamePath">
      <h2 class="section-title">MelonLoader</h2>
      <p class="section-desc">MelonLoader is required for loading mods</p>

      <div class="ml-card">
        <div class="ml-info">
          <div class="ml-status-row">
            <span class="ml-label">Status:</span>
            <span class="ml-value" :class="{ installed: mlStore.installed }">
              {{ mlStore.installed ? 'Installed' : 'Not installed' }}
            </span>
          </div>
          <div class="ml-status-row" v-if="mlStore.version">
            <span class="ml-label">Version:</span>
            <span class="ml-value">{{ mlStore.version }}</span>
          </div>
        </div>
        <div class="ml-actions">
          <button
            v-if="!mlStore.installed"
            class="btn-primary"
            @click="installML"
            :disabled="mlStore.isInstalling"
          >
            {{ mlStore.isInstalling ? 'Installing...' : 'Install MelonLoader' }}
          </button>
          <button
            v-else
            class="btn-danger"
            @click="uninstallML"
            :disabled="mlStore.isUninstalling"
          >
            {{ mlStore.isUninstalling ? 'Uninstalling...' : 'Uninstall' }}
          </button>
        </div>
        <InstallProgress :progress="mlStore.progress" />
        <p v-if="mlStore.error" class="error-text">{{ mlStore.error }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useMlStore } from '../stores/mlStore'
import InstallProgress from '../components/InstallProgress.vue'

const gameStore = useGameStore()
const mlStore = useMlStore()

onMounted(() => {
  gameStore.loadGamePath()
})

watch(() => gameStore.gamePath, async (newPath) => {
  if (newPath) {
    await mlStore.checkStatus(newPath)
  }
})

async function installML() {
  if (gameStore.gamePath) {
    await mlStore.install(gameStore.gamePath)
  }
}

async function uninstallML() {
  if (gameStore.gamePath) {
    await mlStore.uninstall(gameStore.gamePath)
  }
}
</script>

<style scoped>
.game-setup {
  max-width: 640px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 24px;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.section-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.section-desc code {
  background: var(--bg-card);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.path-input-row {
  display: flex;
  gap: 8px;
}

.path-input-row input {
  flex: 1;
}

.ml-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.ml-info {
  margin-bottom: 12px;
}

.ml-status-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 13px;
}

.ml-label {
  color: var(--text-secondary);
}

.ml-value.installed {
  color: var(--success);
}

.ml-actions {
  display: flex;
  gap: 8px;
}
</style>
