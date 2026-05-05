import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getAllClipsAdmin, createClip, updateClip, deleteClip, reorderClips } from '../../services/api'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi'

const emptyForm = { title_ar: '', title_en: '', description_ar: '', description_en: '', youtube_url: '', is_published: false }

export default function AdminClips() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ['clips-admin'],
    queryFn: getAllClipsAdmin,
  })

  const createMutation = useMutation({
    mutationFn: createClip,
    onSuccess: () => { queryClient.invalidateQueries(['clips-admin']); toast.success('Clip created'); closeModal() },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateClip(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['clips-admin']); toast.success('Clip updated'); closeModal() },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClip,
    onSuccess: () => { queryClient.invalidateQueries(['clips-admin']); toast.success('Clip deleted') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, data }) => updateClip(id, data),
    onSuccess: () => queryClient.invalidateQueries(['clips-admin']),
  })

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModalOpen(true) }
  const openEdit = (clip) => { setForm(clip); setEditing(clip); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const moveClip = (index, direction) => {
    const newOrder = clips.map((c, i) => ({ id: c.id, sort_order: i }))
    const target = index + direction
    if (target < 0 || target >= newOrder.length) return
    ;[newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]]
    reorderClips({ items: newOrder }).then(() => queryClient.invalidateQueries(['clips-admin']))
  }

  if (isLoading) return <Spinner size="lg" className="py-20" />

  return (
    <>
      <Helmet><title>{t('admin.clips')} - Sacred Echoes</title></Helmet>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold text-white dark:text-white text-gray-900">
            {t('admin.clips')}
          </h1>
          <Button onClick={openCreate}>
            <FiPlus className="w-4 h-4 inline mr-2" />
            Add Clip
          </Button>
        </div>

        <div className="space-y-3">
          {clips.map((clip, index) => (
            <div key={clip.id} className="glass-card flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveClip(index, -1)} className="p-1 text-gray-500 hover:text-gold disabled:opacity-20" disabled={index === 0}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => moveClip(index, 1)} className="p-1 text-gray-500 hover:text-gold disabled:opacity-20" disabled={index === clips.length - 1}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                <img
                  src={`https://img.youtube.com/vi/${clip.youtube_id}/mqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white dark:text-white text-gray-900 truncate">{clip.title_en}</p>
                <p className="text-xs text-gray-500 font-arabic truncate">{clip.title_ar}</p>
              </div>

              <button
                onClick={() => togglePublishMutation.mutate({ id: clip.id, data: { is_published: !clip.is_published } })}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                title={clip.is_published ? 'Unpublish' : 'Publish'}
              >
                {clip.is_published
                  ? <FiEye className="w-4 h-4 text-emerald" />
                  : <FiEyeOff className="w-4 h-4 text-gray-500" />
                }
              </button>

              <button onClick={() => openEdit(clip)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gold transition-colors">
                <FiEdit2 className="w-4 h-4" />
              </button>

              <button onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMutation.mutate(clip.id) }} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {clips.length === 0 && (
            <div className="text-center text-gray-500 py-12">No clips yet. Add your first one!</div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? t('admin.edit') : 'Add Clip'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">YouTube URL</label>
            <input type="url" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} required placeholder="https://youtube.com/watch?v=..." className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Title (Arabic)</label>
            <input type="text" dir="rtl" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} required className="input-field font-arabic" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Title (English)</label>
            <input type="text" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Description (Arabic)</label>
            <textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} rows={2} dir="rtl" className="input-field font-arabic" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Description (English)</label>
            <textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={2} className="input-field" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="clip_published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded border-gray-600 text-gold focus:ring-gold" />
            <label htmlFor="clip_published" className="text-sm text-gray-300 dark:text-gray-300 text-gray-700">Published</label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {t('admin.save')}
            </Button>
            <Button variant="secondary" onClick={closeModal}>{t('admin.cancel')}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
