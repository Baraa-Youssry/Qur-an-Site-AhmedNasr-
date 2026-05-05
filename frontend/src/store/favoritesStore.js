import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      recentlyPlayed: [],
      toggleFavorite: (surah) => {
        const { favorites } = get()
        const exists = favorites.some((s) => s.id === surah.id)
        if (exists) {
          set({ favorites: favorites.filter((s) => s.id !== surah.id) })
        } else {
          set({ favorites: [...favorites, surah] })
        }
      },
      isFavorite: (surahId) => {
        return get().favorites.some((s) => s.id === surahId)
      },
      addToRecentlyPlayed: (surah) => {
        const { recentlyPlayed } = get()
        const filtered = recentlyPlayed.filter((s) => s.id !== surah.id)
        set({ recentlyPlayed: [surah, ...filtered].slice(0, 20) })
      },
      clearRecentlyPlayed: () => set({ recentlyPlayed: [] }),
    }),
    { name: 'favorites-storage' }
  )
)
