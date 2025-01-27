<template>
  <v-card title="Project Skills" class="align-start">
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <v-list class="align-start">
        <v-list-item v-for="projectSkill in projectSkills" :key="projectSkill.id" class="align-start">
          <v-list-item-title>{{ projectSkill.project_name }}</v-list-item-title>
          <v-list-item-subtitle> {{ projectSkill.skill_name }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-list-item-action>
              <v-btn @click.stop="confirmDeleteProjectSkill(projectSkill.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>

  <!-- <v-card title="Add Skill to Project">
    <v-card-text>
      <v-form v-on:submit="handleAddProjectSkill" @submit.prevent>
        <v-select
          variant="outlined"
          v-model="selectedProjectId"
          :items="availableProjects"
          item-title="name"
          item-value="id"
          label="Project"
          required
        ></v-select>
        <v-select
          variant="outlined"
          v-model="selectedGroupId"
          :items="availableGroups"
          item-title="name"
          item-value="id"
          label="Group"
          required
        ></v-select>
        <v-select
          variant="outlined"
          v-model="selectedCategoryId"
          :items="availableCategories"
          item-title="name"
          item-value="id"
          label="Skill"
          required
        ></v-select>
        <v-select
          variant="outlined"
          v-model="selectedSkillId"
          :items="availableSkills"
          item-title="name"
          item-value="id"
          label="Skill"
          required
        ></v-select>
        <v-btn type="submit">Add Project Skill</v-btn>
      </v-form>
    </v-card-text>
  </v-card> -->

  <!-- configrmation to delete project -->
  <!-- <v-dialog v-model="confirmDeleteDialog" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-text>Are you sure you want to delete this skill from project?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="deleteProjectSkill">Yes</v-btn>
        <v-btn color="red darken-1" text @click="confirmDeleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->
</template>

<script>
import axios from "axios";
import projectService from "@/services/projectService";
import projectSkillService from "@/services/projectSkillService";

export default {
  data() {
    return {
      projectSkills: [], // Array to hold Project
      availableCategories: [],
      availableGroups: [],
      availableProjects: [],
      availableSkills: [],
      selectedCategoryId: null,
      selectedGroupId: null,
      selectedProjectId: null,
      selectedSkillId: null,
      newSkillId: null,
      newProjectId: null,
      error: null,
      projectSkillIdToDelete: null,
      confirmDeleteDialog: false,
    };
  },
  created() {
    this.fetchProjectSkills();
  },
  methods: {
    async loadProjects() {
      try {
        this.availableProjects = projectService.loadProjects();
        this.error = null;
      } catch (error) {
        this.error = error;
      }
    },
    async fetchProjectSkills() {
      try {
        this.projectSkills = await projectSkillService.loadProjectSkills(); // Assuming the API returns an array of Project
        console.log(this.projectSkills);
        this.error = null;
      } catch (error) {
        console.error("Error loading ProjectSkills :", error);
        this.error = error.message;
      } finally {
        console.log("fetched");
      }
    },
    async handleAddProject() {
      console.debug("Creating new  " + this.newName);
      const newProject = {
        name: this.newName,
      };
      try {
        const response = await axios.post("http://localhost:3000/api/ProjectSkills", newProject);
        this.ProjectSkills.push(response.data); // Assuming the API returns an array of Project
        this.error = null;
        this.newName = ""; // Clear input field
      } catch (error) {
        console.error("Error adding project :", error);
        this.error = error.message;
      }
    },
    async deleteProject() {
      console.debug("Deleting project skill " + this.projectIdToDelete);

      try {
        await axios.delete("http://localhost:3000/api/ProjectSkills/" + this.projectIdToDelete);
        this.ProjectSkills = this.ProjectSkills.filter((project) => project.id !== this.projectIdToDelete);
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
