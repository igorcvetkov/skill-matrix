import api from './api'

/**
 * Service for handling skill matrix API calls
 */
export default {
  /**
   * Get all skill groups
   * @returns {Promise} Promise with the response data
   */
  getSkillGroups() {
    return api.get('/skill-groups')
  },

  /**
   * Get all skill categories
   * @returns {Promise} Promise with the response data
   */
  getSkillCategories() {
    return api.get('/skill-categories')
  },

  /**
   * Get all skill categories with details (including group info)
   * @returns {Promise} Promise with the response data
   */
  getSkillCategoryDetails() {
    return api.get('/skill-categories')
  },

  /**
   * Get all skills
   * @returns {Promise} Promise with the response data
   */
  getSkills() {
    return api.get('/skills')
  },

  /**
   * Get all skills with details (including category and group info)
   * @returns {Promise} Promise with the response data
   */
  getSkillDetails() {
    return api.get('/skills')
  },

  /**
   * Get user information by ID
   * @param {string} userId - The user ID or 'me' for current user
   * @returns {Promise} Promise with the response data
   */
  getUserInfo(userId = 'me') {
    return api.get(`/users/${userId}`)
  },

  /**
   * Get all users in the system
   * This endpoint is intended for admin and project manager roles
   * @returns {Promise} Promise with the response data containing all users
   */
  getAllUsers() {
    return api.get('/persons')
  },

  /**
   * Get skills for a specific user
   * @param {string} userId - The user ID or 'me' for current user
   * @returns {Promise} Promise with the response data
   */
  getUserSkills(userId = 'me') {
    return api.get(`/person-skill?personId=${userId}`)
  },

  /**
   * Get detailed skills for a specific user
   * @param {string} userId - The user ID or 'me' for current user
   * @returns {Promise} Promise with the response data
   */
  getUserSkillDetails(userId = 'me') {
    return api.get(`/person-skill?personId=${userId}`)
  },

  /**
   * Add a skill to a user
   * @param {string} userId - The user ID or 'me' for current user
   * @param {number} skillId - The skill ID to add
   * @returns {Promise} Promise with the response data
   */
  addUserSkill(userId = 'me', skillId) {
    return api.post('/person-skill', { personId: userId, skillId })
  },

  /**
   * Remove a skill from a user
   * @param {string} userId - The user ID or 'me' for current user
   * @param {number} personSkillId - The person_skill ID to remove
   * @returns {Promise} Promise with the response data
   */
  removeUserSkill(personSkillId) {
    return api.delete(`/person-skill/${personSkillId}`)
  },

  /**
   * Save user skill assessment
   * @param {string} userId - The user ID or 'me' for current user
   * @param {Object} assessment - The assessment data with skills and notes
   * @returns {Promise} Promise with the response data
   */
  saveAssessment(userId = 'me', assessment) {
    // Process the assessment data to add/remove skills
    const promises = []
    
    // Add skills that are selected
    const skillsToAdd = assessment.skillsToAdd || []
    skillsToAdd.forEach(skillId => {
      promises.push(this.addUserSkill(userId, skillId))
    })
    
    // Remove skills that are deselected
    const skillsToRemove = assessment.skillsToRemove || []
    skillsToRemove.forEach(personSkillId => {
      promises.push(this.removeUserSkill(personSkillId))
    })
    
    // Return a promise that resolves when all operations are complete
    return Promise.all(promises)
      .then(() => ({ success: true }))
      .catch(error => {
        throw error
      })
  }
} 