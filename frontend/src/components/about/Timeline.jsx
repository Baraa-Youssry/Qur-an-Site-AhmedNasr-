import { useTranslation } from 'react-i18next'

export default function Timeline({ milestones = [] }) {
  const { t, i18n } = useTranslation()

  if (milestones.length === 0) return null

  return (
    <div className="relative">
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-emerald to-transparent" />

      <div className="space-y-8">
        {milestones.map((milestone, index) => {
          const title = i18n.language === 'ar' ? milestone.title_ar : milestone.title_en
          const description = i18n.language === 'ar' ? milestone.description_ar : milestone.description_en
          const isLeft = index % 2 === 0

          return (
            <div key={milestone.id} className="relative flex items-start">
              <div className={`hidden md:block flex-1 ${isLeft ? 'text-end pr-8' : 'text-start pl-8 order-3'}`}>
                <h3 className="font-heading text-lg font-semibold text-white dark:text-white text-gray-900">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>

              <div className="relative z-10 w-8 h-8 rounded-full bg-navy dark:bg-navy-light bg-gray-100 border-2 border-gold flex items-center justify-center flex-shrink-0
                md:absolute md:left-1/2 md:-translate-x-1/2">
                <div className="w-2 h-2 rounded-full bg-gold" />
              </div>

              <div className="flex-1 md:hidden pl-6">
                <span className="text-xs font-heading text-gold">{milestone.year}</span>
                <h3 className="font-heading text-base font-semibold text-white dark:text-white text-gray-900">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>

              <div className={`hidden md:block flex-1 ${isLeft ? 'pl-8 order-3' : 'pr-8'}`}>
                <span className="text-xs font-heading text-gold">{milestone.year}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
