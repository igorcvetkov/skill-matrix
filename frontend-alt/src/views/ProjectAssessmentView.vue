<template>
  <div class="project-assessment">
    <v-container>
      <!-- No project selected view -->
      <div v-if="!selectedProjectId">
        <v-row>
          <v-col cols="12">
            <v-card class="text-center py-8">
              <v-icon
                size="x-large"
                color="primary"
                class="mb-4"
              >
                mdi-clipboard-search
              </v-icon>
              <h3 class="text-h5 mb-2">Select a Project</h3>
              <p class="text-body-1">
                Please select a project from the navigation drawer to view or manage its skills assessment.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- Selected project assessment view -->
      <div v-if="selectedProjectId">
        <v-row>
          <v-col cols="12">
            <div class="mb-4 d-flex">
              <div>
                <h1 class="text-h4 mb-1">
                  {{ selectedProjectName || "Project" }} Skill Assessment
                </h1>
                <p class="text-subtitle-1 text-medium-emphasis">
                  You are viewing this assessment as {{ currentUser?.name || "a manager" }}
                </p>
              </div>
            </div>
          </v-col>
        </v-row>
        
        <!-- Skill Matrix Component for the selected project -->
        <v-row>
          <v-col cols="12">
            <skill-matrix 
              :key="key"
              :target-project-id="selectedProjectId">
            </skill-matrix>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SkillMatrix from '@/components/SkillMatrix.vue'
import skillMatrixApi from '@/services/skillMatrixApi'
import { roles } from '@/router'

export default {
  name: 'ProjectAssessmentView',
  components: {
    SkillMatrix
  },
  data() {
    return {
      selectedProjectId: null,
      selectedProjectName: null,
      loading: false,
      error: null,
      key: Date.now()
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userRoles', 'hasRole', 'isAdmin', 'isProjectManager']),
    userRoleDisplay() {
      if (this.hasRole(roles.ADMIN)) return 'Administrator'
      if (this.hasRole(roles.PM)) return 'Project Manager'
      return 'Team Leader'
    },
    canManageProjects() {
      return this.hasRole(roles.ADMIN) || this.hasRole(roles.PM)
    }
  },
  created() {
    // Check if a projectId is provided in the route query parameters
    const projectId = this.$route.query.projectId
    if (projectId) {
      this.selectedProjectId = projectId
      this.loadProjectInfo()
    }
  },
  methods: {
    async loadProjectInfo() {
      if (!this.selectedProjectId) return
      
      this.loading = true
      try {
        // Fetch the project's information
        const response = await skillMatrixApi.getProjectInfo(this.selectedProjectId)
        if (response.data && response.data.name) {
          this.selectedProjectName = response.data.name
        } else {
          this.selectedProjectName = 'Project #' + this.selectedProjectId
        }
      } catch (error) {
        console.error('Failed to load project info:', error)
        this.selectedProjectName = 'Project #' + this.selectedProjectId
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    '$route.query.projectId': {
      handler(newProjectId) {
        if (newProjectId && newProjectId !== this.selectedProjectId) {
          this.selectedProjectId = newProjectId
          this.loadProjectInfo()
          this.key = Date.now()
        } else if (!newProjectId) {
          this.selectedProjectId = null
          this.selectedProjectName = null
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.project-assessment {
  margin-top: 20px;
}
</style> 