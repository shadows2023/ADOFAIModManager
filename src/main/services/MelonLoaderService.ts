import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import { EventEmitter } from 'events'
import AdmZip from 'adm-zip'

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
      await this.download(gamePath)
    }

    const zip = new AdmZip(this.downloadPath)
    zip.extractAllTo(gamePath, true)

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
