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
