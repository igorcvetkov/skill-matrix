<template>
  <div class="user-assessment">
    <v-container>
      <!-- User selection section - only show if no user is selected -->
      <div v-if="!selectedUserId">
        <v-row>
          <v-col cols="12">
            <v-card class="mb-4">
              <v-card-title class="headline">
                Team Skills Assessment
              </v-card-title>
              
              <v-card-text>
                <p class="text-body-1 mb-4">
                  Select a team member to view or manage their skill assessment.
                  As a {{ userRoleDisplay }}, you can assess and update skills for your team members.
                </p>
                
                <!-- User selection interface -->
                <user-selector
                  @user-selected="handleUserSelection"
                ></user-selector>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- If no user is selected, show a message -->
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
              <h3 class="text-h5 mb-2">No Team Member Selected</h3>
              <p class="text-body-1">
                Please select a team member from the list above to view or manage their skills assessment.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- If a user is selected, show their assessment -->
      <div v-if="selectedUserId">
        <v-row>
          <v-col cols="12">
            <v-card class="mb-4 pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <v-card-title class="px-0 pt-0">
                    {{ selectedUserName || "Team Member" }}'s Skill Assessment
                  </v-card-title>
                  <v-card-subtitle class="px-0 pb-0">
                    You are viewing this assessment as {{ currentUser?.name || "a manager" }}
                  </v-card-subtitle>
                </div>
                <v-btn color="primary" @click="clearUserSelection">
                  Return to User Selection
                </v-btn>
              </div>
            </v-card>
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
import UserSelector from '@/components/UserSelector.vue'
import SkillMatrix from '@/components/SkillMatrix.vue'
import skillMatrixApi from '@/services/skillMatrixApi'
import { roles } from '@/router'

export default {
  name: 'UserAssessmentView',
  components: {
    UserSelector,
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
    handleUserSelection(userId) {
      if (userId) {
        this.selectedUserId = userId
        this.loadUserInfo()
        // Update URL without refreshing the page
        this.$router.replace({ query: { userId } })
      } else {
        this.clearUserSelection()
      }
    },
    
    clearUserSelection() {
      this.selectedUserId = null
      this.selectedUserName = null
      this.$router.replace({ query: {} })
    },
    
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
  }
}
</script>

<style scoped>
.user-assessment {
  margin-top: 20px;
}
</style> 