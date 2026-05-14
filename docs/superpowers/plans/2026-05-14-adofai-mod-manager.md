# ADOFAI Mod Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Electron + Vue 3 desktop app for managing MelonLoader mods for A Dance of Fire and Ice.

**Architecture:** Three-layer architecture — main process (services) handles all file/network operations, preload bridges via contextBridge, renderer (Vue 3 + Pinia) handles UI. Online mod sources use an abstract adapter pattern for future extension.

**Tech Stack:** Electron + electron-vite + Vue 3 + TypeScript + Pinia

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `electron.vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tsconfig.web.json`
- Create: `src/main/index.ts`
- Create: `src/preload/index.ts`
- Create: `src/renderer/main.ts`
- Create: `src/renderer/App.vue`
- Create: `src/renderer/env.d.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "adofai-mod-manager",
  "version": "1.0.0",
  "description": "ADOFAI MelonLoader Mod Manager",
  "main": "./out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview"
  },
  "dependencies": {
    "adm-zip": "^0.5.16",
    "electron-store": "^8.2.0"
  },
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-vite": "^2.3.0",
    "@vitejs/plugin-vue": "^5.1.0",
    "vue": "^3.5.0",
    "pinia": "^2.2.0",
    "typescript": "^5.6.0",
    "vue-tsc": "^2.1.0",
    "@types/adm-zip": "^0.5.5",
    "@types/node": "^22.0.0"
  }
}
```

- [ ] **Step 2: Create electron.vite.config.ts**

```typescript
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      outDir: resolve(__dirname, 'out/renderer'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    plugins: [vue()]
  }
})
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.web.json" }
  ]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "lib": ["ESNext"],
    "outDir": "./out",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true
  },
  "include": [
    "src/main/**/*.ts",
    "src/preload/**/*.ts",
    "electron.vite.config.ts"
  ]
}
```

- [ ] **Step 5: Create tsconfig.web.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "outDir": "./out",
    "rootDir": "./src",
    "jsx": "preserve",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "moduleDetection": "force",
    "noEmit": true
  },
  "include": [
    "src/renderer/**/*.ts",
    "src/renderer/**/*.vue"
  ]
}
```

- [ ] **Step 6: Create directories**

```bash
mkdir -p src/main/services/sources src/preload src/renderer/assets src/renderer/stores src/renderer/components src/renderer/views
```

- [ ] **Step 7: Create src/renderer/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ADOFAI Mod Manager</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

- [ ] **Step 8: Install dependencies**

```bash
npm install
```

- [ ] **Step 9: Verify scaffold builds**

```bash
npx electron-vite build
```
Expected: Exit 0, `out/` directory created with main/preload/renderer subdirectories.

---

### Task 2: Shared Types + GameService

**Files:**
- Create: `src/main/services/types.ts`
- Create: `src/main/services/GameService.ts`

- [ ] **Step 1: Create shared types**

```typescript
// src/main/services/types.ts

export interface GameInfo {
  name: string
  path: string
  executablePath: string
}

export interface MLInfo {
  installed: boolean
  version: string | null
}

export interface InstalledMod {
  id: string
  name: string
  enabled: boolean
  filePath: string
}

export interface ModMetaData {
  id: string
  name: string
  version: string
  author: string
  description: string
  downloadUrl: string
}
```

- [ ] **Step 2: Create GameService**

```typescript
// src/main/services/GameService.ts
import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { GameInfo } from './types'
import Store from 'electron-store'

const GAME_EXECUTABLE = 'A Dance of Fire and Ice.exe'
const store = new Store({ name: 'game-config' })

export class GameService {
  validateGamePath(gamePath: string): GameInfo | null {
    const exePath = path.join(gamePath, GAME_EXECUTABLE)
    if (fs.existsSync(exePath)) {
      return {
        name: 'A Dance of Fire and Ice',
        path: gamePath,
        executablePath: exePath
      }
    }
    return null
  }

  saveGamePath(gamePath: string): void {
    store.set('gamePath', gamePath)
  }

  loadGamePath(): string | null {
    return store.get('gamePath', null) as string | null
  }
}
```

---

### Task 3: MelonLoaderService

**Files:**
- Create: `src/main/services/MelonLoaderService.ts`

- [ ] **Step 1: Create MelonLoaderService**

```typescript
// src/main/services/MelonLoaderService.ts
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import { EventEmitter } from 'events'
import AdmZip from 'adm-zip'
import { MLInfo } from './types'

