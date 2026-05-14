import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
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
    const progressHandler = (progress: any) => {
      mainWindow?.webContents.send('ml:download-progress', progress)
    }
    melonLoaderService.on('download-progress', progressHandler)
    try {
      await melonLoaderService.download(gamePath)
      await melonLoaderService.install(gamePath)
    } finally {
      melonLoaderService.off('download-progress', progressHandler)
    }
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
    return []
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
