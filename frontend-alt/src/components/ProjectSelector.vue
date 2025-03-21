<template>
  <div class="project-selector">
    <div class="selector-container">
      <v-combobox
        v-model="selectedProject"
        :loading="loading"
        :items="projects"
        item-title="name"
        item-value="id"
        label="Select Project"
        clearable
        return-object
        :disabled="loading"
        density="compact"
        variant="outlined"
        bg-color="surface"
        hide-details
        @update:model-value="handleProjectSelection"
      >
        <template v-slot:prepend-inner>
          <v-icon size="small" color="primary">mdi-clipboard-check</v-icon>
        </template>
        <template v-slot:no-data>
          <v-list-item>
            <v-list-item-title>
              No projects found
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
  name: 'ProjectSelector',
  data() {
    return {
      projects: [],
      selectedProject: null,
      loading: false,
      error: null,
      initialProjectId: null
    };
  },
  computed: {
    ...mapGetters(['currentUser', 'hasRole', 'isAdmin', 'isProjectManager']),
    canManageProjects() {
      return this.hasRole(roles.ADMIN) || this.hasRole(roles.PM);
    }
  },
  created() {
    // Only load projects if the current user has permission
    if (this.canManageProjects) {
      this.loadProjects();
      
      // Check if a project ID is in the route
      const projectId = this.$route.query.projectId;
      if (projectId) {
        // Set as initial selection (will be updated when projects are loaded)
        this.initialProjectId = projectId;
      }
    }
  },
  methods: {
    async loadProjects() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await skillMatrixApi.getAllProjects();
        this.projects = response.data.map(project => ({
          id: project.id,
          name: project.name
        }));
        
        // If there was an initial project ID from the route, select it
        if (this.initialProjectId && this.projects.length > 0) {
          const projectToSelect = this.projects.find(p => p.id == this.initialProjectId);
          if (projectToSelect) {
            this.selectedProject = projectToSelect;
          }
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        this.error = 'Failed to load projects';
      } finally {
        this.loading = false;
      }
    },
    
    handleProjectSelection(project) {
      if (project) {
        this.$emit('project-selected', project.id);
      } else {
        this.$emit('project-selected', null);
      }
    },
    
    clearSelection() {
      this.selectedProject = null;
      this.$emit('project-selected', null);
    }
  },
  watch: {
    // Watch for route changes to update selection
    '$route.query.projectId': {
      handler(newProjectId) {
        if (newProjectId && this.projects.length > 0) {
          // Find and select the project
          const projectToSelect = this.projects.find(p => p.id == newProjectId);
          if (projectToSelect && (!this.selectedProject || this.selectedProject.id != newProjectId)) {
            this.selectedProject = projectToSelect;
          }
        } else if (!newProjectId && this.selectedProject) {
          // Clear selection if the route doesn't have a project ID
          this.selectedProject = null;
        }
      }
    }
  }
};
</script>

<style scoped>
.project-selector {
  width: 100%;
}

.selector-container {
  display: flex;
  flex-direction: column;
}

.selected-project-chip {
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style> 