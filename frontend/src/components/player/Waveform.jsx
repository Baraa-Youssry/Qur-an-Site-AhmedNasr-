import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { usePlayerStore } from '../../store/playerStore'

export default function Waveform() {
  const containerRef = useRef(null)
  const wavesurferRef = useRef(null)
  const { currentSurah, progress, setProgress } = usePlayerStore()

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(201, 168, 76, 0.3)',
      progressColor: '#c9a84c',
      cursorColor: '#00c896',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 40,
      responsive: true,
      normalize: true,
    })

    wavesurferRef.current = ws

    ws.on('interaction', (newTime) => {
      setProgress(newTime)
    })

    return () => {
      ws.destroy()
    }
  }, [])

  useEffect(() => {
    if (!wavesurferRef.current || !currentSurah) return

    wavesurferRef.current.load(currentSurah.audio_url)
  }, [currentSurah])

  useEffect(() => {
    if (!wavesurferRef.current) return
    const duration = wavesurferRef.current.getDuration()
    if (duration > 0) {
      wavesurferRef.current.seekTo(progress / duration)
    }
  }, [progress])

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className="flex-1 min-w-0 cursor-pointer [&_wave]:hidden"
    />
  )
}
