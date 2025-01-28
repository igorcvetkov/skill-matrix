<template>
  {{ $route.params.projectId }}pid
  {{ projectId }}
  <v-card class="align-start">
    <v-toolbar title="Project Skills">
      <v-spacer></v-spacer>
      <v-btn variant="elevated" @click="newItemDialog = true" title="btn"><v-icon>mdi-plus</v-icon>add new</v-btn>
    </v-toolbar>
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <v-toolbar dense floating>
        <!-- <v-text-field prepend-icon="mdi-magnify" hide-details single-line></v-text-field> -->
        <v-select
          label="Project"
          v-model="projectId"
          :items="availableProjects"
          item-title="name"
          item-value="id"
        ></v-select>
        <v-select label="Group" v-model="groupId" :items="availableGroups" item-title="name" item-value="id"></v-select>
        <v-select label="Category"></v-select>
      </v-toolbar>

      <v-data-iterator :items="projectSkills">
        <template v-slot:default="{ items }">
          <v-row>
            <v-col cols="columnWidth">Project</v-col>
            <v-col cols="columnWidth">Group</v-col>
            <v-col cols="columnWidth">Category</v-col>
            <v-col cols="columnWidth">Skill</v-col>
            <v-col cols="columnWidth">Action</v-col>
          </v-row>
          <template v-for="(item, i) in items" :key="i">
            <v-row>
              <v-col cols="columnWidth">{{ item.raw.project_name }}</v-col>
              <v-col cols="columnWidth">{{ item.raw.group_name }}</v-col>
              <v-col cols="columnWidth">{{ item.raw.category_name }}</v-col>
              <v-col cols="columnWidth">{{ item.raw.skill_name }}</v-col>
              <v-col cols="columnWidth" align-content="end">
                <v-btn icon="mdi-pencil"></v-btn>
                <v-btn icon="mdi-delete" @click.stop="confirmDelete(item.raw.id)"></v-btn>
              </v-col>
            </v-row>
            <!-- Project : Group : {{ item.raw.group_name }} Category :{{ item.raw.category_name }} Skill :
            {{ item.raw.skill_name }} -->
            <!-- <br /> -->
          </template>
        </template>
      </v-data-iterator>

      <!-- <v-list class="align-start">
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
      </v-list> -->
    </v-card-text>
  </v-card>

  <!-- <v-card title="Add Skill to Project">
    <v-card-text>
      <v-form v-on:submit="handleAddProjectSkill" @submit.prevent>
        <v-select
          variant="outlined"
          v-model="projectId"
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
  <v-dialog v-model="confirmDeleteDialog" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-text>Are you sure you want to delete this skill from project?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="deleteProjectSkill">Yes</v-btn>
        <v-btn color="red darken-1" text @click="confirmDeleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import projectService from "@/services/projectService";
import categoryGroupService from "@/services/categoryGroupService";
import projectSkillService from "@/services/projectSkillService";

export default {
  data() {
    return {
      columnWidth: 2,
      projectSkills: [], // Array to hold Project
      availableCategories: [],
      availableGroups: [],
      availableProjects: [],
      availableSkills: [],
      selectedCategoryId: null,
      groupId: null,
      projectId: null,
      selectedSkillId: null,
      newSkillId: null,
      newProjectId: null,
      error: null,
      projectSkillIdToDelete: null,
      confirmDeleteDialog: false,
    };
  },
  created() {
    this.initData();
    this.projectId = Number(this.$route.params.projectId);
  },
  watch: {
    projectId(newValue) {
      this.$router.push({ name: "ProjectSkills", params: { projectId: newValue } });
    },
  },
  methods: {
    async initData() {
      await this.loadProjects();
      await this.loadGroups();
      await this.fetchProjectSkills();
    },
    async loadProjects() {
      try {
        this.availableProjects = await projectService.loadProjects();
        this.error = null;
      } catch (error) {
        this.error = error;
      }
    },
    async loadGroups() {
      try {
        this.availableGroups = await categoryGroupService.load();
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    async loadCategories() {
      try {
        this.availableGroups = await categoryGroupService.load();
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    async fetchProjectSkills() {
      try {
        this.projectSkills = await projectSkillService.loadProjectSkills({ projectId: this.projectId }); // Assuming the API returns an array of Project
        this.error = null;
      } catch (error) {
        console.error("Error loading ProjectSkills :", error);
        this.error = error.message;
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
    confirmDelete(skillId) {
      this.skillIdToDelete = skillId; // Store the ID of the project to delete
      this.confirmDeleteDialog = true; // Show the confirmation dialog
    },
  },
};
</script>
