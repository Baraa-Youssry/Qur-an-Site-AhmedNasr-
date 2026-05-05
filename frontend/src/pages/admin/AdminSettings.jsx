import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import {
  getSettings, updateSettings,
  getAllSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink,
  getAllMilestones, createMilestone, updateMilestone, deleteMilestone,
  uploadImage,
} from '../../services/api'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi'

const TABS = ['site', 'social', 'milestones']

export default function AdminSettings() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('site')

  const [siteForm, setSiteForm] = useState({})
  const [socialForm, setSocialForm] = useState({ platform: '', url: '' })
  const [editingSocial, setEditingSocial] = useState(null)
  const [socialModal, setSocialModal] = useState(false)
  const [milestoneForm, setMilestoneForm] = useState({ year: '', title_ar: '', title_en: '', description_ar: '', description_en: '' })
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [milestoneModal, setMilestoneModal] = useState(false)
  const [profileFile, setProfileFile] = useState(null)

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  })

  const { data: socialLinks = [], isLoading: socialLoading } = useQuery({
    queryKey: ['social-links-admin'],
    queryFn: getAllSocialLinks,
  })

  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ['milestones-admin'],
    queryFn: getAllMilestones,
  })

  useEffect(() => {
    if (settings) {
      setSiteForm({
        reciter_name_ar: settings.reciter_name_ar || '',
        reciter_name_en: settings.reciter_name_en || '',
        bio_ar: settings.bio_ar || '',
        bio_en: settings.bio_en || '',
        contact_email: settings.contact_email || '',
        profile_image_url: settings.profile_image_url || '',
      })
    }
  }, [settings])

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => { queryClient.invalidateQueries(['settings']); toast.success('Settings saved') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      setSiteForm((prev) => ({ ...prev, profile_image_url: data.publicUrl }))
      toast.success('Image uploaded')
    },
    onError: () => toast.error('Upload failed'),
  })

  const createSocialMutation = useMutation({
    mutationFn: createSocialLink,
    onSuccess: () => { queryClient.invalidateQueries(['social-links-admin']); toast.success('Link added'); setSocialModal(false) },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const updateSocialMutation = useMutation({
    mutationFn: ({ id, data }) => updateSocialLink(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['social-links-admin']); toast.success('Link updated'); setSocialModal(false) },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const deleteSocialMutation = useMutation({
    mutationFn: deleteSocialLink,
    onSuccess: () => { queryClient.invalidateQueries(['social-links-admin']); toast.success('Link deleted') },
    onError: () => toast.error('Failed'),
  })

  const createMilestoneMutation = useMutation({
    mutationFn: createMilestone,
    onSuccess: () => { queryClient.invalidateQueries(['milestones-admin']); toast.success('Milestone added'); setMilestoneModal(false) },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }) => updateMilestone(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['milestones-admin']); toast.success('Milestone updated'); setMilestoneModal(false) },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const deleteMilestoneMutation = useMutation({
    mutationFn: deleteMilestone,
    onSuccess: () => { queryClient.invalidateQueries(['milestones-admin']); toast.success('Milestone deleted') },
    onError: () => toast.error('Failed'),
  })

  const handleProfileUpload = async () => {
    if (!profileFile) return
    const formData = new FormData()
    formData.append('file', profileFile)
    await uploadImageMutation.mutateAsync(formData)
    setProfileFile(null)
  }

  const handleSiteSave = () => {
    updateSettingsMutation.mutate(siteForm)
  }

  const handleSocialSubmit = (e) => {
    e.preventDefault()
    if (editingSocial) {
      updateSocialMutation.mutate({ id: editingSocial.id, data: socialForm })
    } else {
      createSocialMutation.mutate(socialForm)
    }
    setSocialForm({ platform: '', url: '' })
    setEditingSocial(null)
  }

  const handleMilestoneSubmit = (e) => {
    e.preventDefault()
    if (editingMilestone) {
      updateMilestoneMutation.mutate({ id: editingMilestone.id, data: milestoneForm })
    } else {
      createMilestoneMutation.mutate(milestoneForm)
    }
    setMilestoneForm({ year: '', title_ar: '', title_en: '', description_ar: '', description_en: '' })
    setEditingMilestone(null)
  }

  if (settingsLoading) return <Spinner size="lg" className="py-20" />

  return (
    <>
      <Helmet><title>{t('admin.settings')} - Sacred Echoes</title></Helmet>

      <div>
        <h1 className="font-heading text-2xl font-bold text-white dark:text-white text-gray-900 mb-6">
          {t('admin.settings')}
        </h1>

        <div className="flex gap-1 mb-6 p-1 glass rounded-xl w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                tab === t ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'site' && (
          <div className="space-y-6">
            <div className="glass-card">
              <h3 className="font-heading text-lg font-semibold text-gold mb-4">Site Info</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Reciter Name (Arabic)</label>
                    <input type="text" dir="rtl" value={siteForm.reciter_name_ar || ''} onChange={(e) => setSiteForm({ ...siteForm, reciter_name_ar: e.target.value })} className="input-field font-arabic" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Reciter Name (English)</label>
                    <input type="text" value={siteForm.reciter_name_en || ''} onChange={(e) => setSiteForm({ ...siteForm, reciter_name_en: e.target.value })} className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Bio (Arabic)</label>
                    <textarea value={siteForm.bio_ar || ''} onChange={(e) => setSiteForm({ ...siteForm, bio_ar: e.target.value })} rows={4} dir="rtl" className="input-field font-arabic" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Bio (English)</label>
                    <textarea value={siteForm.bio_en || ''} onChange={(e) => setSiteForm({ ...siteForm, bio_en: e.target.value })} rows={4} className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Contact Email</label>
                  <input type="email" value={siteForm.contact_email || ''} onChange={(e) => setSiteForm({ ...siteForm, contact_email: e.target.value })} className="input-field max-w-md" />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {siteForm.profile_image_url ? (
                      <img src={siteForm.profile_image_url} alt="Profile" className="w-20 h-20 rounded-xl object-cover border border-gold/30" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center text-gray-500">No image</div>
                    )}
                    <div>
                      <input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files[0])} className="input-field file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gold/10 file:text-gold max-w-xs" />
                      {profileFile && (
                        <Button onClick={handleProfileUpload} disabled={uploadImageMutation.isPending} className="mt-2 text-sm">
                          <FiUpload className="w-3 h-3 inline mr-1" />
                          {uploadImageMutation.isPending ? 'Uploading...' : 'Upload'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Button onClick={handleSiteSave} disabled={updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending ? t('common.loading') : t('admin.save')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === 'social' && (
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-gold">Social Links</h3>
              <Button onClick={() => { setSocialForm({ platform: '', url: '' }); setEditingSocial(null); setSocialModal(true) }} className="text-sm">
                <FiPlus className="w-3 h-3 inline mr-1" /> Add
              </Button>
            </div>
            {socialLoading ? (
              <Spinner />
            ) : (
              <div className="space-y-2">
                {socialLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors">
                    <div>
                      <p className="font-medium text-white dark:text-white text-gray-900 capitalize">{link.platform}</p>
                      <p className="text-sm text-gray-500 truncate max-w-md">{link.url}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setSocialForm({ platform: link.platform, url: link.url }); setEditingSocial(link); setSocialModal(true) }} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gold transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteSocialMutation.mutate(link.id) }} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {socialLinks.length === 0 && <p className="text-gray-500 text-center py-4">No social links yet</p>}
              </div>
            )}
          </div>
        )}

        {tab === 'milestones' && (
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-gold">Milestones</h3>
              <Button onClick={() => { setMilestoneForm({ year: '', title_ar: '', title_en: '', description_ar: '', description_en: '' }); setEditingMilestone(null); setMilestoneModal(true) }} className="text-sm">
                <FiPlus className="w-3 h-3 inline mr-1" /> Add
              </Button>
            </div>
            {milestonesLoading ? (
              <Spinner />
            ) : (
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors">
                    <div>
                      <p className="font-medium text-white dark:text-white text-gray-900">
                        <span className="text-gold text-sm mr-2">{m.year}</span>
                        {m.title_en}
                      </p>
                      <p className="text-xs text-gray-500 font-arabic">{m.title_ar}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setMilestoneForm({ year: m.year, title_ar: m.title_ar, title_en: m.title_en, description_ar: m.description_ar, description_en: m.description_en }); setEditingMilestone(m); setMilestoneModal(true) }} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gold transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMilestoneMutation.mutate(m.id) }} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && <p className="text-gray-500 text-center py-4">No milestones yet</p>}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={socialModal} onClose={() => setSocialModal(false)} title={editingSocial ? 'Edit Link' : 'Add Link'}>
        <form onSubmit={handleSocialSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Platform</label>
            <select value={socialForm.platform} onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })} required className="input-field">
              <option value="">Select platform</option>
              {['youtube', 'instagram', 'facebook', 'twitter', 'tiktok', 'telegram', 'spotify'].map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">URL</label>
            <input type="url" value={socialForm.url} onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })} required className="input-field" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{t('admin.save')}</Button>
            <Button variant="secondary" onClick={() => setSocialModal(false)}>{t('admin.cancel')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={milestoneModal} onClose={() => setMilestoneModal(false)} title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}>
        <form onSubmit={handleMilestoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Year</label>
            <input type="text" value={milestoneForm.year} onChange={(e) => setMilestoneForm({ ...milestoneForm, year: e.target.value })} required placeholder="2010" className="input-field max-w-32" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Title (Arabic)</label>
            <input type="text" dir="rtl" value={milestoneForm.title_ar} onChange={(e) => setMilestoneForm({ ...milestoneForm, title_ar: e.target.value })} required className="input-field font-arabic" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Title (English)</label>
            <input type="text" value={milestoneForm.title_en} onChange={(e) => setMilestoneForm({ ...milestoneForm, title_en: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Description (Arabic)</label>
            <textarea value={milestoneForm.description_ar} onChange={(e) => setMilestoneForm({ ...milestoneForm, description_ar: e.target.value })} rows={2} dir="rtl" className="input-field font-arabic" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Description (English)</label>
            <textarea value={milestoneForm.description_en} onChange={(e) => setMilestoneForm({ ...milestoneForm, description_en: e.target.value })} rows={2} className="input-field" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{t('admin.save')}</Button>
            <Button variant="secondary" onClick={() => setMilestoneModal(false)}>{t('admin.cancel')}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
