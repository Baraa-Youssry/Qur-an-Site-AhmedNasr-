import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { azkarCategories } from '../data/azkar'
import { HiCheck } from 'react-icons/hi'

export default function AzkarPage() {
  const { t, i18n } = useTranslation()
  const [activeCategory, setActiveCategory] = useState(azkarCategories[0].id)
  const [counters, setCounters] = useState({})
  const [completed, setCompleted] = useState({})

  const category = azkarCategories.find((c) => c.id === activeCategory)

  const handleTap = useCallback((dhikrId, repeat) => {
    setCounters((prev) => {
      const current = prev[dhikrId] || 0
      const next = current + 1
      if (next >= repeat) {
        setCompleted((c) => ({ ...c, [dhikrId]: true }))
        return { ...prev, [dhikrId]: repeat }
      }
      return { ...prev, [dhikrId]: next }
    })
  }, [])

  const handleResetCategory = () => {
    setCounters((prev) => {
      const next = { ...prev }
      category.azkar.forEach((d) => delete next[d.id])
      return next
    })
    setCompleted((prev) => {
      const next = { ...prev }
      category.azkar.forEach((d) => delete next[d.id])
      return next
    })
  }

  return (
    <>
      <Helmet>
        <title>{t('azkar.title')}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="font-arabic text-3xl md:text-4xl font-bold text-gradient mb-2">
            {t('azkar.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 text-gray-500">
            {t('azkar.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {azkarCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                handleResetCategory()
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'bg-navy/30 dark:bg-white/5 text-gray-400 dark:text-gray-400 hover:text-gold border border-white/5 dark:border-white/5'
              }`}
            >
              <span className="ms-1">{cat.icon}</span>
              {i18n.language === 'ar' ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleResetCategory}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gold bg-navy/30 dark:bg-white/5 border border-white/5 dark:border-white/5 transition-all"
          >
            {t('azkar.reset_category')}
          </button>
        </div>

        <div className="space-y-4">
          {category.azkar.map((dhikr) => {
            const count = counters[dhikr.id] || 0
            const isDone = completed[dhikr.id]
            const progress = dhikr.repeat > 1 ? count / dhikr.repeat : 1

            return (
              <div
                key={dhikr.id}
                onClick={() => !isDone && dhikr.repeat > 1 && handleTap(dhikr.id, dhikr.repeat)}
                className={`glass-card p-5 transition-all duration-300 ${
                  isDone ? 'opacity-50' : 'cursor-pointer hover:border-gold/20'
                } ${dhikr.repeat > 1 ? 'select-none' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {dhikr.repeat > 1 && (
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                        isDone
                          ? 'bg-emerald/20 text-emerald border border-emerald/30'
                          : 'bg-gold/10 text-gold border border-gold/20'
                      }`}
                    >
                      {isDone ? <HiCheck className="w-6 h-6" /> : `${count}/${dhikr.repeat}`}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-arabic text-xl md:text-2xl leading-loose text-white dark:text-white text-gray-900 mb-3">
                      {dhikr.text_ar}
                    </p>

                    {i18n.language === 'en' && (
                      <p className="text-gray-400 dark:text-gray-400 text-gray-500 text-sm leading-relaxed mb-3">
                        {dhikr.text_en}
                      </p>
                    )}

                    {dhikr.repeat > 1 && (
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDone ? 'bg-emerald' : 'bg-gold'
                          }`}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {dhikr.reference}
                      </span>
                      {isDone && (
                        <span className="text-xs text-emerald font-medium">
                          {t('azkar.completed')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
