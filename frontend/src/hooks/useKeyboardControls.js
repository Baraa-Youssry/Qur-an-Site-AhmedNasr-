import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { seekTo } from '../utils/audioEngine'

export function useKeyboardControls(surahs = [], handleNavigate = () => {}) {
  const { isPlaying, setIsPlaying } = usePlayerStore()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          setIsPlaying(!isPlaying)
          break

        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) {
            seekTo(Math.max(0, usePlayerStore.getState().progress - 10))
          } else {
            seekTo(usePlayerStore.getState().progress + 5)
          }
          break

        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) {
            seekTo(usePlayerStore.getState().progress + 10)
          } else {
            seekTo(Math.max(0, usePlayerStore.getState().progress - 5))
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          usePlayerStore.setState({
            volume: Math.min(1, usePlayerStore.getState().volume + 0.1),
          })
          break

        case 'ArrowDown':
          e.preventDefault()
          usePlayerStore.setState({
            volume: Math.max(0, usePlayerStore.getState().volume - 0.1),
          })
          break

        case 'KeyN':
          if (!e.shiftKey) {
            e.preventDefault()
            const state = usePlayerStore.getState()
            const idx = surahs.findIndex((s) => s.id === state.currentSurah?.id)
            if (idx < surahs.length - 1) handleNavigate(surahs[idx + 1])
          }
          break

        case 'KeyP':
          if (!e.shiftKey) {
            e.preventDefault()
            const state = usePlayerStore.getState()
            const idx = surahs.findIndex((s) => s.id === state.currentSurah?.id)
            if (idx > 0) handleNavigate(surahs[idx - 1])
          }
          break

        case 'KeyM':
          e.preventDefault()
          usePlayerStore.setState({
            volume: usePlayerStore.getState().volume > 0 ? 0 : 0.8,
          })
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, surahs, handleNavigate, setIsPlaying])

  return null
}
