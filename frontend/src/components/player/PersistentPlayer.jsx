import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getSurahs } from '../../services/api'
import { usePlayerStore } from '../../store/playerStore'
import { playAudio, togglePlay, seekTo, updateVolume, updateRate } from '../../utils/audioEngine'
import { formatDuration } from '../../utils/formatters'
import { FiPlay, FiPause, FiDownload, FiVolume2, FiSkipBack, FiSkipForward } from 'react-icons/fi'
import Waveform from './Waveform'

export default function PersistentPlayer() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const {
    currentSurah, isPlaying, progress, duration, volume, playbackRate,
    setIsPlaying, setVolume, setPlaybackRate, reset,
  } = usePlayerStore()

  const { data: surahs = [] } = useQuery({
    queryKey: ['surahs'],
    queryFn: getSurahs,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (surahs.length > 0) {
      window.__surahs = surahs
    }
    return () => { delete window.__surahs }
  }, [surahs])

  useEffect(() => {
    if (currentSurah) {
      playAudio(currentSurah.audio_url, currentSurah)
    }
  }, [currentSurah])

  useEffect(() => {
    togglePlay(isPlaying)
  }, [isPlaying])

  useEffect(() => {
    updateVolume(volume)
  }, [volume])

  useEffect(() => {
    updateRate(playbackRate)
  }, [playbackRate])

  if (!currentSurah) return null

  const name = i18n.language === 'ar' ? currentSurah.name_ar : currentSurah.name_en
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  const currentIndex = surahs.findIndex((s) => s.id === currentSurah.id)
  const prevSurah = currentIndex > 0 ? surahs[currentIndex - 1] : null
  const nextSurah = currentIndex < surahs.length - 1 ? surahs[currentIndex + 1] : null

  const handleNavigate = (targetSurah) => {
    if (targetSurah) {
      navigate(`/surah/${targetSurah.id}`)
    }
  }

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy/85 dark:bg-navy/85 bg-white/80 backdrop-blur-xl border-t border-gray-200/60 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 w-48">
            <button
              onClick={() => navigate(`/surah/${currentSurah.id}`)}
              className="flex items-center gap-3 min-w-0 w-48 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-emerald/20 flex items-center justify-center flex-shrink-0 group-hover:from-gold/30 group-hover:to-emerald/30 transition-all duration-300">
                <span className="text-gold text-xs font-heading font-bold">
                  {currentSurah.number}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white dark:text-white text-gray-900 truncate">
                  {t('library.surah')} {name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDuration(progress)} / {formatDuration(duration)}
                </p>
              </div>
            </button>
          </div>

          <div className="hidden md:flex flex-1 min-w-0 mx-4">
            <Waveform />
          </div>

          <div className="flex md:hidden flex-1 mx-2">
            <input
              type="range"
              dir="ltr"
              min="0"
              max={duration || 0}
              step="0.1"
              value={progress}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-200/60 dark:bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold"
              style={{
                background: `linear-gradient(to right, #c9a84c ${progressPercent}%, rgba(229, 231, 235, 0.6) ${progressPercent}%)`,
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate(prevSurah)}
              disabled={!prevSurah}
              className={`p-2 rounded-lg transition-all duration-200
                ${prevSurah
                  ? 'hover:bg-navy/30 dark:hover:bg-white/5 text-gray-400 hover:text-gold'
                  : 'opacity-30 cursor-not-allowed text-gray-500 dark:text-gray-600'
                }`}
            >
              <FiSkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold transition-all duration-300"
            >
              {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleNavigate(nextSurah)}
              disabled={!nextSurah}
              className={`p-2 rounded-lg transition-all duration-200
                ${nextSurah
                  ? 'hover:bg-navy/30 dark:hover:bg-white/5 text-gray-400 hover:text-gold'
                  : 'opacity-30 cursor-not-allowed text-gray-500 dark:text-gray-600'
                }`}
            >
              <FiSkipForward className="w-4 h-4" />
            </button>

            <a
              href={currentSurah.audio_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl hover:bg-navy/30 dark:hover:bg-white/5 text-gray-400 hover:text-gold transition-all duration-300"
            >
              <FiDownload className="w-4 h-4" />
            </a>

            <div className="hidden lg:flex items-center gap-1 ml-2">
              {speeds.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    playbackRate === speed
                      ? 'bg-gold/20 text-gold'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-300 hover:bg-navy/30 dark:hover:bg-white/5'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2 ml-2">
              <FiVolume2 className="w-4 h-4 text-gray-400" />
              <input
                type="range"
                dir="ltr"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-200/60 dark:bg-white/10 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold"
              />
            </div>

            <button
              onClick={reset}
              className="p-2 rounded-xl hover:bg-navy/30 dark:hover:bg-white/5 text-gray-500 hover:text-red-400 transition-all duration-300"
              title={t('common.close')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
