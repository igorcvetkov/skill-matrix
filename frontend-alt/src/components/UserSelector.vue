<template>
  <div class="user-selector">
    <div class="selector-container">
      <v-combobox
        v-model="selectedUser"
        :loading="loading"
        :items="users"
        item-title="name"
        item-value="id"
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
      error: null
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
    }
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await skillMatrixApi.getAllUsers();
        this.users = response.data.map(user => ({
          id: user.person_id,
          name: user.person_id // Using person_id as name if no name field exists
        }));
      } catch (error) {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users';
      } finally {
        this.loading = false;
      }
    },
    
    handleUserSelection(user) {
      if (user) {
        this.$emit('user-selected', user.id);
      } else {
        this.$emit('user-selected', null);
      }
    },
    
    clearSelection() {
      this.selectedUser = null;
      this.$emit('user-selected', null);
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