import axios from 'axios'

// Check if the backend host already includes /api
const baseURL = process.env.VUE_APP_BACKEND_HOST.includes('/api') 
  ? process.env.VUE_APP_BACKEND_HOST 
  : `${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/api`

const apiClient = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Add a request interceptor to add the auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('msal.idtoken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default {
  // Generic GET request
  get(url) {
    return apiClient.get(url)
  },
  
  // Generic POST request
  post(url, data) {
    return apiClient.post(url, data)
  },
  
  // Generic PUT request
  put(url, data) {
    return apiClient.put(url, data)
  },
  
  // Generic DELETE request
  delete(url) {
    return apiClient.delete(url)
  },
  
  // User related API calls
  getCurrentUser() {
    return apiClient.get('/users/me')
  },
  
  // Skill matrix API calls
  getSkillGroups() {
    return apiClient.get('/skill-groups')
  },
  
  getSkillCategories() {
    return apiClient.get('/skill-categories')
  },
  
  getSkills() {
    return apiClient.get('/skills')
  },
  
  getUserSkills(userId) {
    return apiClient.get(`/users/${userId}/skills`)
  },
  
  updateUserSkill(userId, skillId, data) {
    if (skillId) {
      return apiClient.put(`/users/${userId}/skills/${skillId}`, data)
    } else {
      return apiClient.put(`/users/${userId}/skills`, data)
    }
  }
} 