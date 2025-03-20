<template>
  <v-card class="mb-4">
    <!-- <v-card-text class="pa-4"> -->
      <div class="d-flex justify-space-between align-center mb-2 pa-2">
        <div>
          <span class="text-subtitle-1 font-weight-medium">Your progress</span>
          <div class="text-caption">Group {{ currentGroupIndex + 1 }} of {{ skillGroups.length }}</div>
        </div>
        <div class="text-right">
          <span class="text-subtitle-2">{{ answeredSkills }} of {{ totalSkills }} skills assessed</span>
          <div class="text-caption">{{ Math.ceil(progressPercentage) }}% complete</div>
        </div>
      </div>
      <v-progress-linear
        :model-value="progressPercentage"
        height="12"
        color="primary"
        class="rounded-lg mb-2 pa-2"
      ></v-progress-linear>
      
      <!-- Group Steps -->
      <v-stepper :model-value="currentGroupIndex" @update:model-value="handleStepperUpdate" alt-labels>
        <template v-slot:default>
          <v-stepper-header>
            <template v-for="(group, groupIndex) in skillGroups" :key="group.id">
              <v-stepper-item
                :complete="currentGroupIndex > groupIndex"
                :value="groupIndex"
                :title="group.name"
                editable
              ></v-stepper-item>

              <v-divider
                v-if="groupIndex !== skillGroups.length - 1"
                :key="`divider-${groupIndex}`"
              ></v-divider>
            </template>
          </v-stepper-header>

          <v-stepper-window>
            <v-stepper-window-item
              v-for="(group, groupIndex) in skillGroups"
              :key="`group-${group.id}`"
              :value="groupIndex"
            >
              <div class="d-flex flex-row assessment-container">
                <v-card class="w-100" flat>
                  <v-list bg-color="grey-lighten-5" rounded="lg">
                    <template v-for="(category, index) in getCategoriesForGroup(groupIndex)" :key="category.id">
                      <v-list-subheader class="d-flex align-center">
                        <div>{{ category.name }}</div>
                        <v-spacer></v-spacer>
                        <v-chip
                          size="small"
                          :color="getCategoryCompletionColor(index, groupIndex)"
                          variant="tonal"
                          density="compact"
                          class="ms-2"
                        >
                          {{ getCategoryAnsweredCount(index, groupIndex) }} of {{ category.skills ? category.skills.length : 0 }} skills
                        </v-chip>
                      </v-list-subheader>
                      
                      <v-list-item
                        v-for="skill in category.skills" 
                        :key="skill.id"
                        density="compact"
                        class="mb-1"
                      >
                        <template v-slot:prepend>
                          <v-btn-toggle
                            :model-value="getSkillResponseValue(skill.id)"
                            density="comfortable"
                            mandatory
                            rounded="lg"
                            class="skill-toggle"
                            :disabled="!canEditSkills"
                            @update:model-value="(value) => handleSkillUpdate({ skillId: skill.id, response: value })"
                          >
                            <v-btn value="yes" size="small" variant="outlined" class="v-btn--value-yes">
                              <v-icon icon="mdi-checkbox-marked-circle" start size="small"></v-icon>
                              Yes
                            </v-btn>
                            <v-btn value="no" size="small" variant="outlined" class="v-btn--value-no">
                              <v-icon icon="mdi-cancel" start size="small"></v-icon>
                              No
                            </v-btn>
                          </v-btn-toggle>
                        </template>
                        
                        <v-list-item-title>
                          {{ skill.name }}
                        </v-list-item-title>
                        
                        <template v-slot:append>
                          <v-tooltip v-if="skill.description" location="bottom">
                            <template v-slot:activator="{ props }">
                              <v-icon
                                v-bind="props"
                                size="small"
                                color="info"
                              >
                                mdi-information-outline
                              </v-icon>
                            </template>
                            <span>{{ skill.description }}</span>
                          </v-tooltip>
                        </template>
                        <v-divider></v-divider>
                      </v-list-item>
                      
                      <v-divider v-if="index < getCategoriesForGroup(groupIndex).length - 1" class="my-2"></v-divider>
                    </template>
                  </v-list>
                </v-card>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
          
          <v-stepper-actions
            :disabled="getStepperDisabled()"
            @click:next="handleStepperNext()"
            @click:prev="handleStepperPrev()"
          ></v-stepper-actions>
        </template>
      </v-stepper>
      
      <!-- Finish Assessment Button -->
      <div class="d-flex justify-end pa-4">
        <v-btn
          color="success"
          prepend-icon="mdi-check-circle"
          @click="$emit('finish')"
          :disabled="saving || !canFinishAssessment"
          :loading="saving"
        >
          Finish Assessment
        </v-btn>
      </div>
    <!-- </v-card-text> -->
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import { roles } from '../router';

