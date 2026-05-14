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

    if (!fileName.endsWith('.dll')) {
      throw new Error('Invalid mod file: must be a .dll file')
    }

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
