<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Skill Categories Management</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openNewDialog"
          >
            Add Category
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
          :items="skillCategories"
          :loading="loading"
          :items-per-page="10"
          :group-by="groupBy"
          class="elevation-1 skill-management-table"
        >
          <template #[`group-header`]="{ item, columns, toggleGroup, isGroupOpen }">
            <tr>
              <td :colspan="columns.length">
                <div class="d-flex align-center">
                  <v-btn
                    :icon="isGroupOpen(item) ? '$expand' : '$next'"
                    color="medium-emphasis"
                    density="comfortable"
                    size="small"
                    variant="outlined"
                    @click="toggleGroup(item)"
                  ></v-btn>

                  <span class="ms-4">Group: {{ item.value }}</span>
                </div>
              </td>
            </tr>
          </template>
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
    
    <!-- Add/Edit Category Dialog -->
    <v-dialog v-model="newDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Skill Category' : 'Add New Skill Category' }}</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveCategory">
            <v-text-field
              v-model="newCategoryName"
              label="Category Name"
              required
              :rules="[v => !!v || 'Category name is required']"
              class="mb-4"
            ></v-text-field>
            
            <v-select
              v-model="newCategoryGroupId"
              label="Select Group"
              :items="skillGroups"
              item-title="name"
              item-value="id"
              required
              :rules="[v => !!v || 'Group is required']"
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="newDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveCategory" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Delete Skill Category</v-card-title>
        <v-card-text>
          Are you sure you want to delete the skill category "{{ categoryToDelete?.name }}"?
          <v-alert
            type="warning"
            density="compact"
            class="mt-3"
          >
            This will also delete all associated skills!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn 
            color="error" 
            @click="deleteCategory" 
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
  name: 'SkillCategoriesManagementView',
  data() {
    return {
      loading: false,
      saving: false,
      deleting: false,
      error: null,
      successMessage: null,
      skillGroups: [],
      skillCategories: [],
      newDialog: false,
      deleteDialog: false,
      newCategoryName: '',
      newCategoryGroupId: null,
      categoryToDelete: null,
      headers: [
        { title: 'ID', key: 'id', sortable: true, width: '80px' },
        { title: 'Name', key: 'name', sortable: true, align: 'start' },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: '100px' }
      ],
      editMode: false,
      groupBy: [{ key: 'group_name', order: 'asc' }]
    }
  },
  computed: {
    ...mapGetters(['isAdmin'])
  },
  mounted() {
    this.loadGroups()
    this.loadCategories()
  },
  methods: {
    async loadGroups() {
      try {
        const response = await skillMatrixApi.getSkillGroups()
        this.skillGroups = response.data || []
      } catch (error) {
        this.error = 'Failed to load skill groups: ' + (error.response?.data?.error || error.message)
      }
    },
    
    async loadCategories() {
      this.loading = true
      this.error = null
      
      try {
        const response = await skillMatrixApi.getSkillCategories()
        this.skillCategories = response.data || []
      } catch (error) {
        this.error = 'Failed to load skill categories: ' + (error.response?.data?.error || error.message)
      } finally {
        this.loading = false
      }
    },
    
    openNewDialog() {
      this.newCategoryName = ''
      this.newCategoryGroupId = null
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
    
    openEditDialog(item) {
      this.categoryToDelete = item
      this.newCategoryName = item.name
      this.newCategoryGroupId = item.group_id
      this.editMode = true
      this.newDialog = true
      
      // Focus the input field after dialog opens
      setTimeout(() => {
        if (this.$refs.form) {
          const input = this.$refs.form.$el.querySelector('input')
          if (input) input.focus()
        }
      }, 100)
    },
    
    saveCategory() {
      this.addSkillCategory()
    },
    
    async addSkillCategory() {
      if (!this.newCategoryName.trim()) {
        this.error = 'Category name is required'
        return
      }
      
      if (!this.newCategoryGroupId) {
        this.error = 'Group is required'
        return
      }
      
      this.saving = true
      this.error = null
      
      try {
        if (this.editMode) {
          // Update existing category
          const response = await skillMatrixApi.updateSkillCategory(this.categoryToDelete.id, {
            name: this.newCategoryName.trim(),
            groupId: this.newCategoryGroupId
          })
          
          // Update the category in the list
          const index = this.skillCategories.findIndex(cat => cat.id === this.categoryToDelete.id)
          if (index !== -1) {
            // Update with the response from the server which includes group_name
            this.skillCategories[index] = response.data
          }
          
          this.successMessage = 'Skill category updated successfully'
        } else {
          // Add new category
          const response = await skillMatrixApi.createSkillCategory({ 
            name: this.newCategoryName.trim(),
            groupId: this.newCategoryGroupId
          })
          
          // Find the group name for display
          const group = this.skillGroups.find(g => g.id === this.newCategoryGroupId)
          const groupName = group ? group.name : 'Unknown Group'
          
          // Add the new category to the list with group name for display
          const newCategory = {
            ...response.data,
            group_name: groupName
          }
          
          this.skillCategories.push(newCategory)
          
          this.successMessage = 'Skill category added successfully'
        }
        
        this.newDialog = false
        this.newCategoryName = ''
        this.newCategoryGroupId = null
        this.editMode = false
      } catch (error) {
        this.error = 'Failed to ' + (this.editMode ? 'update' : 'add') + ' skill category: ' + (error.response?.data?.error || error.message)
      } finally {
        this.saving = false
      }
    },
    
    confirmDelete(item) {
      this.categoryToDelete = item
      this.deleteDialog = true
    },
    
    async deleteCategory() {
      if (!this.categoryToDelete) return
      
      this.deleting = true
      this.error = null
      
      try {
        await skillMatrixApi.deleteSkillCategory(this.categoryToDelete.id)
        // Remove the deleted category from the list
        this.skillCategories = this.skillCategories.filter(category => category.id !== this.categoryToDelete.id)
        this.successMessage = `Skill category "${this.categoryToDelete.name}" deleted successfully`
        this.deleteDialog = false
        this.categoryToDelete = null
      } catch (error) {
        this.error = 'Failed to delete skill category: ' + (error.response?.data?.error || error.message)
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style>
.skill-management-table .v-data-table__td {
  text-align: left;
}
</style> 