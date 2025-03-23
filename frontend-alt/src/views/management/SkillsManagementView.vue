<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Skills Management</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openNewDialog"
          >
            Add Skill
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
          :items="skills"
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

                  <span class="ms-4">Category: {{ item.value }}</span>
                </div>
              </td>
            </tr>
          </template>
          <template #[`item.name`]="{ item }">
            <div class="text-start">{{ item.skill_name || item.name }}</div>
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
          <template #no-data>
            <div class="text-center py-4">
              No skills found
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    
    <!-- Add New Skill Dialog -->
    <v-dialog v-model="newDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Skill' : 'Add New Skill' }}</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveSkill">
            <v-text-field
              v-model="newSkillName"
              label="Skill Name"
              required
              :rules="[v => !!v || 'Skill name is required']"
              class="mb-4"
            ></v-text-field>
            
            <v-select
              v-model="newCategoryId"
              label="Select Category"
              :items="availableCategories"
              item-title="name"
              item-value="id"
              required
              :rules="[v => !!v || 'Category is required']"
              class="mb-4"
            ></v-select>
            
            <v-textarea
              v-model="newSkillDescription"
              label="Description (Optional)"
              rows="3"
              auto-grow
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="newDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveSkill" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Delete Skill</v-card-title>
        <v-card-text>
          Are you sure you want to delete the skill "{{ skillToDelete?.name }}"?
          <v-alert
            type="warning"
            density="compact"
            class="mt-3"
          >
            This will also remove this skill from all users and projects that have it!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn 
            color="error" 
            @click="deleteSkill" 
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
  name: 'SkillsManagementView',
  data() {
    return {
      loading: false,
      saving: false,
      deleting: false,
      error: null,
      successMessage: null,
      skillGroups: [],
      availableCategories: [],
      skills: [],
      newDialog: false,
      deleteDialog: false,
      newSkillName: '',
      newSkillDescription: '',
      newCategoryId: null,
      skillToDelete: null,
      editMode: false,
      skillToEdit: null,
      headers: [
        { title: 'ID', key: 'id', sortable: true, width: '80px' },
        { title: 'Name', key: 'name', sortable: true, align: 'start' },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: '100px' }
      ],
      groupBy: [{ key: 'category_name', order: 'asc' }]
    }
  },
  computed: {
    ...mapGetters(['isAdmin'])
  },
  mounted() {
    this.loadGroups()
    this.loadAllCategories()
    this.loadAllSkills()
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
    
    async loadAllCategories() {
      try {
        const response = await skillMatrixApi.getSkillCategories()
        this.availableCategories = response.data || []
      } catch (error) {
        this.error = 'Failed to load skill categories: ' + (error.response?.data?.error || error.message)
      }
    },
    
    async loadAllSkills() {
      this.loading = true
      this.error = null
      
      try {
        const response = await skillMatrixApi.getSkills()
        this.skills = (response.data || []).map(skill => ({
          ...skill,
          skill_name: skill.skill_name || skill.name
        }))
      } catch (error) {
        this.error = 'Failed to load skills: ' + (error.response?.data?.error || error.message)
      } finally {
        this.loading = false
      }
    },
    
    openNewDialog() {
      this.newSkillName = ''
      this.newSkillDescription = ''
      this.newCategoryId = null
      this.newDialog = true
      this.editMode = false
      this.skillToEdit = null
      
      // Focus the input field after dialog opens
      setTimeout(() => {
        if (this.$refs.form) {
          const input = this.$refs.form.$el.querySelector('input')
          if (input) input.focus()
        }
      }, 100)
    },

    openEditDialog(item) {
      this.skillToEdit = item
      this.newSkillName = item.skill_name || item.name
      this.newSkillDescription = item.description || ''
      this.newCategoryId = item.category_id
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
    
    saveSkill() {
      if (this.editMode) {
        this.updateSkill()
      } else {
        this.addSkill()
      }
    },

    async updateSkill() {
      if (!this.newSkillName.trim()) {
        this.error = 'Skill name is required'
        return
      }
      
      if (!this.newCategoryId) {
        this.error = 'Category is required'
        return
      }
      
      this.saving = true
      this.error = null
      
      try {
        await skillMatrixApi.updateSkill(this.skillToEdit.id, {
          name: this.newSkillName.trim(),
          category_id: this.newCategoryId,
          description: this.newSkillDescription.trim() || null
        })
        
        // Find category and group names for display
        const category = this.availableCategories.find(c => c.id === this.newCategoryId)
        
        // Update the skill in the list
        const index = this.skills.findIndex(s => s.id === this.skillToEdit.id)
        if (index !== -1) {
          this.skills[index] = {
            ...this.skills[index],
            name: this.newSkillName.trim(),
            skill_name: this.newSkillName.trim(),
            category_id: this.newCategoryId,
            category_name: category ? category.name : 'Unknown Category',
            description: this.newSkillDescription.trim() || null
          }
        }
        
        this.successMessage = 'Skill updated successfully'
        this.newDialog = false
        this.newSkillName = ''
        this.newSkillDescription = ''
        this.newCategoryId = null
        this.skillToEdit = null
        this.editMode = false
      } catch (error) {
        this.error = 'Failed to update skill: ' + (error.response?.data?.error || error.message)
      } finally {
        this.saving = false
      }
    },
    
    async addSkill() {
      if (!this.newSkillName.trim()) {
        this.error = 'Skill name is required'
        return
      }
      
      if (!this.newCategoryId) {
        this.error = 'Category is required'
        return
      }
      
      this.saving = true
      this.error = null
      
      try {
        const response = await skillMatrixApi.createSkill({
          name: this.newSkillName.trim(),
          category_id: this.newCategoryId,
          description: this.newSkillDescription.trim() || null
        })
        
        // Find category and group names for display
        const category = this.availableCategories.find(c => c.id === this.newCategoryId)
        const group = this.skillGroups.find(g => g.id === category?.group_id)
        
        // Add the new skill to the list with category and group names for display
        const newSkill = {
          ...response.data,
          category_name: category ? category.name : 'Unknown Category',
          group_name: group ? group.name : 'Unknown Group'
        }
        
        this.skills.push(newSkill)
        this.successMessage = 'Skill added successfully'
        this.newDialog = false
        this.newSkillName = ''
        this.newSkillDescription = ''
        this.newCategoryId = null
      } catch (error) {
        this.error = 'Failed to add skill: ' + (error.response?.data?.error || error.message)
      } finally {
        this.saving = false
      }
    },
    
    confirmDelete(item) {
      this.skillToDelete = item
      this.deleteDialog = true
    },
    
    async deleteSkill() {
      if (!this.skillToDelete) return
      
      this.deleting = true
      this.error = null
      
      try {
        await skillMatrixApi.deleteSkill(this.skillToDelete.id)
        // Remove the deleted skill from the list
        this.skills = this.skills.filter(skill => skill.id !== this.skillToDelete.id)
        this.successMessage = `Skill "${this.skillToDelete.name}" deleted successfully`
        this.deleteDialog = false
        this.skillToDelete = null
      } catch (error) {
        this.error = 'Failed to delete skill: ' + (error.response?.data?.error || error.message)
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