const ML_FILES = [
  'MelonLoader/',
  'version.dll',
  'MelonLoader.ModHandler.dll',
  'MelonLoader.Patcher.dll'
]

const GITHUB_API = 'https://api.github.com/repos/LavaGang/MelonLoader/releases/latest'

export class MelonLoaderService extends EventEmitter {
  private downloadPath: string = ''

  async download(gamePath: string): Promise<void> {
    const releaseInfo = await this.fetchLatestRelease()
    const zipUrl = releaseInfo.assets.find((a: any) =>
      a.name.endsWith('.zip') && a.name.includes('MelonLoader')
    )?.browser_download_url

    if (!zipUrl) throw new Error('No MelonLoader release zip found')

    this.downloadPath = path.join(gamePath, 'MelonLoaderInstaller.zip')
    await this.downloadFile(zipUrl, this.downloadPath)
  }

  async install(gamePath: string): Promise<void> {
    if (!this.downloadPath) {
      // If no download was done, try a direct download first
      await this.download(gamePath)
    }

    const zip = new AdmZip(this.downloadPath)
    zip.extractAllTo(gamePath, true)

    // Clean up installer zip
    if (fs.existsSync(this.downloadPath)) {
      fs.unlinkSync(this.downloadPath)
      this.downloadPath = ''
    }
  }

  async uninstall(gamePath: string): Promise<void> {
    for (const file of ML_FILES) {
      const fullPath = path.join(gamePath, file)
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true })
      }
    }

    // Remove userlibs if empty
    const userlibs = path.join(gamePath, 'UserLibs')
    if (fs.existsSync(userlibs) && fs.readdirSync(userlibs).length === 0) {
      fs.rmdirSync(userlibs)
    }
  }

  isInstalled(gamePath: string): boolean {
    return fs.existsSync(path.join(gamePath, 'version.dll'))
  }

  getVersion(gamePath: string): string | null {
    const versionFile = path.join(gamePath, 'MelonLoader', 'MelonLoader.dll')
    if (!fs.existsSync(versionFile)) return null

    try {
      // Simple version detection from file metadata
      const stats = fs.statSync(versionFile)
      return stats.mtime.toISOString().split('T')[0]
    } catch {
      return null
    }
  }

  private fetchLatestRelease(): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(GITHUB_API, { headers: { 'User-Agent': 'adofai-mod-manager' } }, (res) => {
        let data = ''
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error('Failed to parse GitHub release info'))
          }
        })
      }).on('error', reject)
    })
  }

  private downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest)
      let receivedBytes = 0
      let totalBytes = 0

      https.get(url, { headers: { 'User-Agent': 'adofai-mod-manager' } }, (res) => {
        totalBytes = parseInt(res.headers['content-length'] || '0', 10)

        res.on('data', (chunk) => {
          receivedBytes += chunk.length
          file.write(chunk)
          if (totalBytes > 0) {
            this.emit('download-progress', {
              received: receivedBytes,
              total: totalBytes,
              percentage: Math.round((receivedBytes / totalBytes) * 100)
            })
          }
        })

        res.on('end', () => {
          file.end()
          resolve()
        })
      }).on('error', (err) => {
        file.close()
        fs.unlinkSync(dest)
        reject(err)
      })
    })
  }
}
```

---

### Task 4: ModService + ModSourceAdapter

**Files:**
- Create: `src/main/services/ModService.ts`
- Create: `src/main/services/sources/ModSourceAdapter.ts`

- [ ] **Step 1: Create ModSourceAdapter**

```typescript
// src/main/services/sources/ModSourceAdapter.ts
import { ModMetaData } from '../types'

export abstract class ModSourceAdapter {
  abstract readonly name: string

  // Placeholder: fetch online mod list
  async fetchModList(): Promise<ModMetaData[]> {
    throw new Error('Not implemented')
  }

  // Placeholder: download mod from source
  async downloadMod(mod: ModMetaData, destPath: string): Promise<void> {
    throw new Error('Not implemented')
  }
}
```

- [ ] **Step 2: Create ModService**

```typescript
// src/main/services/ModService.ts
import * as fs from 'fs'
import * as path from 'path'
import { InstalledMod } from './types'
import { dialog } from 'electron'

