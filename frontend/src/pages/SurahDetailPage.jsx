import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getSurahs, getSurah, getSettings } from '../services/api'
import { usePlayerStore } from '../store/playerStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { useKeyboardControls } from '../hooks/useKeyboardControls'
import { seekTo } from '../utils/audioEngine'
import { toArabicNumerals, formatDuration } from '../utils/formatters'
import Spinner from '../components/ui/Spinner'
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiRepeat, FiBookmark, FiCheck, FiShare2, FiArrowLeft, FiVolume2,
} from 'react-icons/fi'
import reciterImg from '../imgs/561757969_1135356858662777_2336006452127057088_n-removebg-preview.jpeg'

export default function SurahDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [shareSuccess, setShareSuccess] = useState(false)

  const {
    currentSurah, isPlaying, progress, duration, volume, playbackRate,
    setCurrentSurah, setIsPlaying, setVolume, setPlaybackRate,
  } = usePlayerStore()

  const { toggleFavorite, isFavorite, addToRecentlyPlayed } = useFavoritesStore()

  const { data: surahs = [] } = useQuery({
    queryKey: ['surahs'],
    queryFn: getSurahs,
    staleTime: 5 * 60 * 1000,
  })

  const { data: surah, isLoading } = useQuery({
    queryKey: ['surah', id],
    queryFn: () => getSurah(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000,
  })

  const handleNavigate = (targetSurah) => {
    if (targetSurah) {
      navigate(`/surah/${targetSurah.id}`)
    }
  }

  useKeyboardControls(surahs, handleNavigate)

  const reciterName = i18n.language === 'ar' ? settings?.reciter_name_ar : settings?.reciter_name_en

  const currentIndex = surahs.findIndex((s) => s.id === surah?.id)
  const prevSurah = currentIndex > 0 ? surahs[currentIndex - 1] : null
  const nextSurah = currentIndex < surahs.length - 1 ? surahs[currentIndex + 1] : null

  const surahNameAr = surah?.name_ar
  const surahNameEn = surah?.name_en
  const isActive = currentSurah?.id === surah?.id
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0
  const saved = isFavorite(surah?.id)

  useEffect(() => {
    if (surah && isActive) {
      setIsPlaying(true)
    }
    if (surah) {
      addToRecentlyPlayed(surah)
    }
  }, [surah])

  const handlePlay = () => {
    if (surah) {
      setCurrentSurah(surah)
    }
  }

  const handleTogglePlay = () => {
    if (isActive) {
      setIsPlaying(!isPlaying)
    } else {
      handlePlay()
    }
  }

  const handleSeek = (e) => {
    seekTo(parseFloat(e.target.value))
  }

  const handleShare = async () => {
    const shareData = {
      title: surahNameAr,
      text: `Listen to Surah ${surahNameEn} by ${reciterName}`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      } catch {
      }
    }
  }

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!surah) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t('common.error')}</p>
          <Link to="/library" className="text-gold hover:text-gold-light font-heading">
            {t('library.title')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{surahNameAr} - {t('library.title')}</title>
      </Helmet>

      <div className="max-w-lg mx-auto px-4 py-8 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gold transition-colors mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-heading">{t('common.back')}</span>
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-gold/30 shadow-xl shadow-gold/10 mb-4">
            <img
              src={reciterImg}
              alt={reciterName || ''}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="font-arabic text-3xl md:text-4xl font-bold text-gradient mb-1 text-center">
            {surahNameAr}
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 font-heading mb-3">{surahNameEn}</p>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className={`text-xs px-3 py-1 rounded-full font-medium
              ${surah?.revelation === 'Makki'
                ? 'bg-emerald/10 dark:bg-emerald/10 text-emerald-dark dark:text-emerald'
                : 'bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}>
              {t(`library.${surah?.revelation === 'Makki' ? 'makki' : 'madani'}`)}
            </span>
            <span className="text-xs text-gray-500">
              {i18n.language === 'ar' ? toArabicNumerals(surah?.ayah_count) : surah?.ayah_count} {t('library.ayahs')}
            </span>
            {reciterName && (
              <span className="text-xs text-gold/70 font-heading">
                {reciterName}
              </span>
            )}
          </div>
        </div>

        {surah?.video_url && (
          <div className="mb-8">
            <div className="rounded-2xl overflow-hidden border border-white/5 dark:border-white/10 shadow-2xl">
              <div className="aspect-video bg-black">
                <video
                  src={surah.video_url}
                  controls
                  preload="metadata"
                  className="w-full h-full"
                  playsInline
                />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-navy/40 dark:bg-white/5 backdrop-blur border border-white/5 dark:border-white/10 shadow-xl dark:shadow-2xl p-6 mb-8">
          <div className="mb-4">
            <div className="flex items-center justify-center h-12">
              <input
                type="range"
                dir="ltr"
                min="0"
                max={duration || 0}
                step="0.1"
                value={progress}
                onChange={handleSeek}
                className="w-full h-8 bg-gray-100/80 dark:bg-white/5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold/60
                  [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold/60 [&::-moz-range-thumb]:border-0"
                style={{
                  background: `linear-gradient(to right, rgba(201,168,76,0.3) ${progressPercent}%, rgba(229, 231, 235, 0.4) ${progressPercent}%)`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-xs font-heading text-gray-500">{formatDuration(progress)}</span>
            <span className="text-xs font-heading text-gray-500">{formatDuration(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <button className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gold transition-colors">
              <FiRepeat className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleNavigate(prevSurah)}
              disabled={!prevSurah}
              className={`p-3 rounded-xl transition-all duration-300
                ${prevSurah
                  ? 'text-gray-400 dark:text-gray-400 hover:text-gold hover:bg-navy/30 dark:hover:bg-white/5'
                  : 'opacity-30 cursor-not-allowed text-gray-500 dark:text-gray-600'
                }`}
            >
              <FiSkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-14 h-14 rounded-full bg-gold hover:bg-gold-light flex items-center justify-center text-navy transition-all duration-300 shadow-lg shadow-gold/25"
            >
              {isActive && isPlaying ? (
                <FiPause className="w-6 h-6" />
              ) : (
                <FiPlay className="w-6 h-6 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleNavigate(nextSurah)}
              disabled={!nextSurah}
              className={`p-3 rounded-xl transition-all duration-300
                ${nextSurah
                  ? 'text-gray-400 dark:text-gray-400 hover:text-gold hover:bg-navy/30 dark:hover:bg-white/5'
                  : 'opacity-30 cursor-not-allowed text-gray-500 dark:text-gray-600'
                }`}
            >
              <FiSkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={() => toggleFavorite(surah)}
              className={`p-2 rounded-lg transition-colors
                ${saved ? 'text-gold' : 'text-gray-500 hover:text-gold'}`}
            >
              <FiBookmark className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 mb-4">
            {speeds.map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackRate(speed)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  playbackRate === speed
                    ? 'bg-gold/20 text-gold'
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-300 hover:bg-navy/30 dark:hover:bg-white/5'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <FiVolume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              dir="ltr"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-gray-200/60 dark:bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold
                [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-0"
              style={{
                background: `linear-gradient(to right, #c9a84c ${volume * 100}%, rgba(229, 231, 235, 0.6) ${volume * 100}%)`,
              }}
            />
          </div>

          <div className="border-t border-white/5 mt-5 mb-4" />

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => toggleFavorite(surah)}
              className={`flex flex-col items-center gap-1 transition-colors
                ${saved ? 'text-gold' : 'text-gray-500 hover:text-gold'}`}
            >
              {saved ? <FiCheck className="w-5 h-5" /> : <FiBookmark className="w-5 h-5" />}
              <span className="text-[10px] font-heading">{saved ? t('player.saved') : t('player.save')}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-gold transition-colors"
            >
              <FiShare2 className="w-5 h-5" />
              <span className="text-[10px] font-heading">
                {shareSuccess ? t('player.copied') : t('player.share')}
              </span>
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-xs text-gray-600 font-heading hidden md:block">
            Space: Play/Pause | ← →: Seek | ↑ ↓: Volume | N: Next | P: Previous | M: Mute
          </p>
        </div>

        {(prevSurah || nextSurah) && (
          <div className="grid grid-cols-2 gap-3">
            {prevSurah && (
              <button
                onClick={() => handleNavigate(prevSurah)}
                className="rounded-xl bg-navy/30 dark:bg-white/5 border border-white/5 dark:border-white/5 p-4 text-left hover:bg-navy/50 dark:hover:bg-white/10 transition-all duration-300 group shadow-sm"
              >
                <span className="text-xs text-gold/50 font-heading">
                  {i18n.language === 'ar' ? toArabicNumerals(prevSurah.number) : prevSurah.number}
                </span>
                <h3 className="font-arabic text-sm font-bold text-gray-900 dark:text-white group-hover:text-gold transition-colors mt-1">
                  {i18n.language === 'ar' ? prevSurah.name_ar : prevSurah.name_en}
                </h3>
                <span className="text-[10px] text-gray-500 dark:text-gray-500 mt-1 block">
                  {t('player.previous')}
                </span>
              </button>
            )}

            {nextSurah && (
              <button
                onClick={() => handleNavigate(nextSurah)}
                className="rounded-xl bg-navy/30 dark:bg-white/5 border border-white/5 dark:border-white/5 p-4 text-right hover:bg-navy/50 dark:hover:bg-white/10 transition-all duration-300 group shadow-sm"
              >
                <span className="text-xs text-gold/50 font-heading">
                  {i18n.language === 'ar' ? toArabicNumerals(nextSurah.number) : nextSurah.number}
                </span>
                <h3 className="font-arabic text-sm font-bold text-gray-900 dark:text-white group-hover:text-gold transition-colors mt-1">
                  {i18n.language === 'ar' ? nextSurah.name_ar : nextSurah.name_en}
                </h3>
                <span className="text-[10px] text-gray-500 dark:text-gray-500 mt-1 block">
                  {t('player.next')}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
