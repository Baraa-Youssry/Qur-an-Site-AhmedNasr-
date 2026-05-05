import { create } from 'zustand'

export const usePlayerStore = create((set) => ({
  currentSurah: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  playbackRate: 1,

  setCurrentSurah: (surah) => set({ currentSurah: surah, isPlaying: true, progress: 0, duration: 0 }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setProgress: (v) => set({ progress: v }),
  setDuration: (v) => set({ duration: v }),
  setVolume: (v) => set({ volume: v }),
  setPlaybackRate: (v) => set({ playbackRate: v }),
  reset: () => set({ currentSurah: null, isPlaying: false, progress: 0, duration: 0 }),
}))
