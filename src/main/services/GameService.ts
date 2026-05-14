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
