<template>
  <div class="skill-matrix">
    <!-- Introduction Card - only show for own assessment -->
    <v-row v-if="!assessmentStarted && isOwnAssessment">
      <v-col cols="12">
        <introduction-card
          :loading="loading"
          :error="error"
          :user-name="userName"
          @start="startAssessment"
        />
      </v-col>
    </v-row>
    
    <!-- Loading indicator while data is being fetched -->
    <v-row v-if="loading && !isOwnAssessment">
      <v-col cols="12" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="mt-4 text-body-1">Loading assessment data...</div>
      </v-col>
    </v-row>
    
    <!-- Error message -->
    <v-row v-if="error && !assessmentStarted">
      <v-col cols="12">
        <v-alert
          type="error"
          dismissible
          class="mb-4"
        >
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>
    
    <!-- Assessment Path -->
    <v-row v-if="assessmentStarted && !showSummary">
      <v-col cols="12">
        <assessment-path
          :skill-groups="skillGroups"
          :skill-categories="skillCategories"
          :current-group-index="currentGroupIndex" 
          :current-category-index="currentCategoryIndex"
          :skill-responses="skillResponses"
          :category-notes="categoryNotes"
          :total-skills="totalSkills"
          :answered-skills="answeredSkills"
          :progress-percentage="progressPercentage"
          :saving="saving"
          :userId="userId"
          :isOwnAssessment="isOwnAssessment"
          @update:current-group-index="handleStepperUpdate"
          @update:current-category-index="handleCategoryUpdate"
          @update-skill="handleSkillUpdate"
          @update-notes="handleNotesUpdate"
          @finish="finishAssessment"
        />
      </v-col>
    </v-row>
    
    <!-- Summary View -->
    <v-row v-if="assessmentStarted && showSummary">
      <v-col cols="12">
        <skill-summary 
          :categories="skillCategories" 
          :skill-groups="skillGroups"
          :user-skills="userSkills"
          :selected-skills="selectedSkills"
        ></skill-summary>
        
        <div class="d-flex justify-center mt-6">
          <v-btn
            color="secondary"
            variant="outlined"
            class="mr-2"
            prepend-icon="mdi-arrow-left"
            @click="resetAssessment"
          >
            Back to Assessment
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            @click="saveAssessment"
            :loading="saving"
          >
            Save Assessment
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import SkillSummary from './SkillSummary.vue'
import IntroductionCard from './IntroductionCard.vue'
import AssessmentPath from './AssessmentPath.vue'
// Import will be used when connecting to the backend
import skillMatrixApi from '@/services/skillMatrixApi'
import { mapGetters } from 'vuex'

