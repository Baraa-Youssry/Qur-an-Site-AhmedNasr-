import { useTranslation } from 'react-i18next'

export default function ClipCard({ clip }) {
  const { t, i18n } = useTranslation()
  const title = i18n.language === 'ar' ? clip.title_ar : clip.title_en
  const description = i18n.language === 'ar' ? clip.description_ar : clip.description_en

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
        <iframe
          src={`https://www.youtube.com/embed/${clip.youtube_id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <h3 className="font-heading font-semibold text-white dark:text-white text-gray-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-400 dark:text-gray-400 text-gray-500 line-clamp-2">
          {description}
        </p>
      )}
    </div>
  )
}
