import axios from 'axios'

// Use the runtime config from window.env
const baseURL = (window.env?.API_URL || 'https://skill-matrix.ideaportriga.lv') + '/api';

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
      // Find the key that contains 'login.windows.net-idtoken'
      const idTokenKey = Object.keys(localStorage).find(
          key => key.includes('login.windows.net-idtoken')
      );

      if (idTokenKey) {
        try {
          const tokenObj = JSON.parse(localStorage.getItem(idTokenKey));
          const token = tokenObj?.secret;
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (err) {
          console.error('Failed to parse ID token from localStorage:', err);
        }
      }

      return config;
    },
    error => Promise.reject(error)
);

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