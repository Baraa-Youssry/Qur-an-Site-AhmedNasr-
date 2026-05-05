import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getSettings, getSocialLinks } from '../services/api'
import GlassCard from '../components/ui/GlassCard'
import Spinner from '../components/ui/Spinner'
import { FaYoutube, FaInstagram, FaFacebook, FaTwitter, FaTiktok, FaTelegram } from 'react-icons/fa'
import { HiMail, HiExternalLink } from 'react-icons/hi'

const platformIcons = {
  youtube: FaYoutube,
  instagram: FaInstagram,
  facebook: FaFacebook,
  twitter: FaTwitter,
  tiktok: FaTiktok,
  telegram: FaTelegram,
}

const platformColors = {
  youtube: 'from-red-500 to-red-600',
  instagram: 'from-purple-500 to-pink-500',
  facebook: 'from-blue-500 to-blue-600',
  twitter: 'from-sky-400 to-sky-500',
  tiktok: 'from-gray-800 to-gray-900',
  telegram: 'from-blue-400 to-blue-500',
}

export default function ContactPage() {
  const { t, i18n } = useTranslation()

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000,
  })

  const { data: socialLinks = [], isLoading } = useQuery({
    queryKey: ['social-links'],
    queryFn: getSocialLinks,
    staleTime: 10 * 60 * 1000,
  })

  const contactEmail = settings?.contact_email

  return (
    <>
      <Helmet>
        <title>{t('contact.title')} - Ahmed Abdelrazek Nasr</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-arabic text-3xl md:text-4xl font-bold text-gradient mb-2">
            {t('contact.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 text-gray-500">
            {t('contact.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialLinks.map((link) => {
              const Icon = platformIcons[link.platform?.toLowerCase()] || HiExternalLink
              const gradient = platformColors[link.platform?.toLowerCase()] || 'from-gold to-emerald'

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card group flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-semibold text-white dark:text-white text-gray-900 capitalize">
                      {link.platform}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-400 text-gray-500 truncate">
                      {link.url}
                    </p>
                  </div>
                  <HiExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gold transition-colors" />
                </a>
              )
            })}

            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="glass-card group flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-emerald flex items-center justify-center flex-shrink-0">
                  <HiMail className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-semibold text-white dark:text-white text-gray-900">
                    {t('contact.email_us')}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-400 text-gray-500 truncate">
                    {contactEmail}
                  </p>
                </div>
                <HiExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gold transition-colors" />
              </a>
            )}
          </div>
        )}
      </div>
    </>
  )
}
