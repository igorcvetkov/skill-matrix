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
   * @param {number} proficiency - The proficiency level (1=yes, 0=no)
   * @returns {Promise} Promise with the response data
   */
  addUserSkill(userId = 'me', skillId, proficiency = 1) {
    return api.post('/person-skill', { personId: userId, skillId, proficiency })
  },

  /**
   * Update a user's skill proficiency
   * @param {number} personSkillId - The person_skill ID to update
   * @param {number} proficiency - The proficiency level (1=yes, 0=no)
   * @returns {Promise} Promise with the response data
   */
  updateUserSkillProficiency(personSkillId, proficiency) {
    return api.put(`/person-skill/${personSkillId}`, { proficiency })
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
    
    // Add skills with yes proficiency
    const skillsToAddWithYes = assessment.skillsToAddWithYes || []
    skillsToAddWithYes.forEach(skillId => {
      promises.push(this.addUserSkill(userId, skillId, 1))
    })
    
    // Add skills with no proficiency
    const skillsToAddWithNo = assessment.skillsToAddWithNo || []
    skillsToAddWithNo.forEach(skillId => {
      promises.push(this.addUserSkill(userId, skillId, 0))
    })
    
    // Update skills proficiency
    const skillsToUpdate = assessment.skillsToUpdate || []
    skillsToUpdate.forEach(({ id, proficiency }) => {
      promises.push(this.updateUserSkillProficiency(id, proficiency))
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
  },

  /**
   * Get all projects
   * @returns {Promise} Promise with the response data
   */
  getAllProjects() {
    return api.get('/projects')
  },

  /**
   * Get project information by ID
   * @param {string} projectId - The project ID
   * @returns {Promise} Promise with the response data
   */
  getProjectInfo(projectId) {
    return api.get(`/projects/${projectId}`)
  },

  /**
   * Get skills for a specific project
   * @param {string} projectId - The project ID
   * @returns {Promise} Promise with the response data
   */
  getProjectSkills(projectId) {
    return api.get(`/project-skill?projectId=${projectId}`)
  },

  /**
   * Add a skill to a project
   * @param {string} projectId - The project ID
   * @param {number} skillId - The skill ID to add
   * @returns {Promise} Promise with the response data
   */
  addProjectSkill(projectId, skillId) {
    return api.post('/project-skill', { projectId, skillId })
  },

  /**
   * Remove a skill from a project
   * @param {number} projectSkillId - The project_skill ID to remove
   * @returns {Promise} Promise with the response data
   */
  removeProjectSkill(projectSkillId) {
    return api.delete(`/project-skill/${projectSkillId}`)
  }
} 