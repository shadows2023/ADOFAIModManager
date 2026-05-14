<template>
  <div class="app-layout">
    <Sidebar :currentView="currentView" @navigate="currentView = $event" />
    <main class="main-content">
      <GameSetupView v-if="currentView === 'setup'" />
      <ModManagerView v-else-if="currentView === 'mods'" />
      <AboutView v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import GameSetupView from './views/GameSetupView.vue'
import ModManagerView from './views/ModManagerView.vue'
import AboutView from './views/AboutView.vue'

const currentView = ref<'setup' | 'mods' | 'about'>('setup')
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