export default {
  name: 'SkillMatrix',
  components: {
    SkillSummary,
    IntroductionCard,
    AssessmentPath
  },
  props: {
    targetUserId: {
      type: String,
      default: null
    },
    targetProjectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      saving: false,
      error: null,
      userName: null,
      userId: null,
      skillGroups: [],
      skillCategories: [],
      userSkills: {},
      userSkillsMap: {}, // Maps skill_id to person_skill record
      skillResponses: {},
      categoryNotes: {},
      totalSkills: 0,
      answeredSkills: 0,
      showSummary: false,
      assessmentStarted: false,
      currentGroupIndex: 0,
      currentCategoryIndex: 0,
      
      // Arrays to track changes for save operations
      skillsToAdd: [],
      skillsToRemove: [],
      skillsToUpdate: []
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userRoles', 'hasRole']),
    isDevelopment() {
      return process.env.NODE_ENV === 'development'
    },
    assessmentType() {
      if (this.targetProjectId) {
        return 'project';
      } else if (this.targetUserId && !this.isOwnAssessment) {
        return 'team';
      } else {
        return 'self';
      }
    },
    progressPercentage() {
      if (this.totalSkills === 0) return 0
      return (this.answeredSkills / this.totalSkills) * 100
    },
    // Get categories for the current group
    currentGroupCategories() {
      if (!this.skillGroups[this.currentGroupIndex]) return []
      return this.skillCategories.filter(category => 
        category.group_id === this.skillGroups[this.currentGroupIndex].id
      )
    },
    // Get the current category
    currentCategory() {
      return this.currentGroupCategories[this.currentCategoryIndex] || {}
    },
    // Check if we're at the last category in the last group
    isLastCategoryInLastGroup() {
      return this.currentGroupIndex === this.skillGroups.length - 1 && 
             this.currentCategoryIndex === this.currentGroupCategories.length - 1
    },
    // Get the current group
    currentGroup() {
      return this.skillGroups[this.currentGroupIndex] || {}
    },
    allSkills() {
      const skills = []
      this.skillCategories.forEach(category => {
        category.skills.forEach(skill => {
          skills.push({
            ...skill,
            category_name: category.name,
            group_name: category.group_name
          })
        })
      })
      return skills
    },
    selectedSkills() {
      return this.allSkills.filter(skill => this.userSkills[skill.id])
    },
    // Determine if viewing own assessment or someone else's
    isOwnAssessment() {
      // If targetUserId or targetProjectId provided, this is not own assessment
      if (this.targetUserId || this.targetProjectId) return false;
      
      // For backward compatibility, also check if target user ID matches current user ID
      return !this.targetUserId || (this.currentUser && this.targetUserId === this.currentUser.id);
    }
  },
  watch: {
    // Watch for changes in targetUserId
    targetUserId: {
      immediate: true,
      handler(newValue, oldValue) {
        // Only reload if the value actually changed
        if (newValue !== oldValue && newValue) {
          this.resetState();
          this.loadSkillData();
          this.loadUserInfo();
          this.loadUserSkills();
          
          // Auto-start assessment when viewing another user's assessment
          if (!this.isOwnAssessment) {
            this.$nextTick(() => {
              if (!this.loading && !this.assessmentStarted) {
                this.startAssessment();
              }
            });
          }
        }
      }
    },
    
    // Watch for changes in targetProjectId
    targetProjectId: {
      immediate: true,
      handler(newValue, oldValue) {
        // Only reload if the value actually changed
        if (newValue !== oldValue && newValue) {
          this.resetState();
          this.loadSkillData();
          this.loadUserInfo();
          this.loadProjectSkills();
          
          // Auto-start assessment for project
          this.$nextTick(() => {
            if (!this.loading && !this.assessmentStarted) {
              this.startAssessment();
            }
          });
        }
      }
    },
    
    // Auto-start assessment when data is loaded
    loading(newValue) {
      if (!newValue && !this.assessmentStarted) {
        if ((this.targetUserId && !this.isOwnAssessment) || this.targetProjectId) {
          this.startAssessment();
        }
      }
    },
    
    // This ensures that if currentGroupIndex changes through other methods,
    // the stepper will stay in sync
    currentGroupIndex() {}
  },
  created() {
    this.loadSkillData()
    this.loadUserInfo()
    
    // Load appropriate skills based on context
    if (this.targetProjectId) {
      this.loadProjectSkills()
    } else {
      this.loadUserSkills()
    }
  },
  methods: {
    async loadSkillData() {
      this.loading = true
      this.error = null
      
      try {
        // Load skill groups
        const groupsResponse = await skillMatrixApi.getSkillGroups()
        this.skillGroups = groupsResponse.data || []
        
        // Create a map of groups by ID for easier access
        const groupsById = {}
        this.skillGroups.forEach(group => {
          groupsById[group.id] = group
        })
        
        // Load skill categories with details
        const categoriesResponse = await skillMatrixApi.getSkillCategoryDetails()
        const categories = categoriesResponse.data || []
        
        // Create a map of categories by ID for easier access
        const categoriesById = {}
        categories.forEach(category => {
          // Add group_name to category
          const group = groupsById[category.group_id]
          categoriesById[category.id] = {
            ...category,
            group_name: group ? group.name : 'Unknown Group',
            skills: []
          }
        })
        
        // Load skills with details
        const skillsResponse = await skillMatrixApi.getSkillDetails()
        const skills = skillsResponse.data || []
        
        // Organize skills by category
        skills.forEach(skill => {
          // Transform the skill object to match the expected format
          const transformedSkill = {
            id: skill.id,
            name: skill.skill_name,
            category_id: skill.category_id,
            description: skill.description || null
          }
          
          if (categoriesById[skill.category_id]) {
            categoriesById[skill.category_id].skills.push(transformedSkill)
          }
        })
        
        // Transform the data for the UI
        this.skillCategories = Object.values(categoriesById)
        
        // Calculate total skills
        this.totalSkills = this.skillCategories.reduce((total, category) => {
          return total + category.skills.length
        }, 0)
        
        this.loading = false
      } catch (error) {
        this.error = 'Failed to load skill data: ' + (error.response?.data?.error || error.message)
        this.loading = false
      }
    },
    
    async loadUserInfo() {
      try {
        // Use the current user from the Vuex store
        if (this.currentUser) {
          this.userName = this.currentUser.name || 'User';
          this.userId = this.targetUserId || this.currentUser.id;
        } else {
          this.userName = 'User';
          this.userId = null;
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        this.userName = 'User';
      }
    },
    
    async loadUserSkills() {
      this.loading = true;
      this.error = null;
      
      try {
        // Determine whose skills to load
        const targetId = this.targetUserId || (this.currentUser ? this.currentUser.id : null);
        
        // Load user skills - adjust API call if needed to support other users
        const response = await skillMatrixApi.getUserSkillDetails(targetId);
        const userSkills = response.data || [];
        
        // Create a map of user skills by skill_id
        this.userSkillsMap = {};
        this.userSkills = {};
        this.skillResponses = {};
        
        userSkills.forEach(personSkill => {
          // The API returns person_skill records with a skill_id property
          const skillId = personSkill.skill_id;
          const proficiency = personSkill.proficiency;
          
          this.userSkillsMap[skillId] = personSkill;
          
          // Set response based on proficiency
          if (proficiency === 1 || proficiency === true) {
            this.skillResponses[skillId] = 'yes';
            this.userSkills[skillId] = true;
          } else if (proficiency === 0 || proficiency === false) {
            this.skillResponses[skillId] = 'no';
            this.userSkills[skillId] = false;
          } else {
            // Default to "yes" for any other value, for backward compatibility
            this.skillResponses[skillId] = 'yes';
            this.userSkills[skillId] = true;
          }
        });
        
        // Initialize all skills that don't have a response to null (not answered)
        this.skillCategories.forEach(category => {
          if (category.skills) {
            category.skills.forEach(skill => {
              if (this.skillResponses[skill.id] === undefined) {
                this.skillResponses[skill.id] = null;
              }
            });
          }
        });
        
        // Calculate answered skills count
        this.answeredSkills = Object.values(this.skillResponses).filter(v => v !== null).length;
        
        this.loading = false;
      } catch (error) {
        this.error = 'Failed to load user skills: ' + (error.response?.data?.error || error.message);
        this.loading = false;
      }
    },
    
    async loadProjectSkills() {
      this.loading = true;
      this.error = null;
      
      try {
        // Load project skills
        const response = await skillMatrixApi.getProjectSkills(this.targetProjectId);
        const projectSkills = response.data || [];
        
        // Create a map of project skills by skill_id
        this.userSkillsMap = {};
        this.userSkills = {};
        this.skillResponses = {};
        
        projectSkills.forEach(projectSkill => {
          const skillId = projectSkill.skill_id;
          
          this.userSkillsMap[skillId] = projectSkill;
          
          // For projects, we just mark skills as included (true) or not
          this.skillResponses[skillId] = 'yes';
          this.userSkills[skillId] = true;
        });
        
        // Initialize all skills that don't have a response to null (not answered)
        this.skillCategories.forEach(category => {
          if (category.skills) {
            category.skills.forEach(skill => {
              if (this.skillResponses[skill.id] === undefined) {
                this.skillResponses[skill.id] = null;
              }
            });
          }
        });
        
        // Calculate answered skills count
        this.answeredSkills = Object.values(this.skillResponses).filter(v => v !== null).length;
        
        this.loading = false;
      } catch (error) {
        this.error = 'Failed to load project skills: ' + (error.response?.data?.error || error.message);
        this.loading = false;
      }
    },
    
    startAssessment() {
      this.assessmentStarted = true
      // Initialize the assessment state
      this.currentGroupIndex = 0
      this.currentCategoryIndex = 0
      this.showSummary = false
      
      // Handle the case where the current category has no skills
      this.handleEmptyCategory()
    },
    
    resetAssessment() {
      this.showSummary = false
      this.currentGroupIndex = 0
      this.currentCategoryIndex = 0
      
      // Reset responses
      Object.keys(this.skillResponses).forEach(skillId => {
        this.skillResponses[skillId] = null
      })
      
      // Reset user skills
      Object.keys(this.userSkills).forEach(skillId => {
        this.userSkills[skillId] = false
      })
      
      // Reset answered skills count
      this.answeredSkills = 0
    },
    
    updateSkillResponse(skillId, response) {
      // If this is the first response for this skill, increment the answered count
      if (this.skillResponses[skillId] === undefined || this.skillResponses[skillId] === null) {
        this.answeredSkills++
      }
      
      // Update the response
      this.skillResponses[skillId] = response
      
      // Update the user skills object (used for the summary)
      this.userSkills[skillId] = response === 'yes'
    },
    
    goToGroup(index) {
      if (index >= 0 && index < this.skillGroups.length) {
        this.currentGroupIndex = index
        this.currentCategoryIndex = 0 // Reset to the first category in the selected group
        
        // Handle the case where the current category has no skills
        this.handleEmptyCategory()
      }
    },
    
    finishAssessment() {
      this.showSummary = true
    },
    
    async saveAssessment() {
      this.saving = true
      this.error = null
      
      try {
        // Check if we're handling project skills or user skills
        if (this.targetProjectId) {
          // Project skills handling
          const skillsToAdd = []
          const skillsToRemove = []
          
          // Process skills for saving
          Object.entries(this.skillResponses).forEach(([skillId, response]) => {
            skillId = parseInt(skillId)
            
            // Skip skills that haven't been answered
            if (response === null || response === undefined) return
            
            const hasRecord = !!this.userSkillsMap[skillId]
            const shouldInclude = response === 'yes'
            
            if (hasRecord && !shouldInclude) {
              // Remove skill from project
              skillsToRemove.push(this.userSkillsMap[skillId].id)
            } else if (!hasRecord && shouldInclude) {
              // Add skill to project
              skillsToAdd.push(skillId)
            }
          })
          
          // Save changes to project skills
          const promises = []
          
          // Add new skills to project
          skillsToAdd.forEach(skillId => {
            promises.push(skillMatrixApi.addProjectSkill(this.targetProjectId, skillId))
          })
          
          // Remove skills from project
          skillsToRemove.forEach(projectSkillId => {
            promises.push(skillMatrixApi.removeProjectSkill(projectSkillId))
          })
          
          await Promise.all(promises)
          
          // Reload project skills to get updated data
          await this.loadProjectSkills()
        } else {
          // User skills handling (existing code)
          const skillsToAddWithYes = []
          const skillsToAddWithNo = []
          const skillsToUpdate = []
          const skillsToRemove = []
          
          // Process skills for saving
          Object.entries(this.skillResponses).forEach(([skillId, response]) => {
            skillId = parseInt(skillId)
            
            // Skip skills that haven't been answered
            if (response === null || response === undefined) return
            
            const hasRecord = !!this.userSkillsMap[skillId]
            const proficiency = response === 'yes' ? 1 : 0
            
            if (hasRecord) {
              const existingProficiency = this.userSkillsMap[skillId].proficiency
              
              // If proficiency changed, update the record
              if (existingProficiency !== proficiency) {
                // For simplicity, remove and re-add with new proficiency
                skillsToRemove.push(this.userSkillsMap[skillId].id)
                
                if (proficiency === 1) {
                  skillsToAddWithYes.push(skillId)
                } else {
                  skillsToAddWithNo.push(skillId)
                }
              }
            } else {
              // Add new record with appropriate proficiency
              if (proficiency === 1) {
                skillsToAddWithYes.push(skillId)
              } else {
                skillsToAddWithNo.push(skillId)
              }
            }
          })
          
          // Determine userId to save assessment for
          const targetId = this.targetUserId || 'me';
          
          // Save the assessment
          await skillMatrixApi.saveAssessment(targetId, {
            skillsToAddWithYes,
            skillsToAddWithNo,
            skillsToUpdate,
            skillsToRemove,
            notes: this.categoryNotes
          })
          
          // Reload user skills to get updated data
          await this.loadUserSkills()
        }
        
        // Show success message
        this.error = null
        
        // Scroll to summary
        setTimeout(() => {
          const summaryElement = document.querySelector('.skill-summary')
          if (summaryElement) {
            summaryElement.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      } catch (error) {
        this.error = 'Failed to save assessment: ' + (error.response?.data?.error || error.message)
      } finally {
        this.saving = false
      }
    },
    
    // Check if the current category has skills
    hasSkills() {
      return this.currentCategory && 
             this.currentCategory.skills && 
             this.currentCategory.skills.length > 0
    },
    
    // Handle empty categories by moving to the next one with skills
    handleEmptyCategory() {
      // If current category has no skills, try to find the next category with skills
      if (!this.hasSkills() && this.currentGroupCategories.length > 0) {
        // Try to find a category with skills in the current group
        const categoryWithSkills = this.currentGroupCategories.findIndex(category => 
          category.skills && category.skills.length > 0
        )
        
        if (categoryWithSkills >= 0) {
          this.currentCategoryIndex = categoryWithSkills
        } else {
          // If no category has skills in this group, try the next group
          this.goToNextGroupWithSkills()
        }
      }
    },
    
    // Find the next group that has categories with skills
    goToNextGroupWithSkills() {
      for (let i = this.currentGroupIndex + 1; i < this.skillGroups.length; i++) {
        const groupCategories = this.skillCategories.filter(category => 
          category.group_id === this.skillGroups[i].id
        )
        
        // Check if any category in this group has skills
        const hasSkills = groupCategories.some(category => 
          category.skills && category.skills.length > 0
        )
        
        if (hasSkills) {
          this.currentGroupIndex = i
          // Find the first category with skills
          const categoryIndex = groupCategories.findIndex(category => 
            category.skills && category.skills.length > 0
          )
          this.currentCategoryIndex = categoryIndex >= 0 ? categoryIndex : 0
          return true
        }
      }
      
      // If we get here, there are no more groups with skills
      return false
    },
    
    // Handle skill update from SkillCategory component
    handleSkillUpdate(data) {
      const skillId = data.skillId;
      const response = data.response;
      
      // Update the response in the local state
      this.updateSkillResponse(skillId, response);
      
      // Track changes for saving
      const hasRecord = !!this.userSkillsMap[skillId];
      
      if (this.targetProjectId) {
        // Project skill handling
        const shouldInclude = response === 'yes';
        
        if (hasRecord && !shouldInclude) {
          // Track skill to remove from project
          if (!this.skillsToRemove.includes(this.userSkillsMap[skillId].id)) {
            this.skillsToRemove.push(this.userSkillsMap[skillId].id);
          }
          // Remove from skillsToAdd if it was added temporarily
          this.skillsToAdd = this.skillsToAdd.filter(id => id !== skillId);
        } else if (!hasRecord && shouldInclude) {
          // Track skill to add to project
          if (!this.skillsToAdd.includes(skillId)) {
            this.skillsToAdd.push(skillId);
          }
        }
      } else {
        // User skill handling
        const proficiency = response === 'yes' ? 1 : 0;
        
        if (hasRecord) {
          const existingProficiency = this.userSkillsMap[skillId].proficiency;
          
          // If proficiency changed
          if (existingProficiency !== proficiency) {
            // Track skill to update
            const existingUpdateIndex = this.skillsToUpdate.findIndex(item => item.id === this.userSkillsMap[skillId].id);
            
            if (existingUpdateIndex >= 0) {
              // Update existing entry
              this.skillsToUpdate[existingUpdateIndex].proficiency = proficiency;
            } else {
              // Add new entry
              this.skillsToUpdate.push({
                id: this.userSkillsMap[skillId].id,
                proficiency
              });
            }
          }
        } else {
          // New skill
          if (response === 'yes' && !this.skillsToAdd.includes(skillId)) {
            this.skillsToAdd.push(skillId);
          }
        }
      }
    },

    // Handle notes update from SkillCategory component
    handleNotesUpdate(data) {
      this.categoryNotes[data.categoryId] = data.notes;
    },

    // Handle stepper update from v-stepper component
    handleStepperUpdate(index) {
      // The v-stepper component uses 0-based indexing
      this.goToGroup(index);
    },

    // Handle category update from v-chip-group component
    handleCategoryUpdate(index) {
      this.currentCategoryIndex = index;
    },

    async loadSkills() {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        
        if (this.targetUserId) {
          // Load skills for a specific user
          response = await skillMatrixApi.getUserSkillDetails(this.targetUserId);
        } else if (this.targetProjectId) {
          // Load skills for a specific project
          response = await skillMatrixApi.getProjectSkills(this.targetProjectId);
        } else {
          // Load skills for the current user
          response = await skillMatrixApi.getUserSkillDetails();
        }
        
        // Process the response data
        if (this.targetProjectId) {
          // Process project skills
          const projectSkills = response.data || [];
          
          // Create a map of project skills by skill_id
          this.userSkillsMap = {};
          this.userSkills = {};
          this.skillResponses = {};
          
          projectSkills.forEach(projectSkill => {
            const skillId = projectSkill.skill_id;
            
            this.userSkillsMap[skillId] = projectSkill;
            
            // For projects, we just mark skills as included (true) or not
            this.skillResponses[skillId] = 'yes';
            this.userSkills[skillId] = true;
          });
        } else {
          // Process user skills
          const userSkills = response.data || [];
          
          // Create a map of user skills by skill_id
          this.userSkillsMap = {};
          this.userSkills = {};
          this.skillResponses = {};
          
          userSkills.forEach(personSkill => {
            const skillId = personSkill.skill_id;
            const proficiency = personSkill.proficiency;
            
            this.userSkillsMap[skillId] = personSkill;
            
            // Set response based on proficiency
            if (proficiency === 1 || proficiency === true) {
              this.skillResponses[skillId] = 'yes';
              this.userSkills[skillId] = true;
            } else if (proficiency === 0 || proficiency === false) {
              this.skillResponses[skillId] = 'no';
              this.userSkills[skillId] = false;
            } else {
              // Default to "yes" for any other value, for backward compatibility
              this.skillResponses[skillId] = 'yes';
              this.userSkills[skillId] = true;
            }
          });
        }
        
        // Initialize all skills that don't have a response to null (not answered)
        this.skillCategories.forEach(category => {
          if (category.skills) {
            category.skills.forEach(skill => {
              if (this.skillResponses[skill.id] === undefined) {
                this.skillResponses[skill.id] = null;
              }
            });
          }
        });
        
        // Calculate answered skills count
        this.answeredSkills = Object.values(this.skillResponses).filter(v => v !== null).length;
      } catch (error) {
        console.error('Error loading skills:', error);
        this.error = 'Failed to load skills';
      } finally {
        this.loading = false;
      }
    },
    
    processSkillData(response) {
      // Process the skill data from the response
      // This is a placeholder for the actual implementation
      if (response && response.data) {
        // Process the data here
      }
    },
    
    async saveSkillAssessment() {
      this.saving = true;
      
      try {
        if (this.targetProjectId) {
          // Handle project skills
          const promises = [];
          
          // Add new skills to project
          if (this.skillsToAdd && this.skillsToAdd.length > 0) {
            for (const skillId of this.skillsToAdd) {
              promises.push(skillMatrixApi.addProjectSkill(this.targetProjectId, skillId));
            }
          }
          
          // Remove skills from project
          if (this.skillsToRemove && this.skillsToRemove.length > 0) {
            for (const skillId of this.skillsToRemove) {
              promises.push(skillMatrixApi.removeProjectSkill(skillId));
            }
          }
          
          await Promise.all(promises);
          
          // Reload project skills
          await this.loadProjectSkills();
        } else {
          // Handle user skills
          const assessment = {
            skillsToAddWithYes: this.skillsToAdd,
            skillsToRemove: this.skillsToRemove,
            skillsToUpdate: this.skillsToUpdate
          };
          
          await skillMatrixApi.saveAssessment(this.targetUserId, assessment);
          
          // Reload user skills
          await this.loadUserSkills();
        }
        
        // Reset tracking arrays
        this.resetChanges();
        
        this.showSaveSuccess = true;
        setTimeout(() => {
          this.showSaveSuccess = false;
        }, 3000);
      } catch (error) {
        console.error('Error saving skills:', error);
        this.error = 'Failed to save changes';
      } finally {
        this.saving = false;
      }
    },
    
    resetChanges() {
      // Reset the tracking arrays
      this.skillsToAdd = [];
      this.skillsToRemove = [];
      this.skillsToUpdate = [];
    },

    // New method to reset component state for clean reload
    resetState() {
      this.loading = true;
      this.error = null;
      this.assessmentStarted = false;
      this.showSummary = false;
      this.skillResponses = {};
      this.userSkills = {};
      this.userSkillsMap = {};
      this.answeredSkills = 0;
      this.currentGroupIndex = 0;
      this.currentCategoryIndex = 0;
      this.skillsToAdd = [];
      this.skillsToRemove = [];
      this.skillsToUpdate = [];
    }
  }
}
</script>

<style scoped>
.skill-matrix {
  margin-top: 20px;
}
</style> 