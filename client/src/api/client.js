import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fds_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fds_token')
      localStorage.removeItem('fds_user')
    }
    return Promise.reject(error)
  },
)

export default api

export const analyzeFeedback = (id) => api.post(`/feedback/${id}/analyze`)

export const analyzeAllFeedback = (force = false) =>
  api.post('/feedback/analyze', null, { params: force ? { force: 'true' } : undefined })

export const bulkUpdateFeedbackStatus = (ids, status) =>
  api.post('/feedback/bulk', { ids, status })
