<template>
  <div class="user-selector">
    <v-card class="mb-4 pa-4">
      <v-card-title class="px-0 pt-0">
        User Selection
      </v-card-title>
      <v-card-subtitle class="px-0 pb-2">
        Select a user to view or manage their skill assessment
      </v-card-subtitle>
      
      <v-combobox
        v-model="selectedUser"
        :loading="loading"
        :items="users"
        item-title="name"
        item-value="id"
        label="Select User"
        clearable
        return-object
        :disabled="loading"
        @update:model-value="handleUserSelection"
      >
        <template v-slot:prepend-inner>
          <v-icon color="primary">mdi-account-search</v-icon>
        </template>
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-title>
              No users found
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-combobox>
      
      <v-expand-transition>
        <div v-if="selectedUser" class="mt-4">
          <v-chip
            color="primary"
            size="large"
            prepend-icon="mdi-account"
          >
            {{ selectedUser.name }}
          </v-chip>
          <v-btn
            variant="text"
            color="error"
            size="small"
            class="ml-2"
            @click="clearSelection"
          >
            Clear
          </v-btn>
        </div>
      </v-expand-transition>
    </v-card>
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
  margin-bottom: 1rem;
}
</style> 