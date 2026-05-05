import { useEffect, useRef, useCallback } from 'react'
import { Howl } from 'howler'
import { usePlayerStore } from '../store/playerStore'

export function useAudio() {
  const howlRef = useRef(null)
  const {
    currentSurah, isPlaying, volume, playbackRate,
    setIsPlaying, setProgress, setDuration,
  } = usePlayerStore()

  useEffect(() => {
    if (!currentSurah) return

    if (howlRef.current) {
      howlRef.current.unload()
    }

    const howl = new Howl({
      src: [currentSurah.audio_url],
      html5: true,
      volume: usePlayerStore.getState().volume,
      rate: usePlayerStore.getState().playbackRate,
      onload: () => {
        if (howlRef.current) {
          setDuration(howlRef.current.duration())
        }
      },
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => setIsPlaying(false),
    })

    howlRef.current = howl
    howl.play()

    const interval = setInterval(() => {
      if (howl.playing()) {
        setProgress(howl.seek())
      }
    }, 250)

    return () => {
      clearInterval(interval)
      howl.unload()
    }
  }, [currentSurah])

  useEffect(() => {
    if (!howlRef.current) return
    if (isPlaying) {
      howlRef.current.play()
    } else {
      howlRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume)
    }
  }, [volume])

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.rate(playbackRate)
    }
  }, [playbackRate])

  const seek = useCallback((seconds) => {
    if (howlRef.current) {
      howlRef.current.seek(seconds)
      setProgress(seconds)
    }
  }, [setProgress])

  return { seek }
}
