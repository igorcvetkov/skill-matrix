<template>
  <v-card class="align-start">
    <v-toolbar title="Projects">
      <v-spacer></v-spacer>
      <v-btn variant="elevated" class="mr-5" size="small" @click="newProjectDialog = true" title="btn"
        ><v-icon>mdi-plus</v-icon>add new</v-btn
      >
    </v-toolbar>
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <v-list class="align-start">
        <v-list-item v-for="project in projects" :key="project.id" @click="selectProject(project)" class="align-start">
          <v-list-item-title>{{ project.name }}</v-list-item-title>
          <template v-slot:append>
            <v-list-item-action>
              <v-btn icon :to="{ name: 'ProjectSkills', params: { projectId: project.id } }" router>
                <v-icon>mdi-view-list</v-icon>
              </v-btn>
              <v-btn @click.stop="confirmDeleteProject(project.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
          <v-divider></v-divider>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>

  <!-- new project -->
  <v-dialog v-model="newProjectDialog" max-width="500px">
    <v-card title="New Project">
      <v-card-text>
        <v-form v-on:submit="handleAddProject" @submit.prevent>
          <v-text-field variant="outlined" v-model="newName" label="Project Name" required></v-text-field>
          <v-btn type="submit">Add Project</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- configrmation to delete project -->
  <v-dialog v-model="confirmDeleteDialog" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-text>Are you sure you want to delete this project?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="deleteProject">Yes</v-btn>
        <v-btn color="red darken-1" text @click="confirmDeleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import projectService from "@/services/projectService";

export default {
  data() {
    return {
      projects: [], // Array to hold Project
      newName: "", // Model for new  name input
      selected: null, // Track the selected Project
      error: null,
      projectIdToDelete: null,
      confirmDeleteDialog: false,
      newProjectDialog: false,
    };
  },
  created() {
    this.loadProjects(); // Load Project  when the component is created
  },
  methods: {
    async loadProjects() {
      try {
        const response = await projectService.loadProjects();
        this.projects = response; // Assuming the API returns an array of Project
        this.error = null;
      } catch (error) {
        console.error("Error loading projects :", error);
        this.error = error.message;
      }
    },
    async handleAddProject() {
      console.debug("Creating new  " + this.newName);
      const newProject = {
        name: this.newName,
      };
      try {
        const response = projectService.insert(newProject);
        this.projects.push(response);
        this.error = null;
        this.newName = ""; // Clear input field
      } catch (error) {
        console.error("Error adding project :", error);
        this.error = error.message;
      } finally {
        this.newProjectDialog = false;
      }
    },
    async deleteProject() {
      try {
        projectService.delete(this.projectIdToDelete);
        this.projects = this.projects.filter((project) => project.id !== this.projectIdToDelete);
        this.error = null;
      } catch (error) {
        console.error("Error deleting project :", error);
        this.error = error.message;
      } finally {
        this.confirmDeleteDialog = false;
        this.projectIdToDelete = null;
      }
    },
    selectProject(project) {
      this.selected = project;
    },
    confirmDeleteProject(projectId) {
      this.projectIdToDelete = projectId; // Store the ID of the project to delete
      this.confirmDeleteDialog = true; // Show the confirmation dialog
    },
  },
};
</script>
