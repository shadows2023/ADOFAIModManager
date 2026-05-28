<template>
  <div class="about">
    <h1 class="page-title">About</h1>

    <div class="about-hero">
      <div class="hero-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      </div>
      <h2 class="hero-title">ADOFAI Mod Manager</h2>
      <span class="hero-version">v1.0.0</span>
      <p class="hero-desc">
        A MelonLoader mod manager for <em>A Dance of Fire and Ice</em>.
        Install, manage, and toggle your mods with ease.
      </p>
    </div>

    <div class="about-grid">
      <div class="about-card">
        <div class="about-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
        <h3>MelonLoader</h3>
        <p>
          <template v-if="mlStore.installed">
            Currently installed<span v-if="mlStore.version"> ({{ mlStore.version }})</span>.
          </template>
          <template v-else>Not installed for the selected game.</template>
        </p>
      </div>

      <div class="about-card">
        <div class="about-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <h3>Useful Links</h3>
        <ul class="links">
          <li>
            <a href="#" @click.prevent="openLink('https://github.com/LavaGang/MelonLoader')">
              MelonLoader on GitHub
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="link-arrow">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </li>
          <li>
            <a href="#" @click.prevent="openLink('https://store.steampowered.com/app/977950')">
              ADOFAI on Steam
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="link-arrow">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </li>
        </ul>
      </div>
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
  max-width: 640px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 28px;
}

/* Hero card */
.about-hero {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.about-hero::before {
  content: '';
  position: absolute;
  top: -40%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--accent-subtle) 0%, transparent 70%);
  pointer-events: none;
}

.hero-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: var(--accent);
  filter: drop-shadow(0 0 12px var(--accent-glow));
}

.hero-icon svg {
  width: 100%;
  height: 100%;
}

.hero-title {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 4px;
}

.hero-version {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-subtle);
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.hero-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
}

.hero-desc em {
  font-style: normal;
  color: var(--text-primary);
  font-weight: 500;
}

/* Info grid */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.about-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 22px 20px;
  transition: border-color var(--transition);
}

.about-card:hover {
  border-color: var(--border-visible);
}

.about-card-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius);
  background: var(--accent-subtle);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.about-card-icon svg {
  width: 17px;
  height: 17px;
}

.about-card h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.about-card p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.links a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--accent);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: gap var(--transition-fast);
}

.links a:hover {
  gap: 8px;
}

.link-arrow {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.links a:hover .link-arrow {
  transform: translateX(2px);
}
</style>
