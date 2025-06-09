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
   * Create a new skill group
   * @param {Object} group - The group object with name property
   * @returns {Promise} Promise with the response data
   */
  createSkillGroup(group) {
    return api.post('/skill-groups', group)
  },

  /**
   * Delete a skill group
   * @param {number} groupId - The group ID to delete
   * @returns {Promise} Promise with the response data
   */
  deleteSkillGroup(groupId) {
    return api.delete(`/skill-groups/${groupId}`)
  },

  /**
   * Update a skill group
   * @param {number} groupId - The group ID to update
   * @param {Object} group - The updated group object with name property
   * @returns {Promise} Promise with the response data
   */
  updateSkillGroup(groupId, group) {
    return api.put(`/skill-groups/${groupId}`, group)
  },

  /**
   * Get all skill categories
   * @param {Object} params - Optional query parameters like groupId
   * @returns {Promise} Promise with the response data
   */
  getSkillCategories(params = {}) {
    return api.get('/skill-categories', { params })
  },

  /**
   * Get all skill categories with details (including group info)
   * @returns {Promise} Promise with the response data
   */
  getSkillCategoryDetails() {
    return api.get('/skill-categories')
  },

  /**
   * Create a new skill category
   * @param {Object} category - The category object with name and groupId properties
   * @returns {Promise} Promise with the response data
   */
  createSkillCategory(category) {
    return api.post('/skill-categories', category)
  },

  /**
   * Create multiple skill categories in bulk
   * @param {Array} categories - Array of category objects with name and groupId properties
   * @returns {Promise} Promise with the response data
   */
  bulkCreateSkillCategories(categories) {
    return api.post('/skill-categories/bulk', { categories })
  },

  /**
   * Delete a skill category
   * @param {number} categoryId - The category ID to delete
   * @returns {Promise} Promise with the response data
   */
  deleteSkillCategory(categoryId) {
    return api.delete(`/skill-categories/${categoryId}`)
  },

  /**
   * Update a skill category
   * @param {number} categoryId - The category ID to update
   * @param {Object} category - The updated category object with name and groupId properties
   * @returns {Promise} Promise with the response data
   */
  updateSkillCategory(categoryId, category) {
    return api.put(`/skill-categories/${categoryId}`, category)
  },

  /**
   * Get all skills
   * @param {Object} params - Optional query parameters like categoryId or groupId
   * @returns {Promise} Promise with the response data
   */
  getSkills(params = {}) {
    return api.get('/skills', { params })
  },

  /**
   * Get all skills with details (including category and group info)
   * @returns {Promise} Promise with the response data
   */
  getSkillDetails() {
    return api.get('/skills')
  },

  /**
   * Create a new skill
   * @param {Object} skill - The skill object with name and category_id properties
   * @returns {Promise} Promise with the response data
   */
  createSkill(skill) {
    return api.post('/skills', skill)
  },

  /**
   * Create multiple skills in bulk
   * @param {Array} skills - Array of skill objects with name and categoryId properties
   * @returns {Promise} Promise with the response data
   */
  bulkCreateSkills(skills) {
    return api.post('/skills/bulk', { skills })
  },

  /**
   * Delete a skill
   * @param {number} skillId - The skill ID to delete
   * @returns {Promise} Promise with the response data
   */
  deleteSkill(skillId) {
    return api.delete(`/skills/${skillId}`)
  },

  /**
   * Update a skill
   * @param {number} skillId - The skill ID to update
   * @param {Object} skill - The updated skill object with name, category_id, and optional description
   * @returns {Promise} Promise with the response data
   */
  updateSkill(skillId, skill) {
    return api.put(`/skills/${skillId}`, skill)
  },

  /**
   * Search for skills by name, category, or group
   * @param {string} query - The search query
   * @returns {Promise} Promise with the response data
   */
  searchSkills(query) {
    return api.get('/skills/search', { params: { query }})
  },

  /**
   * Get user information by ID
   * @param {string} userId - The user ID
   * @returns {Promise} Promise with the response data
   */
  getUserInfo(userId) {
    return api.get('/persons')
      .then(response => {
        // Find the user in the response
        const user = response.data.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found');
        }
        return { data: user };
      });
  },

  getSpecificUserInfo(userId) {
    return api.get(`/persons/${userId}`);
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
      .then(response => {
        // Ensure we always return an array
        if (!response.data) {
          return { data: [] };
        }
        if (!Array.isArray(response.data)) {
          return { data: [] };
        }
        return response;
      })
      .catch(error => {
        console.error('Error fetching user skills:', error);
        throw error;
      });
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
   * @param {string} userId - The user ID
   * @param {Object} assessment - The assessment data with skills and notes
   * @returns {Promise} Promise with the response data
   */
  saveAssessment(userId, assessment) {
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
   * Get project details by ID
   * @param {number} projectId - The project ID
   * @returns {Promise} Promise with the response data
   */
  getProject(projectId) {
    return api.get(`/projects/${projectId}`)
  },

  /**
   * Create a new project
   * @param {Object} project - The project object with name property
   * @returns {Promise} Promise with the response data
   */
  createProject(project) {
    return api.post('/projects', project)
  },

  /**
   * Delete a project
   * @param {number} projectId - The project ID to delete
   * @returns {Promise} Promise with the response data
   */
  deleteProject(projectId) {
    return api.delete(`/projects/${projectId}`)
  },

  /**
   * Update a project
   * @param {number} projectId - The project ID to update
   * @param {Object} project - The updated project object with name and optional description
   * @returns {Promise} Promise with the response data
   */
  updateProject(projectId, project) {
    return api.put(`/projects/${projectId}`, project)
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
   * @param {number} projectId - The project ID
   * @param {number} skillId - The skill ID to add
   * @param {number} proficiency - The proficiency level (1=yes, 0=no)
   * @returns {Promise} Promise with the response data
   */
  addProjectSkill(projectId, skillId, proficiency = 1) {
    return api.post('/project-skill', { projectId, skillId, proficiency })
  },

  /**
   * Update a project's skill proficiency
   * @param {number} projectSkillId - The project_skill ID to update
   * @param {number} proficiency - The proficiency level (1=yes, 0=no)
   * @returns {Promise} Promise with the response data
   */
  updateProjectSkillProficiency(projectSkillId, proficiency) {
    return api.put(`/project-skill/${projectSkillId}`, { proficiency })
  },

  /**
   * Remove a skill from a project
   * @param {number} projectSkillId - The project_skill ID to remove
   * @returns {Promise} Promise with the response data
   */
  removeProjectSkill(projectSkillId) {
    return api.delete(`/project-skill/${projectSkillId}`)
  },

  /**
   * Assign a person to a project
   * @param {data} data - the data to be sent as post request
   * @returns {Promise} Promise with the response data
   */
  assignProjectMember(data) {
    return api.post('/project-member', data);
  },

  /**
   * Get all users assigned to a specific project
   * @param {string} projectId
   * @returns {Promise} Promise with the list of users assigned to the project
   */
  getProjectMembers(projectId) {
    return api.get(`/persons/by-project/${projectId}`);
  },

  /**
   * Get all users NOT assigned to a specific project
   * @param {string} projectId
   * @returns {Promise} Promise with the list of users not assigned to the project
   */
  getUsersNotInProject(projectId) {
    return api.get(`/persons/not-in-project/${projectId}`);
  },

  /**
   * Create or retrieve a person by email
   * If person does not exist, a new person will be created with just the email
   * @param {Object} data - { email: string }
   * @returns {Promise} Promise with the person object
   */
  createOrGetPersonByEmail(data) {
    return api.post('/persons/by-email', data);
  },

}