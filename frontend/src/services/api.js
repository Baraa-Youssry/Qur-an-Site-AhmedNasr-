import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export const getSurahs = () => api.get('/surahs')
export const getSurah = (id) => api.get(`/surahs/${id}`)
export const getSurahsAdmin = () => api.get('/surahs/admin/all')
export const getStorageStats = () => api.get('/surahs/stats')
export const uploadAudio = (formData) =>
  api.post('/admin/upload/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  })
export const uploadVideo = (formData) =>
  api.post('/admin/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  })
export const uploadImage = (formData) =>
  api.post('/admin/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
export const createSurah = (data) => api.post('/surahs', data)
export const updateSurah = (id, data) => api.put(`/surahs/${id}`, data)
export const deleteSurah = (id) => api.delete(`/surahs/${id}`)

export const getClips = () => api.get('/clips')
export const getAllClipsAdmin = () => api.get('/clips/admin/all')
export const createClip = (data) => api.post('/clips', data)
export const updateClip = (id, data) => api.put(`/clips/${id}`, data)
export const reorderClips = (data) => api.put('/clips/reorder', data)
export const deleteClip = (id) => api.delete(`/clips/${id}`)

export const getSettings = () => api.get('/settings')
export const updateSettings = (data) => api.put('/settings', data)
export const getSocialLinks = () => api.get('/settings/social-links')
export const getAllSocialLinks = () => api.get('/settings/social-links/admin/all')
export const createSocialLink = (data) => api.post('/settings/social-links', data)
export const updateSocialLink = (id, data) => api.put(`/settings/social-links/${id}`, data)
export const deleteSocialLink = (id) => api.delete(`/settings/social-links/${id}`)

export const getMilestones = () => api.get('/settings/milestones')
export const getAllMilestones = () => api.get('/settings/milestones/admin/all')
export const createMilestone = (data) => api.post('/settings/milestones', data)
export const updateMilestone = (id, data) => api.put(`/settings/milestones/${id}`, data)
export const deleteMilestone = (id) => api.delete(`/settings/milestones/${id}`)

export const login = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')
export const forgotPassword = (data) => api.post('/auth/forgot-password', data)
export const resetPassword = (data) => api.post('/auth/reset-password', data)

export default api
