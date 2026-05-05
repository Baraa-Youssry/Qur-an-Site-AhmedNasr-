import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getSurahsAdmin, createSurah, updateSurah, deleteSurah, uploadAudio, uploadVideo } from '../../services/api'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import { formatDuration, formatFileSize } from '../../utils/formatters'
import { FiUpload, FiEdit2, FiTrash2, FiVideo } from 'react-icons/fi'

const emptyForm = {
  number: '', name_ar: '', name_en: '', revelation: 'Makki', ayah_count: '', is_published: true,
}

export default function AdminSurahs() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)

  const { data: surahs = [], isLoading } = useQuery({
    queryKey: ['surahs-admin'],
    queryFn: getSurahsAdmin,
  })

  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadAudio(formData),
    onSuccess: () => toast.success('Audio uploaded'),
    onError: (err) => toast.error(err.response?.data?.error || 'Upload failed'),
  })

  const videoUploadMutation = useMutation({
    mutationFn: (formData) => uploadVideo(formData),
    onSuccess: () => toast.success('Video uploaded'),
    onError: (err) => toast.error(err.response?.data?.error || 'Video upload failed'),
  })

  const createMutation = useMutation({
    mutationFn: createSurah,
    onSuccess: () => { queryClient.invalidateQueries(['surahs-admin']); toast.success('Surah created'); closeModal() },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSurah(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['surahs-admin']); toast.success('Surah updated'); closeModal() },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSurah,
    onSuccess: () => { queryClient.invalidateQueries(['surahs-admin']); toast.success('Surah deleted') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const openCreate = () => { setForm(emptyForm); setFile(null); setVideoFile(null); setEditing(null); setModalOpen(true) }

  const openEdit = (surah) => {
    setForm({
      number: surah.number, name_ar: surah.name_ar, name_en: surah.name_en,
      revelation: surah.revelation, ayah_count: surah.ayah_count,
      is_published: surah.is_published, audio_url: surah.audio_url, audio_path: surah.audio_path,
      video_url: surah.video_url || '', video_path: surah.video_path || '',
    })
    setFile(null)
    setVideoFile(null)
    setEditing(surah)
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); setFile(null); setVideoFile(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let audio_url = form.audio_url || ''
    let audio_path = form.audio_path || ''
    let duration_sec = null
    let file_size_kb = null
    let video_url = form.video_url || ''
    let video_path = form.video_path || ''

    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('number', form.number)

      const uploadResult = await uploadMutation.mutateAsync(formData)
      audio_url = uploadResult.publicUrl
      audio_path = uploadResult.storagePath
      duration_sec = uploadResult.durationSec
      file_size_kb = uploadResult.fileSizeKb
    }

    if (videoFile) {
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('number', form.number)

      const videoResult = await videoUploadMutation.mutateAsync(formData)
      video_url = videoResult.publicUrl
      video_path = videoResult.storagePath
    }

    const payload = { ...form, audio_url, audio_path, duration_sec, file_size_kb, video_url, video_path }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  if (isLoading) return <Spinner size="lg" className="py-20" />

  return (
    <>
      <Helmet><title>{t('admin.surahs')} - Sacred Echoes</title></Helmet>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold text-white dark:text-white text-gray-900">
            {t('admin.surahs')}
          </h1>
          <Button onClick={openCreate}>
            <FiUpload className="w-4 h-4 inline mr-2" />
            {t('admin.upload')}
          </Button>
        </div>

        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 dark:border-white/5 border-gray-200">
                <th className="text-start p-3 text-gray-400 font-heading">#</th>
                <th className="text-start p-3 text-gray-400 font-heading">{t('admin.surahs')}</th>
                <th className="text-start p-3 text-gray-400 font-heading hidden md:table-cell">Type</th>
                <th className="text-start p-3 text-gray-400 font-heading hidden lg:table-cell">Duration</th>
                <th className="text-start p-3 text-gray-400 font-heading hidden lg:table-cell">Video</th>
                <th className="text-start p-3 text-gray-400 font-heading hidden lg:table-cell">Size</th>
                <th className="text-start p-3 text-gray-400 font-heading">Status</th>
                <th className="text-end p-3 text-gray-400 font-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {surahs.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="p-3 text-gray-300 dark:text-gray-300 text-gray-700">{s.number}</td>
                  <td className="p-3">
                    <p className="text-white dark:text-white text-gray-900 font-medium">{s.name_en}</p>
                    <p className="text-xs text-gray-500 font-arabic">{s.name_ar}</p>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.revelation === 'Makki' ? 'bg-emerald/10 text-emerald' : 'bg-blue-500/10 text-blue-400'}`}>
                      {s.revelation}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 hidden lg:table-cell">{formatDuration(s.duration_sec)}</td>
                  <td className="p-3 hidden lg:table-cell">
                    {s.video_url ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                        <FiVideo className="w-3 h-3 inline mr-1" />Video
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-400 hidden lg:table-cell">{formatFileSize(s.file_size_kb)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_published ? 'bg-emerald/10 text-emerald' : 'bg-gray-500/10 text-gray-500'}`}>
                      {s.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-navy/30 dark:hover:bg-white/5 text-gray-400 hover:text-gold transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm(t('admin.confirm_delete'))) deleteMutation.mutate(s.id) }} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {surahs.length === 0 && (
            <p className="text-center text-gray-500 py-8">No surahs yet. Upload your first one!</p>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? t('admin.edit') : t('admin.upload')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Number</label>
              <input type="number" min="1" max="114" value={form.number} onChange={(e) => setForm({ ...form, number: parseInt(e.target.value) })} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Ayah Count</label>
              <input type="number" value={form.ayah_count} onChange={(e) => setForm({ ...form, ayah_count: parseInt(e.target.value) })} required className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Name (Arabic)</label>
            <input type="text" dir="rtl" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} required className="input-field font-arabic" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Name (English)</label>
            <input type="text" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">Revelation</label>
            <select value={form.revelation} onChange={(e) => setForm({ ...form, revelation: e.target.value })} className="input-field">
              <option value="Makki">Makki</option>
              <option value="Madani">Madani</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">
              Audio File {editing && <span className="text-gray-500">(leave empty to keep current)</span>}
            </label>
            <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} className="input-field file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gold/10 file:text-gold" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 dark:text-gray-300 text-gray-700 mb-1">
              <FiVideo className="w-4 h-4 inline mr-1" />
              Video File MP4 {editing && <span className="text-gray-500">(leave empty to keep current)</span>}
            </label>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="input-field file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-500/10 file:text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded border-gray-600 text-gold focus:ring-gold" />
            <label htmlFor="is_published" className="text-sm text-gray-300 dark:text-gray-300 text-gray-700">Published</label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={uploadMutation.isPending || videoUploadMutation.isPending || createMutation.isPending || updateMutation.isPending}>
              {uploadMutation.isPending || videoUploadMutation.isPending ? 'Uploading...' : t('admin.save')}
            </Button>
            <Button variant="secondary" onClick={closeModal}>{t('admin.cancel')}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
