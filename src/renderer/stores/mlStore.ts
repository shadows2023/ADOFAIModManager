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
