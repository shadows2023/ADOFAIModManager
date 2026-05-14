<template>
  <div class="about">
    <h1 class="page-title">About</h1>

    <div class="about-card">
      <h2>ADOFAI Mod Manager</h2>
      <p class="version">Version 1.0.0</p>
      <p class="desc">
        A MelonLoader mod manager for A Dance of Fire and Ice.
        Install, manage, and toggle your mods with ease.
      </p>
    </div>

    <div class="about-card">
      <h3>MelonLoader</h3>
      <p class="desc">
        MelonLoader is a mod loader for Unity games.
        <span v-if="mlStore.installed">
          Currently installed
          <span v-if="mlStore.version">({{ mlStore.version }})</span>.
        </span>
        <span v-else>Not installed for the selected game.</span>
      </p>
    </div>

    <div class="about-card">
      <h3>Useful Links</h3>
      <ul class="links">
        <li><a href="#" @click.prevent="openLink('https://github.com/LavaGang/MelonLoader')">MelonLoader on GitHub</a></li>
        <li><a href="#" @click.prevent="openLink('https://store.steampowered.com/app/977950')">ADOFAI on Steam</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMlStore } from '../stores/mlStore'

const mlStore = useMlStore()

function openLink(url: string) {
  window.open(url, '_blank')
}
</script>

<style scoped>
.about {
  max-width: 600px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 24px;
}

.about-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 16px;
}

.about-card h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.about-card h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.version {
  font-size: 13px;
  color: var(--accent);
  margin-bottom: 12px;
}

.desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.links {
  list-style: none;
  padding: 0;
}

.links li {
  margin-bottom: 6px;
}

.links a {
  color: var(--accent);
  text-decoration: none;
  font-size: 13px;
}

.links a:hover {
  text-decoration: underline;
}
</style>
