import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useModStore = defineStore('mod', () => {
  const mods = ref<InstalledMod[]>([])
  const selectedModId = ref<string | null>(null)
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const selectedMod = computed(() => {
    if (!selectedModId.value) return null
    return mods.value.find(m => m.id === selectedModId.value) || null
  })

  const filteredMods = computed(() => {
    if (!searchQuery.value) return mods.value
    const q = searchQuery.value.toLowerCase()
    return mods.value.filter(m => m.name.toLowerCase().includes(q))
  })

  async function loadMods(gamePath: string) {
    isLoading.value = true
    try {
      mods.value = await window.electronAPI.mod.getInstalled(gamePath)
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function installFromFile(gamePath: string) {
    error.value = null
    try {
      const mod = await window.electronAPI.mod.installFromFile(gamePath)
      mods.value.push(mod)
      selectedModId.value = mod.id
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function uninstall(modId: string, gamePath: string) {
    error.value = null
    try {
      await window.electronAPI.mod.uninstall(gamePath, modId)
      mods.value = mods.value.filter(m => m.id !== modId)
      if (selectedModId.value === modId) {
        selectedModId.value = null
      }
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function toggle(modId: string, gamePath: string, enabled: boolean) {
    error.value = null
    try {
      await window.electronAPI.mod.toggle(gamePath, modId, enabled)
      const mod = mods.value.find(m => m.id === modId)
      if (mod) mod.enabled = enabled
    } catch (e: any) {
      error.value = e.message
    }
  }

  return {
    mods, selectedModId, searchQuery, isLoading, error,
    selectedMod, filteredMods,
    loadMods, installFromFile, uninstall, toggle
  }
})
