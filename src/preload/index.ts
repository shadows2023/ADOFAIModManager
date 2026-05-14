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
