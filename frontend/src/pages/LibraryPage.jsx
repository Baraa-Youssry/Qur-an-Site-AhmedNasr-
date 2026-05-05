import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getSurahs } from '../services/api'
import SurahCard from '../components/player/SurahCard'
import Spinner from '../components/ui/Spinner'
import { FiSearch, FiBookmark, FiClock } from 'react-icons/fi'
import { useFavoritesStore } from '../store/favoritesStore'

export default function LibraryPage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { favorites, recentlyPlayed, clearRecentlyPlayed } = useFavoritesStore()

  const { data: surahs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['surahs'],
    queryFn: getSurahs,
    staleTime: 5 * 60 * 1000,
  })

  const filtered = useMemo(() => {
    let result = surahs

    if (filter === 'favorites') {
      const favIds = new Set(favorites.map((s) => s.id))
      result = result.filter((s) => favIds.has(s.id))
    } else if (filter !== 'all') {
      result = result.filter((s) => s.revelation === filter)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (s) =>
          s.name_ar.includes(q) ||
          s.name_en.toLowerCase().includes(q) ||
          String(s.number).includes(q)
      )
    }

    return result
  }, [surahs, search, filter, favorites])

  const filterButtons = [
    { value: 'all', label: t('library.filter_all') },
    { value: 'Makki', label: t('library.filter_makki') },
    { value: 'Madani', label: t('library.filter_madani') },
    { value: 'favorites', label: t('player.favorites'), icon: FiBookmark },
  ]

  return (
    <>
      <Helmet>
        <title>{t('library.title')} - Ahmed Abdelrazek Nasr</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="font-arabic text-3xl md:text-4xl font-bold text-gradient mb-2">
            {t('library.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 text-gray-500">
            {t('library.subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <div className="relative flex-1 w-full sm:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('library.search')}
              className="input-field pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            {filterButtons.map((f) => {
              const Icon = f.icon
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                    filter === f.value
                      ? 'bg-gold/10 text-gold border border-gold/30'
                      : 'bg-navy/30 dark:bg-white/5 text-gray-400 dark:text-gray-400 hover:text-gray-300 dark:hover:text-white border border-white/5 dark:border-white/5'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {filter === 'all' && recentlyPlayed.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiClock className="w-4 h-4 text-gold" />
                {t('player.recently_played')}
              </h2>
              <button
                onClick={clearRecentlyPlayed}
                className="text-xs text-gray-500 hover:text-gold transition-colors font-heading"
              >
                {t('player.clear_recent')}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {recentlyPlayed.slice(0, 6).map((surah) => (
                <SurahCard key={surah.id} surah={surah} />
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('common.error')}</p>
            <button onClick={() => refetch()} className="btn-primary">
              {t('common.retry')}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FiBookmark className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'favorites' ? t('player.no_favorites') : t('library.no_results')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((surah) => (
              <SurahCard key={surah.id} surah={surah} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
