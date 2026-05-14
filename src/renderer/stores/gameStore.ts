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
