<template>
  <div class="user-assessment">
    <v-container>
      <!-- No user selected view -->
      <div v-if="!selectedUserId">
        <v-row>
          <v-col cols="12">
            <v-card class="text-center py-8">
              <v-icon
                size="x-large"
                color="primary"
                class="mb-4"
              >
                mdi-account-search
              </v-icon>
              <h3 class="text-h5 mb-2">Select a Team Member</h3>
              <p class="text-body-1">
                Please select a team member from the navigation drawer to view or manage their skills assessment.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- Selected user assessment view -->
      <div v-if="selectedUserId">
        <v-row>
          <v-col cols="12">
            <div class="mb-4 d-flex">
              <div>
                <h1 class="text-h4 mb-1">
                  {{ selectedUserName || "Team Member" }}'s Skill Assessment
                </h1>
                <p class="text-subtitle-1 text-medium-emphasis">
                  You are viewing this assessment as {{ currentUser?.name || "a manager" }}
                </p>
              </div>
            </div>
          </v-col>
        </v-row>
        
        <!-- Skill Matrix Component for the selected user -->
        <v-row>
          <v-col cols="12">
            <skill-matrix :target-user-id="selectedUserId"></skill-matrix>
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
  name: 'UserAssessmentView',
  components: {
    SkillMatrix
  },
  data() {
    return {
      selectedUserId: null,
      selectedUserName: null,
      loading: false,
      error: null
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userRoles', 'hasRole', 'isAdmin', 'isProjectManager']),
    userRoleDisplay() {
      if (this.hasRole(roles.ADMIN)) return 'Administrator'
      if (this.hasRole(roles.PM)) return 'Project Manager'
      return 'Team Leader'
    }
  },
  created() {
    // Check if a userId is provided in the route query parameters
    const userId = this.$route.query.userId
    if (userId) {
      this.selectedUserId = userId
      this.loadUserInfo()
    }
  },
  methods: {
    async loadUserInfo() {
      if (!this.selectedUserId) return
      
      this.loading = true
      try {
        // Fetch the user's information
        const response = await skillMatrixApi.getUserInfo(this.selectedUserId)
        if (response.data && response.data.name) {
          this.selectedUserName = response.data.name
        } else {
          this.selectedUserName = 'User #' + this.selectedUserId
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
        this.selectedUserName = 'User #' + this.selectedUserId
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    '$route.query.userId': {
      handler(newUserId) {
        if (newUserId && newUserId !== this.selectedUserId) {
          this.selectedUserId = newUserId
          this.loadUserInfo()
        } else if (!newUserId) {
          this.selectedUserId = null
          this.selectedUserName = null
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.user-assessment {
  margin-top: 20px;
}
</style> 