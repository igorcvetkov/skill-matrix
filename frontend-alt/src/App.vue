<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>Skill Matrix</v-app-bar-title>
      
      <v-tabs v-model="activeTab" grow align-tabs="center" color="white">
        <v-tab value="self-assessment" to="/">
          <v-icon start>mdi-account-check</v-icon>
          My Assessment
        </v-tab>
        
        <v-tab v-if="isProjectManager" value="project-assessment" to="/project-assessment">
          <v-icon start>mdi-clipboard-check</v-icon>
          Project Assessment
        </v-tab>
        
        <v-tab v-if="canManageOtherUsers" value="user-assessment" to="/user-assessment">
          <v-icon start>mdi-account-multiple-check</v-icon>
          Team Assessment
        </v-tab>
      </v-tabs>
      
      <v-spacer></v-spacer>
      
      <div v-if="currentUser" class="d-flex align-center">
        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar size="36" color="primary-lighten-1">
                <v-icon>mdi-account-circle</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          <v-card min-width="200">
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    <v-icon>mdi-account-circle</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ currentUser.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="userRoles.length">
                  {{ userRoles.join(', ') }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list>
              <v-list-item v-if="!isMockUser" @click="logout" prepend-icon="mdi-logout" title="Logout"></v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer
      v-if="activeTab === 'user-assessment' && canManageOtherUsers"
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
          prepend-avatar="https://ui-avatars.com/api/?name=Team+Management&background=random"
          title="Team Management"
          subtitle="Select team member to assess"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-account-group" title="All Team Members" to="/user-assessment"></v-list-item>
        <v-list-item prepend-icon="mdi-account-star" title="Direct Reports" to="/user-assessment?filter=direct"></v-list-item>
        <v-list-item prepend-icon="mdi-star" title="Favorites" to="/user-assessment?filter=favorites"></v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block @click="drawer = !drawer">
            <v-icon start>mdi-chevron-left</v-icon>
            {{ railMode ? "Expand" : "Collapse" }}
          </v-btn>
        </div>
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

export default {
  name: 'App',
  data() {
    return {
      activeTab: 'self-assessment',
      drawer: true,
      railMode: true
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser', 'userRoles', 'hasRole', 'isAdmin', 'isProjectManager']),
    isMockUser() {
      return this.currentUser && this.currentUser.id === 'mock-user-id'
    },
    canManageOtherUsers() {
      return this.hasRole(roles.ADMIN) || this.hasRole(roles.PM)
    }
  },
  methods: {
    ...mapActions(['logout', 'handleRedirectCallback'])
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

.v-tab {
  min-width: 150px;
}
</style> 