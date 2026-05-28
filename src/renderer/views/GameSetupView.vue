<template>
  <div class="game-setup">
    <h1 class="page-title">Game Setup</h1>

    <section class="setup-card">
      <div class="card-header">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h2 class="card-title">Game Directory</h2>
          <p class="card-desc">Select the folder containing <code>A Dance of Fire and Ice.exe</code></p>
        </div>
      </div>

      <div class="path-input-row">
        <div class="path-input-wrapper">
          <svg class="path-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <input
            type="text"
            :value="gameStore.gamePath || ''"
            placeholder="Click Browse to select game folder..."
            readonly
          />
        </div>
        <button class="btn-primary browse-btn" @click="gameStore.selectDirectory()" :disabled="gameStore.isLoading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          Browse
        </button>
      </div>
      <p v-if="gameStore.error" class="error-text">{{ gameStore.error }}</p>
    </section>

    <section class="setup-card" v-if="gameStore.gamePath">
      <div class="card-header">
        <div class="card-icon accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
        <div>
          <h2 class="card-title">MelonLoader</h2>
          <p class="card-desc">Mod loader required for Unity mods</p>
        </div>
      </div>

      <div class="ml-card">
        <div class="ml-status-grid">
          <div class="ml-stat">
            <span class="ml-stat-label">Status</span>
            <span class="ml-stat-value" :class="{ installed: mlStore.installed }">
              <span class="stat-dot" :class="{ active: mlStore.installed }"></span>
              {{ mlStore.installed ? 'Installed' : 'Not installed' }}
            </span>
          </div>
          <div class="ml-stat" v-if="mlStore.version">
            <span class="ml-stat-label">Version</span>
            <span class="ml-stat-value">{{ mlStore.version }}</span>
          </div>
        </div>

        <div class="ml-actions">
          <button
            v-if="!mlStore.installed"
            class="btn-primary install-btn"
            @click="installML"
            :disabled="mlStore.isInstalling"
          >
            <svg v-if="!mlStore.isInstalling" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ mlStore.isInstalling ? 'Installing...' : 'Install MelonLoader' }}
          </button>
          <button
            v-else
            class="btn-danger"
            @click="uninstallML"
            :disabled="mlStore.isUninstalling"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
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
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 28px;
}

.setup-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
  transition: border-color var(--transition);
}

.setup-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
}

.card-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius);
  background: var(--bg-card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.card-icon svg {
  width: 18px;
  height: 18px;
}

.card-icon.accent {
  color: var(--accent);
  border-color: var(--border-accent);
  background: var(--accent-subtle);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 3px;
  color: var(--text-primary);
}

.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.card-desc code {
  background: var(--bg-card);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent);
}

.path-input-row {
  display: flex;
  gap: 10px;
}

.path-input-wrapper {
  flex: 1;
  position: relative;
}

.path-input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--text-muted);
  pointer-events: none;
}

.path-input-wrapper input {
  padding-left: 36px;
}

.browse-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  padding: 9px 16px;
}

.btn-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* MelonLoader section */
.ml-card {
  margin-top: 4px;
}

.ml-status-grid {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
}

.ml-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ml-stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.ml-stat-value {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 7px;
}

.stat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--danger);
}

.stat-dot.active {
  background: var(--success);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.ml-stat-value.installed {
  color: var(--success);
}

.ml-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.install-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