const MODS_DIR = 'Mods'

export class ModService {
  installFromFile(sourcePath: string, gamePath: string): InstalledMod {
    const modsDir = path.join(gamePath, MODS_DIR)
    if (!fs.existsSync(modsDir)) {
      fs.mkdirSync(modsDir, { recursive: true })
    }

    const fileName = path.basename(sourcePath)
    const destPath = path.join(modsDir, fileName)

    // Only .dll files are valid mods
    if (!fileName.endsWith('.dll')) {
      throw new Error('Invalid mod file: must be a .dll file')
    }

    // Check if already exists
    if (fs.existsSync(destPath)) {
      throw new Error(`Mod "${fileName}" already exists in Mods folder`)
    }

    fs.copyFileSync(sourcePath, destPath)

    return {
      id: fileName.replace(/\.dll$/, ''),
      name: fileName.replace(/\.dll$/, ''),
      enabled: true,
      filePath: destPath
    }
  }

  async uninstall(modId: string, gamePath: string): Promise<void> {
    const modsDir = path.join(gamePath, MODS_DIR)
    const paths = [
      path.join(modsDir, `${modId}.dll`),
      path.join(modsDir, `${modId}.disabled`)
    ]

    for (const p of paths) {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p)
        return
      }
    }

    throw new Error(`Mod "${modId}" not found`)
  }

  getInstalledMods(gamePath: string): InstalledMod[] {
    const modsDir = path.join(gamePath, MODS_DIR)
    if (!fs.existsSync(modsDir)) return []

    const mods: InstalledMod[] = []
    const files = fs.readdirSync(modsDir)

    for (const file of files) {
      if (file.endsWith('.dll')) {
        mods.push({
          id: file.replace(/\.dll$/, ''),
          name: file.replace(/\.dll$/, ''),
          enabled: true,
          filePath: path.join(modsDir, file)
        })
      } else if (file.endsWith('.disabled')) {
        mods.push({
          id: file.replace(/\.disabled$/, ''),
          name: file.replace(/\.disabled$/, ''),
          enabled: false,
          filePath: path.join(modsDir, file)
        })
      }
    }

    return mods
  }

  toggle(modId: string, gamePath: string, enabled: boolean): void {
    const modsDir = path.join(gamePath, MODS_DIR)
    const dllPath = path.join(modsDir, `${modId}.dll`)
    const disabledPath = path.join(modsDir, `${modId}.disabled`)

    if (enabled) {
      if (fs.existsSync(disabledPath)) {
        fs.renameSync(disabledPath, dllPath)
      }
    } else {
      if (fs.existsSync(dllPath)) {
        fs.renameSync(dllPath, disabledPath)
      }
    }
  }

  openModsFolder(gamePath: string): void {
    const modsDir = path.join(gamePath, MODS_DIR)
    if (!fs.existsSync(modsDir)) {
      fs.mkdirSync(modsDir, { recursive: true })
    }
    // Shell.openPath is called from IPC handler
  }

  async selectAndInstallModFile(gamePath: string): Promise<InstalledMod> {
    const result = await dialog.showOpenDialog({
      title: 'Select Mod File',
      filters: [{ name: 'Mod Files', extensions: ['dll'] }],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      throw new Error('No file selected')
    }

    return this.installFromFile(result.filePaths[0], gamePath)
  }
}
```

---

### Task 5: Main Process Entry + IPC Handlers

**Files:**
- Modify: `src/main/index.ts`

- [ ] **Step 1: Write main process entry**

```typescript
// src/main/index.ts
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { GameService } from './services/GameService'
import { MelonLoaderService } from './services/MelonLoaderService'
import { ModService } from './services/ModService'

