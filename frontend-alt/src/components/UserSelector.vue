<template>
  <div class="user-selector">
    <div class="selector-container">
      <v-combobox
        v-model="selectedUser"
        :loading="loading"
        :items="users"
        item-title="name"
        item-value="person_id"
        label="Select Team Member"
        clearable
        return-object
        :disabled="loading"
        density="compact"
        variant="outlined"
        bg-color="surface"
        hide-details
        @update:model-value="handleUserSelection"
      >
        <template v-slot:prepend-inner>
          <v-icon size="small" color="primary">mdi-account-search</v-icon>
        </template>
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-title>
              No users found
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-combobox>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { roles } from '../router';
import skillMatrixApi from '../services/skillMatrixApi';

export default {
  name: 'UserSelector',
  data() {
    return {
      users: [],
      selectedUser: null,
      loading: false,
      error: null,
      initialUserId: null
    };
  },
  computed: {
    ...mapGetters(['currentUser', 'hasRole', 'isAdmin', 'isProjectManager']),
    canSelectUsers() {
      return this.hasRole(roles.ADMIN) || this.hasRole(roles.PM);
    }
  },
  created() {
    // Only load users if the current user has permission
    if (this.canSelectUsers) {
      this.loadUsers();
      
      // Check if a user ID is in the route
      const userId = this.$route.query.userId;
      if (userId) {
        // Set as initial selection (will be updated when users are loaded)
        this.initialUserId = userId;
      }
    }
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await skillMatrixApi.getAllUsers();
        // Map the response data to the format expected by the combobox
        this.users = response.data.map(user => ({
          person_id: user.person_id,
          name: user.name || user.person_id // Use name if available, otherwise use person_id
        }));
        
        // If there was an initial user ID from the route, select it
        if (this.initialUserId && this.users.length > 0) {
          const userToSelect = this.users.find(u => u.person_id == this.initialUserId);
          if (userToSelect) {
            this.selectedUser = userToSelect;
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users';
      } finally {
        this.loading = false;
      }
    },
    
    handleUserSelection(user) {
      if (user) {
        this.$emit('user-selected', user.person_id);
      } else {
        this.$emit('user-selected', null);
      }
    },
    
    clearSelection() {
      this.selectedUser = null;
      this.$emit('user-selected', null);
    }
  },
  watch: {
    // Watch for route changes to update selection
    '$route.query.userId': {
      handler(newUserId) {
        if (newUserId && this.users.length > 0) {
          // Find and select the user
          const userToSelect = this.users.find(u => u.person_id == newUserId);
          if (userToSelect && (!this.selectedUser || this.selectedUser.person_id != newUserId)) {
            this.selectedUser = userToSelect;
          }
        } else if (!newUserId && this.selectedUser) {
          // Clear selection if the route doesn't have a user ID
          this.selectedUser = null;
        }
      }
    }
  }
};
</script>

<style scoped>
.user-selector {
  width: 100%;
}

.selector-container {
  display: flex;
  flex-direction: column;
}

.selected-user-chip {
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style> 