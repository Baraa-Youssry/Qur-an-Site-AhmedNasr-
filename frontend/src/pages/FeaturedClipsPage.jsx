import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getClips } from '../services/api'
import ClipCard from '../components/clips/ClipCard'
import Spinner from '../components/ui/Spinner'
import { FiSearch } from 'react-icons/fi'

export default function FeaturedClipsPage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')

  const { data: clips = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['clips'],
    queryFn: getClips,
    staleTime: 5 * 60 * 1000,
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return clips
    const q = search.trim().toLowerCase()
    return clips.filter(
      (clip) =>
        clip.title_ar?.includes(q) ||
        clip.title_en?.toLowerCase().includes(q) ||
        clip.description_ar?.includes(q) ||
        clip.description_en?.toLowerCase().includes(q)
    )
  }, [clips, search])

  return (
    <>
      <Helmet>
        <title>{t('clips.title')} - Ahmed Abdelrazek Nasr</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="font-arabic text-3xl md:text-4xl font-bold text-gradient mb-2">
            {t('clips.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 text-gray-500">
            {t('clips.subtitle')}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative w-full sm:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('clips.search')}
              className="input-field pl-10"
            />
          </div>
        </div>

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
            <p className="text-gray-500 dark:text-gray-400">{t('clips.no_results')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
