import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getSettings, getMilestones } from '../services/api'
import Timeline from '../components/about/Timeline'
import Spinner from '../components/ui/Spinner'

export default function AboutPage() {
  const { t, i18n } = useTranslation()

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000,
  })

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: getMilestones,
    staleTime: 10 * 60 * 1000,
  })

  const name = i18n.language === 'ar' ? settings?.reciter_name_ar : settings?.reciter_name_en
  const bio = i18n.language === 'ar' ? settings?.bio_ar : settings?.bio_en
  const profileImage = settings?.profile_image_url

  const isLoading = settingsLoading || milestonesLoading

  return (
    <>
      <Helmet>
        <title>{t('about.title')} - {name || 'Ahmed Abdelrazek Nasr'}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-arabic text-3xl md:text-4xl font-bold text-gradient mb-2">
            {t('about.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 text-gray-500">
            {t('about.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="glass-card mb-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={name}
                    className="w-32 h-32 rounded-2xl object-cover border-2 border-gold/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gold/20 to-emerald/20 flex items-center justify-center border-2 border-gold/30">
                    <span className="text-4xl font-arabic font-bold text-gold">
                      {(name || 'A')[0]}
                    </span>
                  </div>
                )}

                <div className="text-center md:text-start">
                  <h2 className="font-heading text-2xl font-bold text-white dark:text-white text-gray-900 mb-2">
                    {name || 'Ahmed Abdelrazek Nasr'}
                  </h2>
                  {bio ? (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {bio}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      {i18n.language === 'ar' ? 'لم تتم إضافة السيرة الذاتية بعد' : 'Bio not yet added'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {milestones.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-gradient mb-8 text-center">
                  {t('about.timeline')}
                </h2>
                <Timeline milestones={milestones} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
