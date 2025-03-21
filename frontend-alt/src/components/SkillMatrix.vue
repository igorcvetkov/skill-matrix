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
      currentCategoryIndex: 0
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userRoles', 'hasRole']),
    isDevelopment() {
      return process.env.NODE_ENV === 'development'
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
      // If targetUserId not provided, defaults to current user's assessment
      if (!this.targetUserId) return true;
      
      // Check if target user ID matches current user ID
      return this.currentUser && this.targetUserId === this.currentUser.id;
    }
  },
  watch: {
    // Auto-start assessment when viewing another user's assessment
    targetUserId: {
      immediate: true,
      handler(newValue) {
        if (newValue && !this.isOwnAssessment) {
          // Wait for data to load, then auto-start
          this.$nextTick(() => {
            if (!this.loading && !this.assessmentStarted) {
              this.startAssessment();
            }
          });
        }
      }
    },
    // Auto-start assessment when data is loaded for another user
    loading(newValue) {
      if (!newValue && this.targetUserId && !this.isOwnAssessment && !this.assessmentStarted) {
        this.startAssessment();
      }
    },
    // This ensures that if currentGroupIndex changes through other methods,
    // the stepper will stay in sync
    currentGroupIndex() {}
  },
  created() {
    this.loadSkillData()
    this.loadUserInfo()
    this.loadUserSkills()
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
        // Prepare data for saving
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
      this.updateSkillResponse(data.skillId, data.response);
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
    }
  }
}
</script>

<style scoped>
.skill-matrix {
  margin-top: 20px;
}
</style> 