export default {
  name: 'AssessmentPath',
  props: {
    skillGroups: {
      type: Array,
      required: true
    },
    skillCategories: {
      type: Array,
      required: true
    },
    currentGroupIndex: {
      type: Number,
      required: true
    },
    currentCategoryIndex: {
      type: Number,
      required: true
    },
    skillResponses: {
      type: Object,
      required: true
    },
    categoryNotes: {
      type: Object,
      required: true
    },
    totalSkills: {
      type: Number,
      required: true
    },
    answeredSkills: {
      type: Number,
      required: true
    },
    progressPercentage: {
      type: Number,
      required: true
    },
    saving: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      default: null
    },
    isOwnAssessment: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:currentGroupIndex', 'update:currentCategoryIndex', 'update-skill', 'update-notes', 'finish'],
  computed: {
    ...mapGetters(['currentUser', 'userRoles', 'hasRole', 'isAdmin', 'isProjectManager']),
    currentGroupCategories() {
      if (!this.skillGroups[this.currentGroupIndex]) return []
      return this.skillCategories.filter(category => 
        category.group_id === this.skillGroups[this.currentGroupIndex].id
      )
    },
    canEditSkills() {
      // Self-assessment is always allowed for your own skills
      if (this.isOwnAssessment) return true;
      
      // Managers and admins can edit other users' skills
      return this.hasRole(roles.ADMIN) || this.hasRole(roles.PM);
    },
    canFinishAssessment() {
      // Anyone can finish their own assessment
      if (this.isOwnAssessment) return true;
      
      // Only managers and admins can finish others' assessments
      return this.hasRole(roles.ADMIN) || this.hasRole(roles.PM);
    }
  },
  methods: {
    getCategoriesForGroup(groupIndex) {
      if (!this.skillGroups[groupIndex]) return []
      return this.skillCategories.filter(category => 
        category.group_id === this.skillGroups[groupIndex].id
      )
    },
    handleStepperUpdate(index) {
      this.$emit('update:currentGroupIndex', index)
    },
    handleStepperNext() {
      const nextIndex = this.currentGroupIndex + 1
      if (nextIndex < this.skillGroups.length) {
        this.$emit('update:currentGroupIndex', nextIndex)
        this.$emit('update:currentCategoryIndex', 0) // Reset category index when moving to next group
      }
    },
    handleStepperPrev() {
      const prevIndex = this.currentGroupIndex - 1
      if (prevIndex >= 0) {
        this.$emit('update:currentGroupIndex', prevIndex)
        this.$emit('update:currentCategoryIndex', 0) // Reset category index when moving to previous group
      }
    },
    getStepperDisabled() {
      return this.currentGroupIndex === 0 ? 'prev' : 
             this.currentGroupIndex === this.skillGroups.length - 1 ? 'next' : 
             undefined
    },
    handleCategoryUpdate(index) {
      this.$emit('update:currentCategoryIndex', index)
    },
    handleSkillUpdate(data) {
      if (!this.canEditSkills) return;
      this.$emit('update-skill', data)
    },
    handleNotesUpdate(data) {
      if (!this.canEditSkills) return;
      this.$emit('update-notes', data)
    },
    getCategoryCompletionColor(index, groupIndex = null) {
      const categories = groupIndex !== null ? this.getCategoriesForGroup(groupIndex) : this.currentGroupCategories
      const category = categories[index]
      if (!category || !category.skills || category.skills.length === 0) return 'grey'
      
      const answeredCount = category.skills.filter(skill => 
        this.skillResponses[skill.id] === 'yes' || this.skillResponses[skill.id] === 'no'
      ).length
      
      const percentage = (answeredCount / category.skills.length) * 100
      
      if (percentage === 0) return 'grey'
      if (percentage < 50) return 'warning'
      if (percentage < 100) return 'info'
      return 'success'
    },
    getCategoryAnsweredCount(index, groupIndex = null) {
      const categories = groupIndex !== null ? this.getCategoriesForGroup(groupIndex) : this.currentGroupCategories
      const category = categories[index]
      if (!category || !category.skills || category.skills.length === 0) return 0
      
      const answeredCount = category.skills.filter(skill => 
        this.skillResponses[skill.id] === 'yes' || this.skillResponses[skill.id] === 'no'
      ).length
      
      return answeredCount
    },
    getSkillResponseValue(skillId) {
      return this.skillResponses[skillId]
    }
  }
}
</script>

<style scoped>
/* List styling */
.assessment-container {
  min-height: 400px;
}

:deep(.v-list-subheader) {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  background-color: rgba(var(--v-theme-primary), 0.04);
  padding: 12px 16px;
  border-radius: 8px;
}

:deep(.v-list-item-title) {
  white-space: normal;
  padding: 6px 0;
  line-height: 1.4;
  text-align: left;
  display: block;
}

:deep(.v-window__container) {
  border-top: none !important;
}

:deep(.v-stepper-window) {
  border-top: none !important;
  margin: 0 !important;
}

:deep(.v-window-item) {
  padding: 16px;
}

:deep(.skill-toggle) {
  margin-right: 16px !important;
  min-width: 140px;
}

:deep(.v-list-item) {
  min-height: 48px;
  padding-left: 8px;
}

:deep(.v-list-item__prepend) {
  margin-right: 16px;
}

:deep(.v-btn.v-btn--size-small) {
  min-width: 70px;
  padding: 0 8px;
}

:deep(.v-btn--active) {
  font-weight: 500;
}

:deep(.v-btn--active.v-btn--value-yes) {
  background-color: rgba(var(--v-theme-success), 0.12) !important;
  color: rgb(var(--v-theme-success)) !important;
  border-color: rgb(var(--v-theme-success)) !important;
}

:deep(.v-btn--active.v-btn--value-no) {
  background-color: rgba(var(--v-theme-error), 0.12) !important;
  color: rgb(var(--v-theme-error)) !important;
  border-color: rgb(var(--v-theme-error)) !important;
}

:deep(.v-list) {
  padding: 0 !important;
}

:deep(.v-stepper-header) {
  box-shadow: none !important;
}
</style> 