let mainWindow: BrowserWindow | null = null
const gameService = new GameService()
const melonLoaderService = new MelonLoaderService()
const modService = new ModService()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 800,
    minHeight: 600,
    title: 'ADOFAI Mod Manager',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  // Game
  ipcMain.handle('game:validate', (_event, gamePath: string) => {
    return gameService.validateGamePath(gamePath)
  })

  ipcMain.handle('game:get-path', () => {
    return gameService.loadGamePath()
  })

  ipcMain.handle('game:save-path', (_event, gamePath: string) => {
    gameService.saveGamePath(gamePath)
  })

  ipcMain.handle('game:select-directory', async () => {
    const { dialog } = require('electron')
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // MelonLoader
  ipcMain.handle('ml:status', (_event, gamePath: string) => {
    return {
      installed: melonLoaderService.isInstalled(gamePath),
      version: melonLoaderService.getVersion(gamePath)
    }
  })

  ipcMain.handle('ml:install', async (_event, gamePath: string) => {
    // Forward progress events to renderer
    melonLoaderService.on('download-progress', (progress) => {
      mainWindow?.webContents.send('ml:download-progress', progress)
    })
    await melonLoaderService.download(gamePath)
    await melonLoaderService.install(gamePath)
  })

  ipcMain.handle('ml:uninstall', async (_event, gamePath: string) => {
    await melonLoaderService.uninstall(gamePath)
  })

  // Mod
  ipcMain.handle('mod:install-from-file', async (_event, gamePath: string) => {
    return modService.selectAndInstallModFile(gamePath)
  })

  ipcMain.handle('mod:uninstall', async (_event, gamePath: string, modId: string) => {
    await modService.uninstall(modId, gamePath)
  })

  ipcMain.handle('mod:list', (_event, gamePath: string) => {
    return modService.getInstalledMods(gamePath)
  })

  ipcMain.handle('mod:toggle', (_event, gamePath: string, modId: string, enabled: boolean) => {
    modService.toggle(modId, gamePath, enabled)
  })

  ipcMain.handle('mod:open-folder', (_event, gamePath: string) => {
    modService.openModsFolder(gamePath)
    shell.openPath(join(gamePath, 'Mods'))
  })

  // Source (placeholder)
  ipcMain.handle('source:fetch-mods', async () => {
    return [] // Placeholder — online source not implemented
  })

  ipcMain.handle('source:download-mod', async (_event, _modId: string) => {
    throw new Error('Online mod download not implemented yet')
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

---

### Task 6: Preload Script

**Files:**
- Modify: `src/preload/index.ts`

- [ ] **Step 1: Write preload script**

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  game: {
    selectDirectory: (): Promise<string | null> =>
      ipcRenderer.invoke('game:select-directory'),
    validate: (path: string) =>
      ipcRenderer.invoke('game:validate', path),
    getPath: () =>
      ipcRenderer.invoke('game:get-path'),
    savePath: (path: string) =>
      ipcRenderer.invoke('game:save-path', path)
  },
  melonLoader: {
    checkInstalled: (gamePath: string) =>
      ipcRenderer.invoke('ml:status', gamePath),
    install: (gamePath: string): Promise<void> =>
      ipcRenderer.invoke('ml:install', gamePath),
    uninstall: (gamePath: string): Promise<void> =>
      ipcRenderer.invoke('ml:uninstall', gamePath),
    onDownloadProgress: (callback: (progress: { received: number; total: number; percentage: number }) => void) => {
      const handler = (_event: any, progress: any) => callback(progress)
      ipcRenderer.on('ml:download-progress', handler)
      return () => ipcRenderer.removeListener('ml:download-progress', handler)
    }
  },
  mod: {
    installFromFile: (gamePath: string) =>
      ipcRenderer.invoke('mod:install-from-file', gamePath),
    uninstall: (gamePath: string, modId: string) =>
      ipcRenderer.invoke('mod:uninstall', gamePath, modId),
    getInstalled: (gamePath: string) =>
      ipcRenderer.invoke('mod:list', gamePath),
    toggle: (gamePath: string, modId: string, enabled: boolean) =>
      ipcRenderer.invoke('mod:toggle', gamePath, modId, enabled),
    openFolder: (gamePath: string) =>
      ipcRenderer.invoke('mod:open-folder', gamePath)
  },
  source: {
    fetchMods: () => ipcRenderer.invoke('source:fetch-mods'),
    downloadMod: (modId: string) => ipcRenderer.invoke('source:download-mod', modId)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
```

---

### Task 7: Renderer Type Declarations + Pinia Stores

**Files:**
- Modify: `src/renderer/env.d.ts`
- Create: `src/renderer/stores/gameStore.ts`
- Create: `src/renderer/stores/mlStore.ts`
- Create: `src/renderer/stores/modStore.ts`

- [ ] **Step 1: Write env.d.ts with full type declarations**

```typescript
// src/renderer/env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface GameInfo {
  name: string
  path: string
  executablePath: string
}

interface MLInfo {
  installed: boolean
  version: string | null
}

interface InstalledMod {
  id: string
  name: string
  enabled: boolean
  filePath: string
}

interface ModMetaData {
  id: string
  name: string
  version: string
  author: string
  description: string
  downloadUrl: string
}

interface ProgressInfo {
  received: number
  total: number
  percentage: number
}

interface ElectronAPI {
  game: {
    selectDirectory: () => Promise<string | null>
    validate: (path: string) => GameInfo | null
    getPath: () => string | null
    savePath: (path: string) => void
  }
  melonLoader: {
    checkInstalled: (gamePath: string) => MLInfo
    install: (gamePath: string) => Promise<void>
    uninstall: (gamePath: string) => Promise<void>
    onDownloadProgress: (callback: (progress: ProgressInfo) => void) => () => void
  }
  mod: {
    installFromFile: (gamePath: string) => Promise<InstalledMod>
    uninstall: (gamePath: string, modId: string) => Promise<void>
    getInstalled: (gamePath: string) => Promise<InstalledMod[]>
    toggle: (gamePath: string, modId: string, enabled: boolean) => Promise<void>
    openFolder: (gamePath: string) => Promise<void>
  }
  source: {
    fetchMods: () => Promise<ModMetaData[]>
    downloadMod: (modId: string) => Promise<void>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

- [ ] **Step 2: Create gameStore**

```typescript
// src/renderer/stores/gameStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const gamePath = ref<string | null>(null)
  const gameInfo = ref<GameInfo | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadGamePath() {
    const saved = await window.electronAPI.game.getPath()
    if (saved) {
      gamePath.value = saved
      const info = window.electronAPI.game.validate(saved)
      gameInfo.value = info
    }
  }

  async function selectDirectory() {
    isLoading.value = true
    error.value = null
    try {
      const dir = await window.electronAPI.game.selectDirectory()
      if (dir) {
        const info = window.electronAPI.game.validate(dir)
        if (info) {
          gamePath.value = dir
          gameInfo.value = info
          window.electronAPI.game.savePath(dir)
        } else {
          error.value = 'Invalid game directory: A Dance of Fire and Ice.exe not found'
        }
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  return { gamePath, gameInfo, isLoading, error, loadGamePath, selectDirectory }
})
```

- [ ] **Step 3: Create mlStore**

```typescript
// src/renderer/stores/mlStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMlStore = defineStore('melonLoader', () => {
  const installed = ref(false)
  const version = ref<string | null>(null)
  const isInstalling = ref(false)
  const isUninstalling = ref(false)
  const progress = ref<ProgressInfo | null>(null)
  const error = ref<string | null>(null)

  let cleanupProgressListener: (() => void) | null = null

  async function checkStatus(gamePath: string) {
    const info = await window.electronAPI.melonLoader.checkInstalled(gamePath)
    installed.value = info.installed
    version.value = info.version
  }

  async function install(gamePath: string) {
    isInstalling.value = true
    error.value = null
    progress.value = null

    cleanupProgressListener = window.electronAPI.melonLoader.onDownloadProgress((p) => {
      progress.value = p
    })

    try {
      await window.electronAPI.melonLoader.install(gamePath)
      await checkStatus(gamePath)
    } catch (e: any) {
      error.value = e.message
    } finally {
      isInstalling.value = false
      progress.value = null
      if (cleanupProgressListener) {
        cleanupProgressListener()
        cleanupProgressListener = null
      }
    }
  }

  async function uninstall(gamePath: string) {
    isUninstalling.value = true
    error.value = null
    try {
      await window.electronAPI.melonLoader.uninstall(gamePath)
      installed.value = false
      version.value = null
    } catch (e: any) {
      error.value = e.message
    } finally {
      isUninstalling.value = false
    }
  }

  return { installed, version, isInstalling, isUninstalling, progress, error, checkStatus, install, uninstall }
})
```

- [ ] **Step 4: Create modStore**

```typescript
// src/renderer/stores/modStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useModStore = defineStore('mod', () => {
  const mods = ref<InstalledMod[]>([])
  const selectedModId = ref<string | null>(null)
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const selectedMod = computed(() => {
    if (!selectedModId.value) return null
    return mods.value.find(m => m.id === selectedModId.value) || null
  })

  const filteredMods = computed(() => {
    if (!searchQuery.value) return mods.value
    const q = searchQuery.value.toLowerCase()
    return mods.value.filter(m => m.name.toLowerCase().includes(q))
  })

  async function loadMods(gamePath: string) {
    isLoading.value = true
    try {
      mods.value = await window.electronAPI.mod.getInstalled(gamePath)
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function installFromFile(gamePath: string) {
    error.value = null
    try {
      const mod = await window.electronAPI.mod.installFromFile(gamePath)
      mods.value.push(mod)
      selectedModId.value = mod.id
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function uninstall(modId: string, gamePath: string) {
    error.value = null
    try {
      await window.electronAPI.mod.uninstall(gamePath, modId)
      mods.value = mods.value.filter(m => m.id !== modId)
      if (selectedModId.value === modId) {
        selectedModId.value = null
      }
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function toggle(modId: string, gamePath: string, enabled: boolean) {
    error.value = null
    try {
      await window.electronAPI.mod.toggle(gamePath, modId, enabled)
      const mod = mods.value.find(m => m.id === modId)
      if (mod) mod.enabled = enabled
    } catch (e: any) {
      error.value = e.message
    }
  }

  return {
    mods, selectedModId, searchQuery, isLoading, error,
    selectedMod, filteredMods,
    loadMods, installFromFile, uninstall, toggle
  }
})
```

---

### Task 8: Renderer Entry + App Shell + Styles

**Files:**
- Modify: `src/renderer/main.ts`
- Modify: `src/renderer/App.vue`
- Create: `src/renderer/assets/styles.css`
- Create: `src/renderer/components/Sidebar.vue`
- Create: `src/renderer/components/SidebarItem.vue`
- Create: `src/renderer/components/GameStatusBanner.vue`

- [ ] **Step 1: Write renderer main.ts**

```typescript
// src/renderer/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 2: Create styles.css**

```css
/* src/renderer/assets/styles.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --sidebar-width: 200px;
  --detail-width: 280px;
  --bg-primary: #1a1b2e;
  --bg-secondary: #232540;
  --bg-card: #2a2d4a;
  --bg-hover: #333660;
  --text-primary: #e8e8f0;
  --text-secondary: #9899b8;
  --accent: #6c63ff;
  --accent-hover: #5a52e0;
  --danger: #ff4757;
  --success: #2ed573;
  --border: #3a3d5c;
  --radius: 8px;
  --radius-sm: 4px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  user-select: none;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

button {
  cursor: pointer;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-danger {
  background: var(--danger);
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background: #e8404f;
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover);
}

input[type="text"] {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 13px;
  width: 100%;
  outline: none;
}
input[type="text"]:focus {
  border-color: var(--accent);
}

.error-text {
  color: var(--danger);
  font-size: 12px;
  margin-top: 4px;
}
```

- [ ] **Step 3: Write App.vue with layout and routing**

```vue
<!-- src/renderer/App.vue -->
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
```

- [ ] **Step 4: Create Sidebar.vue**

```vue
<!-- src/renderer/components/Sidebar.vue -->
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
```

- [ ] **Step 5: Create SidebarItem.vue**

```vue
<!-- src/renderer/components/SidebarItem.vue -->
<template>
  <button
    class="sidebar-item"
    :class="{ active }"
    @click="$emit('click')"
  >
    <span class="icon">{{ icon }}</span>
    <span class="label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  active: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 13px;
  text-align: left;
  transition: all 0.15s;
}

.sidebar-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: var(--accent);
  color: white;
}

.icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}
</style>
```

- [ ] **Step 6: Create GameStatusBanner.vue**

```vue
<!-- src/renderer/components/GameStatusBanner.vue -->
<template>
  <div class="status-banner">
    <div class="status-indicator" :class="{ active: !!gameInfo }"></div>
    <span class="status-text">
      {{ gameInfo ? gameInfo.name : 'No game selected' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const gameInfo = computed(() => gameStore.gameInfo)
</script>

<style scoped>
.status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-card);
  border-radius: var(--radius);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
}

.status-indicator.active {
  background: var(--success);
}

.status-text {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

---

### Task 9: InstallProgress Component + GameSetupView

**Files:**
- Create: `src/renderer/components/InstallProgress.vue`
- Create: `src/renderer/views/GameSetupView.vue`

- [ ] **Step 1: Create InstallProgress.vue**

```vue
<!-- src/renderer/components/InstallProgress.vue -->
<template>
  <div class="progress-container" v-if="progress">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress.percentage + '%' }"></div>
    </div>
    <span class="progress-text">{{ progress.percentage }}%</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: ProgressInfo | null
}>()
</script>

<style scoped>
.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-card);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}
</style>
```

- [ ] **Step 2: Create GameSetupView.vue**

```vue
<!-- src/renderer/views/GameSetupView.vue -->
<template>
  <div class="game-setup">
    <h1 class="page-title">Game Setup</h1>

    <!-- Game Path Section -->
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

    <!-- MelonLoader Section -->
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
```

---

### Task 10: ModManagerView Components

**Files:**
- Create: `src/renderer/components/ModCard.vue`
- Create: `src/renderer/components/ModDetail.vue`
- Create: `src/renderer/views/ModManagerView.vue`

- [ ] **Step 1: Create ModCard.vue**

```vue
<!-- src/renderer/components/ModCard.vue -->
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
```

- [ ] **Step 2: Create ModDetail.vue**

```vue
<!-- src/renderer/components/ModDetail.vue -->
<template>
  <div class="mod-detail" v-if="mod">
    <h2 class="mod-name">{{ mod.name }}</h2>

    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value" :class="{ enabled: mod.enabled }">
          {{ mod.enabled ? 'Enabled' : 'Disabled' }}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">File:</span>
        <span class="detail-value file-path">{{ mod.filePath }}</span>
      </div>
    </div>

    <div class="detail-actions">
      <button
        class="btn-secondary"
        @click="$emit('toggle', mod.id, !mod.enabled)"
      >
        {{ mod.enabled ? 'Disable' : 'Enable' }}
      </button>
      <button class="btn-danger" @click="$emit('uninstall', mod.id)">
        Uninstall
      </button>
    </div>
  </div>
  <div class="mod-detail empty" v-else>
    <p class="empty-text">Select a mod to view details</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mod: InstalledMod | null
}>()

defineEmits<{
  toggle: [id: string, enabled: boolean]
  uninstall: [id: string]
}>()
</script>

<style scoped>
.mod-detail {
  padding: 20px;
}

.mod-detail.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.mod-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.detail-section {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: var(--text-secondary);
  min-width: 50px;
}

.detail-value.enabled {
  color: var(--success);
}

.file-path {
  word-break: break-all;
  font-size: 12px;
}

.detail-actions {
  display: flex;
  gap: 8px;
}
</style>
```

- [ ] **Step 3: Create ModManagerView.vue**

```vue
<!-- src/renderer/views/ModManagerView.vue -->
<template>
  <div class="mod-manager" v-if="gameStore.gamePath">
    <h1 class="page-title">Mod Manager</h1>

    <!-- Toolbar -->
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

    <!-- Three-column layout -->
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
```

---

### Task 11: AboutView + Final Integration

**Files:**
- Create: `src/renderer/views/AboutView.vue`

- [ ] **Step 1: Create AboutView.vue**

```vue
<!-- src/renderer/views/AboutView.vue -->
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
  // Electron shell.openExternal would be used here in production;
  // for now, open the URL in the user's browser via the preload API
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
```

- [ ] **Step 2: Build and verify**

```bash
npx electron-vite build
```

Expected: Exit 0, `out/` directory contains main/preload/renderer bundles.

---

### Task 12: Dev Test

- [ ] **Step 1: Run the app in dev mode**

```bash
npx electron-vite dev
```

This launches the Electron window. Verify:
- Game Setup page renders with Browse button
- Clicking Browse opens a folder dialog
- Selecting a valid ADOFAI directory shows game info
- MelonLoader card appears after game path is set
- Sidebar navigation switches between views
- Mod Manager page shows "Please set up your game path first" when no path is set

Close the app window when done.
