<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Skill Groups Management</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openNewDialog"
          >
            Add Group
          </v-btn>
        </div>
        
        <v-alert
          v-if="error"
          type="error"
          dismissible
          class="mb-4"
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>
        
        <v-alert
          v-if="successMessage"
          type="success"
          dismissible
          class="mb-4"
          @click:close="successMessage = null"
        >
          {{ successMessage }}
        </v-alert>
        
        <v-data-table
          :headers="headers"
          :items="skillGroups"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1 skill-management-table"
        >
          <template #[`item.name`]="{ item }">
            <div class="text-start">{{ item.name }}</div>
          </template>
          <template #[`item.actions`]="{ item }">
            <div class="d-flex justify-end">
              <v-btn
                icon
                density="compact"
                color="primary"
                @click="openEditDialog(item)"
                variant="text"
                class="mr-1"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                density="compact"
                color="error"
                @click="confirmDelete(item)"
                variant="text"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    
    <!-- Add New Group Dialog -->
    <v-dialog v-model="newDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Skill Group' : 'Add New Skill Group' }}</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveGroup">
            <v-text-field
              v-model="newGroupName"
              label="Group Name"
              required
              :rules="[v => !!v || 'Group name is required']"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="newDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveGroup" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Delete Skill Group</v-card-title>
        <v-card-text>
          Are you sure you want to delete the skill group "{{ groupToDelete?.name }}"?
          <v-alert
            type="warning"
            density="compact"
            class="mt-3"
          >
            This will also delete all associated categories and skills!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn 
            color="error" 
            @click="deleteGroup" 
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import skillMatrixApi from '@/services/skillMatrixApi'
import { mapGetters } from 'vuex'

export default {
  name: 'SkillGroupsManagementView',
  data() {
    return {
      loading: false,
      saving: false,
      deleting: false,
      error: null,
      successMessage: null,
      skillGroups: [],
      newDialog: false,
      deleteDialog: false,
      newGroupName: '',
      groupToDelete: null,
      headers: [
        { title: 'ID', key: 'id', sortable: true, width: '100px' },
        { title: 'Name', key: 'name', sortable: true, align: 'start' },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: '100px' }
      ],
      editMode: false
    }
  },
  computed: {
    ...mapGetters(['isAdmin'])
  },
  mounted() {
    this.loadSkillGroups()
  },
  methods: {
    async loadSkillGroups() {
      this.loading = true
      this.error = null
      
      try {
        const response = await skillMatrixApi.getSkillGroups()
        this.skillGroups = response.data || []
      } catch (error) {
        this.error = 'Failed to load skill groups: ' + (error.response?.data?.error || error.message)
      } finally {
        this.loading = false
      }
    },
    
    openNewDialog() {
      this.newGroupName = ''
      this.newDialog = true
      this.editMode = false
      // Focus the input field after dialog opens
      setTimeout(() => {
        if (this.$refs.form) {
          const input = this.$refs.form.$el.querySelector('input')
          if (input) input.focus()
        }
      }, 100)
    },
    
    async addSkillGroup() {
      if (!this.newGroupName.trim()) {
        this.error = 'Group name is required'
        return
      }
      
      this.saving = true
      this.error = null
      
      try {
        if (this.editMode) {
          await skillMatrixApi.updateSkillGroup(this.groupToDelete.id, { name: this.newGroupName.trim() })
          // Update the existing group in the list
          const index = this.skillGroups.findIndex(group => group.id === this.groupToDelete.id)
          if (index !== -1) {
            this.skillGroups[index].name = this.newGroupName.trim()
          }
          this.successMessage = 'Skill group updated successfully'
        } else {
          const response = await skillMatrixApi.createSkillGroup({ name: this.newGroupName.trim() })
          // Add the new group to the list
          this.skillGroups.push(response.data)
          this.successMessage = 'Skill group added successfully'
        }
        this.newDialog = false
        this.newGroupName = ''
      } catch (error) {
        this.error = 'Failed to add skill group: ' + (error.response?.data?.error || error.message)
      } finally {
        this.saving = false
      }
    },
    
    confirmDelete(item) {
      this.groupToDelete = item
      this.deleteDialog = true
    },
    
    async deleteGroup() {
      if (!this.groupToDelete) return
      
      this.deleting = true
      this.error = null
      
      try {
        await skillMatrixApi.deleteSkillGroup(this.groupToDelete.id)
        // Remove the deleted group from the list
        this.skillGroups = this.skillGroups.filter(group => group.id !== this.groupToDelete.id)
        this.successMessage = `Skill group "${this.groupToDelete.name}" deleted successfully`
        this.deleteDialog = false
        this.groupToDelete = null
      } catch (error) {
        this.error = 'Failed to delete skill group: ' + (error.response?.data?.error || error.message)
      } finally {
        this.deleting = false
      }
    },

    openEditDialog(item) {
      this.newGroupName = item.name
      this.newDialog = true
      this.editMode = true
      this.groupToDelete = item
      // Focus the input field after dialog opens
      setTimeout(() => {
        if (this.$refs.form) {
          const input = this.$refs.form.$el.querySelector('input')
          if (input) input.focus()
        }
      }, 100)
    },

    saveGroup() {
      this.addSkillGroup()
    }
  }
}
</script>

<style>
.skill-management-table .v-data-table__td {
  text-align: left;
}
</style> 