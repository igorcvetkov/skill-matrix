<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Projects Management</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openNewDialog"
          >
            Add Project
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
          :items="projects"
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
                @click="viewProject(item)"
                variant="text"
                class="mr-1"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
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
    
    <!-- Add New Project Dialog -->
    <v-dialog v-model="newDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Project' : 'Add New Project' }}</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveProject">
            <v-text-field
              v-model="newProjectName"
              label="Project Name"
              required
              :rules="[v => !!v || 'Project name is required']"
              class="mb-4"
            ></v-text-field>
            
            <v-textarea
              v-model="newProjectDescription"
              label="Description (Optional)"
              rows="3"
              auto-grow
            ></v-textarea>
            <v-select
                v-if="editMode"
                v-model="selectedUserId"
                :items="availableUsers"
                item-value="id"
                item-title="name"
                label="Assign Project Member"
                return-object
                class="mb-4"
                hint="Select a user to assign as a member"
                persistent-hint
            >
            </v-select>
            <v-text-field
                v-if="editMode"
                v-model="newUserEmail"
                label="Or Assign by Email"
                hint="Enter an email if user is not yet registered"
                persistent-hint
                type="email"
                class="mb-4"
                :error="emailError"
                :error-messages="emailErrorMessages"
            />
            <v-switch
                v-if="editMode"
                v-model="assignAsPm"
                label="Assign as Project Manager"
                class="mb-4"
                color="primary"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="newDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveProject" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Delete Project</v-card-title>
        <v-card-text>
          Are you sure you want to delete the project "{{ projectToDelete?.name }}"?
          <v-alert
            type="warning"
            density="compact"
            class="mt-3"
          >
            This will also remove all skill associations with this project!
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn 
            color="error" 
            @click="deleteProject" 
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
  name: 'ProjectsManagementView',
  data() {
    return {
      loading: false,
      saving: false,
      deleting: false,
      error: null,
      successMessage: null,
      projects: [],
      newDialog: false,
      deleteDialog: false,
      newProjectName: '',
      newProjectDescription: '',
      projectToDelete: null,
      selectedUserId: null,
      newUserEmail: '',
      availableUsers: [],
      headers: [
        { title: 'ID', key: 'id', sortable: true, width: '80px' },
        { title: 'Name', key: 'name', sortable: true, align: 'start' },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: '150px' }
      ],
      editMode: false,
      assignAsPm: false
    }
  },
  computed: {
    ...mapGetters(['isAdmin']),
    isValidEmail() {
      return this.newUserEmail === '' || this.validateEmail(this.newUserEmail);
    },
    emailError() {
      return this.newUserEmail !== '' && !this.validateEmail(this.newUserEmail);
    },
    emailErrorMessages() {
      return this.emailError ? ['Invalid email format'] : [];
    }
  },
  mounted() {
    this.loadProjects()
  },
  methods: {
    async loadProjects() {
      this.loading = true
      this.error = null
      
      try {
        const response = await skillMatrixApi.getAllProjects()
        this.projects = response.data || []
      } catch (error) {
        this.error = 'Failed to load projects: ' + (error.response?.data?.error || error.message)
      } finally {
        this.loading = false
      }
    },
    
    viewProject(project) {
      // Navigate to project assessment page with this project selected
      this.$router.push({
        path: '/project-assessment',
        query: { projectId: project.id }
      })
    },
    
    openNewDialog() {
      this.newProjectName = ''
      this.newProjectDescription = ''
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
    
    async openEditDialog(item) {
      this.projectToDelete = item
      this.newProjectName = item.name
      this.newProjectDescription = item.description || ''
      this.editMode = true
      this.newDialog = true
      this.selectedUserId = null;

      try {
        const response = await skillMatrixApi.getAllUsers();
        this.availableUsers = response.data || [];
      } catch (err) {
        this.availableUsers = [];
        console.error('Failed to load users:', err);
      }

      // Focus the input field after dialog opens
      setTimeout(() => {
        if (this.$refs.form) {
          const input = this.$refs.form.$el.querySelector('input')
          if (input) input.focus()
        }
      }, 100)
    },
    
    saveProject() {
      if (this.editMode) {
        this.updateProject()
      } else {
        this.addProject()
      }
    },

    async updateProject() {
      if (!this.newProjectName.trim()) {
        this.error = 'Project name is required';
        return;
      }

      this.saving = true;
      this.error = null;

      try {
        const projectData = {
          name: this.newProjectName.trim(),
          description: this.newProjectDescription.trim() || null
        };

        await skillMatrixApi.updateProject(this.projectToDelete.id, projectData);

        // Update the project in the list
        const index = this.projects.findIndex(project => project.id === this.projectToDelete.id);
        if (index !== -1) {
          this.projects[index] = {
            ...this.projects[index],
            name: this.newProjectName.trim(),
            description: this.newProjectDescription.trim() || null
          };
        }

        const assignmentPayload = {
          projectId: this.projectToDelete.id,
          startDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
          endDate: null,
          is_pm: true // Assigning as project manager
        };

        if (this.selectedUserId) {
          // Assign selected existing user as PM
          try {
            await skillMatrixApi.assignProjectMember({
              ...assignmentPayload,
              personId: this.selectedUserId.id
            });
          } catch (memberErr) {
            console.error('Failed to assign member:', memberErr);
            this.error = 'Project updated, but assigning member failed: ' + (memberErr.response?.data?.error || memberErr.message);
          }
        } else if (this.newUserEmail && this.validateEmail(this.newUserEmail)) {
          // Assign new email-based user as PM
          try {
            const response = await skillMatrixApi.createOrGetPersonByEmail({ email: this.newUserEmail });
            const newPerson = response.data;
            await skillMatrixApi.assignProjectMember({
              ...assignmentPayload,
              personId: newPerson.id
            });
          } catch (emailAssignErr) {
            console.error('Failed to assign email-based member:', emailAssignErr);
            this.error = 'Project updated, but assigning email-based member failed: ' + (emailAssignErr.response?.data?.error || emailAssignErr.message);
          }
        }

        this.successMessage = 'Project updated successfully';
        this.newDialog = false;
        this.newProjectName = '';
        this.newProjectDescription = '';
        this.editMode = false;
      } catch (error) {
        this.error = 'Failed to update project: ' + (error.response?.data?.error || error.message);
      } finally {
        this.saving = false;
      }
    },

    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    async addProject() {
      if (!this.newProjectName.trim()) {
        this.error = 'Project name is required'
        return
      }
      
      this.saving = true
      this.error = null
      
      try {
        const projectData = {
          name: this.newProjectName.trim(),
          description: this.newProjectDescription.trim() || null
        }
        
        const response = await skillMatrixApi.createProject(projectData)
        
        // Add the new project to the list
        const newProject = {
          id: response.data.id,
          name: this.newProjectName.trim()
        }
        
        this.projects.push(newProject)
        this.successMessage = 'Project added successfully'
        this.newDialog = false
        this.newProjectName = ''
        this.newProjectDescription = ''
      } catch (error) {
        this.error = 'Failed to add project: ' + (error.response?.data?.error || error.message)
      } finally {
        this.saving = false
      }
    },
    
    confirmDelete(item) {
      this.projectToDelete = item
      this.deleteDialog = true
    },
    
    async deleteProject() {
      if (!this.projectToDelete) return
      
      this.deleting = true
      this.error = null
      
      try {
        await skillMatrixApi.deleteProject(this.projectToDelete.id)
        // Remove the deleted project from the list
        this.projects = this.projects.filter(project => project.id !== this.projectToDelete.id)
        this.successMessage = `Project "${this.projectToDelete.name}" deleted successfully`
        this.deleteDialog = false
        this.projectToDelete = null
      } catch (error) {
        this.error = 'Failed to delete project: ' + (error.response?.data?.error || error.message)
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