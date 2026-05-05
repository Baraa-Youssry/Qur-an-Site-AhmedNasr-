import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePlayerStore } from '../../store/playerStore'
import { useFavoritesStore } from '../../store/favoritesStore'
import { toArabicNumerals, formatDuration } from '../../utils/formatters'
import { FiPlay, FiPause, FiDownload, FiBookmark } from 'react-icons/fi'

export default function SurahCard({ surah }) {
  const { t, i18n } = useTranslation()
  const { currentSurah, isPlaying } = usePlayerStore()
  const { isFavorite, toggleFavorite } = useFavoritesStore()

  const name = i18n.language === 'ar' ? surah.name_ar : surah.name_en
  const number = i18n.language === 'ar' ? toArabicNumerals(surah.number) : surah.number
  const isActive = currentSurah?.id === surah.id
  const saved = isFavorite(surah.id)

  const handlePlay = (e) => {
    if (isActive) {
      e.preventDefault()
    }
  }

  return (
    <Link
      to={`/surah/${surah.id}`}
      onClick={handlePlay}
      className={`glass-card group relative cursor-pointer flex flex-col items-center justify-center p-5 text-center
        ${isActive ? 'ring-1 ring-gold/50 bg-gold/5' : ''}`}
    >
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleFavorite(surah)
        }}
        className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 z-10
          ${saved
            ? 'text-gold bg-gold/10'
            : 'text-gray-600 opacity-0 group-hover:opacity-100 hover:text-gold'
          }`}
      >
        <FiBookmark className="w-3.5 h-3.5" />
      </button>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300
        ${isActive
          ? 'bg-gold text-navy'
          : 'bg-navy/30 dark:bg-white/5 text-gold group-hover:bg-gold/10 shadow-sm'
        }`}>
        {isActive && isPlaying ? (
          <FiPause className="w-5 h-5" />
        ) : (
          <FiPlay className="w-5 h-5" />
        )}
      </div>

      <span className="text-xs text-gold/60 font-heading mb-1">{number}</span>
      <h3 className="font-arabic text-base font-bold text-white dark:text-white text-gray-900 mb-1 leading-relaxed">
        {name}
      </h3>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
          ${surah.revelation === 'Makki'
            ? 'bg-emerald/10 dark:bg-emerald/10 text-emerald-dark'
            : 'bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
          }`}>
          {t(`library.${surah.revelation === 'Makki' ? 'makki' : 'madani'}`)}
        </span>
        <span className="text-[10px] text-gray-500">
          {surah.ayah_count} {t('library.ayahs')}
        </span>
      </div>

      {surah.duration_sec && (
        <p className="text-xs text-gray-500">{formatDuration(surah.duration_sec)}</p>
      )}

      <a
        href={surah.audio_url}
        download
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-2 p-2 rounded-lg hover:bg-gold/10 text-gray-500 dark:text-gray-500 hover:text-gold transition-all opacity-0 group-hover:opacity-100"
      >
        <FiDownload className="w-3.5 h-3.5" />
      </a>
    </Link>
  )
}
