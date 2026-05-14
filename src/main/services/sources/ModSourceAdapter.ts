import { ModMetaData } from '../types'

export abstract class ModSourceAdapter {
  abstract readonly name: string

  async fetchModList(): Promise<ModMetaData[]> {
    throw new Error('Not implemented')
  }

  async downloadMod(mod: ModMetaData, destPath: string): Promise<void> {
    throw new Error('Not implemented')
  }
}
