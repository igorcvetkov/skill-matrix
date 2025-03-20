<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Skill Matrix</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      location="left"
      :rail="railMode"
      @click="railMode = false"
      :permanent="$vuetify.display.mdAndUp"
      :temporary="$vuetify.display.smAndDown"
      :expand-on-hover="railMode"
    >
      <v-list>
        <v-list-item
          v-if="currentUser"
          :prepend-avatar="userAvatar"
          :title="currentUser.name"
          :subtitle="userRoles.length ? userRoles.join(', ') : ''"
        ></v-list-item>
        <v-list-item
          v-else
          prepend-avatar="https://ui-avatars.com/api/?name=Skill+Matrix&background=random"
          title="Skill Matrix"
          subtitle="Assessment & Management"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- Main Navigation -->
      <v-list nav>
        <v-list-item 
          prepend-icon="mdi-account-check" 
          title="My Assessment" 
          to="/"
          :active="activeTab === 'self-assessment'"
          @click="activeTab = 'self-assessment'"
        ></v-list-item>
        
        <v-list-item 
          v-if="isProjectManager" 
          prepend-icon="mdi-clipboard-check" 
          title="Project Assessment" 
          to="/project-assessment"
          :active="activeTab === 'project-assessment'"
          @click="activeTab = 'project-assessment'"
        ></v-list-item>
        
        <v-list-item 
          v-if="canManageOtherUsers" 
          prepend-icon="mdi-account-multiple-check" 
          title="Team Assessment" 
          to="/user-assessment"
          :active="activeTab === 'user-assessment'"
          @click="activeTab = 'user-assessment'"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <!-- Team Management Section - Show only when Team Assessment is active -->
      <div v-if="activeTab === 'user-assessment' && canManageOtherUsers">
        <v-list>
          <v-list-subheader>Team Management</v-list-subheader>
        </v-list>
        
        <!-- User selector -->
        <div class="px-3 pb-2">
          <user-selector @user-selected="selectTeamMember"></user-selector>
        </div>
      </div>

      <template v-slot:append>
        <!-- User actions -->
        <v-list v-if="currentUser">
          <v-divider></v-divider>
          <v-list-item 
            v-if="!isMockUser" 
            @click="logout" 
            prepend-icon="mdi-logout" 
            title="Logout"
            color="error"
          ></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }} - Skill Matrix Alternative Frontend</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { msalInstance } from './store'
import { roles } from './router'
import UserSelector from '@/components/UserSelector.vue'

export default {
  name: 'App',
  components: {
    UserSelector
  },
  data() {
    return {
      activeTab: 'self-assessment',
      drawer: true,
      railMode: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser', 'userRoles', 'hasRole', 'isAdmin', 'isProjectManager']),
    isMockUser() {
      return this.currentUser && this.currentUser.id === 'mock-user-id'
    },
    canManageOtherUsers() {
      return this.hasRole(roles.ADMIN) || this.hasRole(roles.PM)
    },
    userAvatar() {
      // Generate avatar URL from user's name
      return this.currentUser ? 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.name)}&background=random` : 
        'https://ui-avatars.com/api/?name=User&background=random'
    }
  },
  methods: {
    ...mapActions(['logout', 'handleRedirectCallback']),
    
    selectTeamMember(userId) {
      if (userId) {
        this.$router.push({ path: '/user-assessment', query: { userId } })
      } else {
        this.$router.push({ path: '/user-assessment' })
      }
    }
  },
  async created() {
    // Register event handlers for MSAL
    msalInstance.addEventCallback((event) => {
      if (event.eventType === 'loginFailure') {
        console.error('Login failed:', event.error)
      } else if (event.eventType === 'loginSuccess') {
        console.log('Login successful')
      }
    })

    // Check if returning from a redirect
    try {
      await this.handleRedirectCallback()
    } catch (error) {
      console.error('Error handling redirect:', error)
    }
    
    // Set active tab based on current route
    const path = this.$route.path
    if (path === '/') {
      this.activeTab = 'self-assessment'
    } else if (path === '/project-assessment') {
      this.activeTab = 'project-assessment'
    } else if (path === '/user-assessment') {
      this.activeTab = 'user-assessment'
    }
  },
  watch: {
    $route(to) {
      // Update active tab when route changes
      const path = to.path
      if (path === '/') {
        this.activeTab = 'self-assessment'
      } else if (path === '/project-assessment') {
        this.activeTab = 'project-assessment'
      } else if (path === '/user-assessment') {
        this.activeTab = 'user-assessment'
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.v-toolbar__content {
  padding: 0 16px !important;
}

.v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
}

.v-navigation-drawer__append {
  margin-top: auto;
}
</style> 