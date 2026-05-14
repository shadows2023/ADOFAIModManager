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
