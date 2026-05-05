import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getSurahsAdmin, getStorageStats, getAllClipsAdmin } from '../../services/api'
import GlassCard from '../../components/ui/GlassCard'
import Spinner from '../../components/ui/Spinner'
import { HiMusicNote, HiFilm, HiCloud } from 'react-icons/hi'
import { formatFileSize } from '../../utils/formatters'

export default function AdminDashboard() {
  const { t } = useTranslation()

  const { data: surahs = [], isLoading: surahsLoading } = useQuery({
    queryKey: ['surahs-admin'],
    queryFn: getSurahsAdmin,
  })

  const { data: clips = [], isLoading: clipsLoading } = useQuery({
    queryKey: ['clips-admin'],
    queryFn: getAllClipsAdmin,
  })

  const { data: storageStats } = useQuery({
    queryKey: ['storage-stats'],
    queryFn: getStorageStats,
  })

  const isLoading = surahsLoading || clipsLoading

  if (isLoading) return <Spinner size="lg" className="py-20" />

  const stats = [
    {
      label: t('admin.total_surahs'),
      value: surahs.length,
      icon: HiMusicNote,
      color: 'from-gold to-gold-dark',
      detail: `${surahs.filter((s) => s.is_published).length} ${t('library.surah')} published`,
    },
    {
      label: t('admin.total_clips'),
      value: clips.length,
      icon: HiFilm,
      color: 'from-emerald to-emerald-dark',
      detail: `${clips.filter((c) => c.is_published).length} published`,
    },
    {
      label: t('admin.storage_used'),
      value: formatFileSize(storageStats?.totalStorageKb),
      icon: HiCloud,
      color: 'from-blue-500 to-blue-600',
      detail: `of 10 GB free tier`,
    },
  ]

  return (
    <>
      <Helmet>
        <title>{t('admin.dashboard')} - Sacred Echoes</title>
      </Helmet>

      <div>
        <h1 className="font-heading text-2xl font-bold text-white dark:text-white text-gray-900 mb-6">
          {t('admin.dashboard')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <GlassCard key={stat.label} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-white dark:text-white text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.detail}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {storageStats?.totalStorageKb > 0 && (
          <GlassCard className="mb-8">
            <p className="text-sm text-gray-400 mb-2">{t('admin.storage_used')}</p>
            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-emerald transition-all duration-500"
                style={{ width: `${Math.min((storageStats.totalStorageKb / (10 * 1024 * 1024)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(storageStats.totalStorageKb)} / 10 GB
            </p>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard>
            <h3 className="font-heading font-semibold text-white dark:text-white text-gray-900 mb-3">
              {t('admin.surahs')}
            </h3>
            {surahs.length === 0 ? (
              <p className="text-sm text-gray-500">No surahs uploaded yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {surahs.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 dark:text-gray-300 text-gray-700">
                      {s.number}. {s.name_en}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_published ? 'bg-emerald/10 text-emerald' : 'bg-gray-500/10 text-gray-500'}`}>
                      {s.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
                {surahs.length > 10 && (
                  <p className="text-xs text-gray-500">+{surahs.length - 10} more</p>
                )}
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="font-heading font-semibold text-white dark:text-white text-gray-900 mb-3">
              {t('admin.clips')}
            </h3>
            {clips.length === 0 ? (
              <p className="text-sm text-gray-500">No clips added yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {clips.slice(0, 10).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 dark:text-gray-300 text-gray-700 truncate">
                      {c.title_en}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_published ? 'bg-emerald/10 text-emerald' : 'bg-gray-500/10 text-gray-500'}`}>
                      {c.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </>
  )
}
