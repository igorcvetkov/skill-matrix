<template>
  <div class="project-assessment">
    <v-container>
      <!-- No project selected view -->
      <div v-if="!selectedProjectId">
        <v-row>
          <v-col cols="12">
            <v-card class="text-center py-8">
              <v-icon size="x-large" color="primary" class="mb-4">mdi-clipboard-search</v-icon>
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
            <div class="mb-4 d-flex justify-space-between align-center">
              <div>
                <h1 class="text-h4 mb-1">{{ selectedProjectName || "Project" }} Skill Assessment</h1>
                <p class="text-subtitle-1 text-medium-emphasis">
                  You are viewing this assessment as {{ currentUser?.name || "a manager" }}
                </p>
              </div>

              <!-- Member Management Button -->
              <v-btn color="primary" @click="openMemberDialog">
                <v-icon start>mdi-account-multiple</v-icon>
                Member Management
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <skill-matrix :key="key" :target-project-id="selectedProjectId" />
          </v-col>
        </v-row>
      </div>
    </v-container>

    <!-- Member Management Dialog -->
    <v-dialog v-model="memberDialog" max-width="700">
      <v-card>
        <!-- Tighter Title Section -->
        <v-card-title class="py-2 px-4 d-flex justify-space-between align-center">
          <span class="text-h6">Project Members</span>
          <v-btn icon @click="memberDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Reduce padding & give height to data section -->
        <v-card-text class="pt-0 px-4 pb-4">
          <v-data-table
              :headers="memberHeaders"
              :items="projectMembers"
              :loading="membersLoading"
              class="mb-4"
              dense
              height="300"
              fixed-header
          ></v-data-table>

          <v-select
              v-model="selectedUserToAdd"
              :items="allUsers"
              item-title="name"
              item-value="id"
              label="Add user to project"
              return-object
              dense
              outlined
          ></v-select>

          <v-text-field
              v-model="newUserEmail"
              label="Or Assign by Email"
              hint="Enter an email if user is not yet registered"
              persistent-hint
              type="email"
              class="mb-4"
              :error="emailError"
              :error-messages="emailErrorMessages"
          />

        </v-card-text>

        <!-- Tighter Actions -->
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="!selectedUserToAdd && !isValidEmail" @click="addUserToProject">
            Add User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
      key: Date.now(),
      newUserEmail: '',
      memberDialog: false,
      projectMembers: [],
      allUsers: [],
      selectedUserToAdd: null,
      membersLoading: false,

      memberHeaders: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' }
      ]
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
    },
    isValidEmail() {
      return this.newUserEmail === '' || this.validateEmail(this.newUserEmail)
    },
    emailError() {
      return this.newUserEmail !== '' && !this.validateEmail(this.newUserEmail)
    },
    emailErrorMessages() {
      return this.emailError ? ['Invalid email format'] : []
    }
  },
  methods: {
    async loadProjectInfo() {
      if (!this.selectedProjectId) return
      this.loading = true
      try {
        const response = await skillMatrixApi.getProject(this.selectedProjectId)
        this.selectedProjectName = response.data?.name || `Project #${this.selectedProjectId}`
      } catch (error) {
        console.error('Failed to load project info:', error)
        this.selectedProjectName = `Project #${this.selectedProjectId}`
      } finally {
        this.loading = false
      }
    },
    async openMemberDialog() {
      this.memberDialog = true
      await this.loadProjectMembers()
      await this.loadAllUsers()
    },
    async loadProjectMembers() {
      this.membersLoading = true
      try {
        const res = await skillMatrixApi.getProjectMembers(this.selectedProjectId)
        this.projectMembers = res.data || []
      } catch (err) {
        console.error('Failed to load project members', err)
      } finally {
        this.membersLoading = false
      }
    },
    async loadAllUsers() {
      try {
        const res = await skillMatrixApi.getUsersNotInProject(this.selectedProjectId);
        this.allUsers = res.data || [];
      } catch (err) {
        console.error('Failed to load users not in project', err);
      }
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },
    async addUserToProject() {
      try {
        if (this.selectedUserToAdd) {
          await skillMatrixApi.assignProjectMember({
            personId: this.selectedUserToAdd.id,
            projectId: this.selectedProjectId,
            startDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            endDate: null
          })
        } else if (this.newUserEmail && this.validateEmail(this.newUserEmail)) {
          const response = await skillMatrixApi.createOrGetPersonByEmail({ email: this.newUserEmail })
          const newPerson = response.data

          await skillMatrixApi.assignProjectMember({
            personId: newPerson.id,
            projectId: this.selectedProjectId,
            startDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            endDate: null
          })
        }

        this.selectedUserToAdd = null
        this.newUserEmail = ''
        await this.loadProjectMembers()
      } catch (err) {
        console.error('Failed to assign user to project:', err)
      }
    }
  },
  created() {
    const projectId = this.$route.query.projectId
    if (projectId) {
      this.selectedProjectId = projectId
      this.loadProjectInfo()
    }
  },
  watch: {
    '$route.query.projectId': {
      handler(newProjectId) {
        if (newProjectId !== this.selectedProjectId) {
          this.selectedProjectId = newProjectId
          this.loadProjectInfo()
          this.key = Date.now()
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
