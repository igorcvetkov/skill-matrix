<template>
  <v-card class="align-start">
    <v-toolbar>
      <v-toolbar-title>
        <v-row no-gutters>
          <v-col cols="4">Project Skills</v-col>
          <v-col cols="8">
            {{ project.name }} <v-chip v-if="projectId" @click="changeProject" size="x-small">Change Project</v-chip>
          </v-col>
        </v-row>
      </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <v-expansion-panels v-model="currentPanel">
        <v-expansion-panel value="project" v-if="projectId == null">
          <v-expansion-panel-title>
            <v-row no-gutters>
              <v-col cols="4"> Project:</v-col>
              <v-col cols="8">
                {{ project.name }}
              </v-col>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list
              selectable
              slim
              :items="availableProjects"
              item-value="id"
              item-title="name"
              v-on:click:select="projectSelected"
            >
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel value="group">
          <v-expansion-panel-title>
            <v-row no-gutters>
              <v-col cols="4">Group:</v-col>
              <v-col cols="8">
                {{ group.name }}
              </v-col>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list
              selectable
              slim
              :items="availableGroups"
              item-value="id"
              item-title="name"
              v-on:click:select="groupSelected"
            >
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel value="category">
          <v-expansion-panel-title>
            <v-row no-gutters>
              <v-col cols="4">Category:</v-col>
              <v-col cols="8">
                {{ category.name }}
              </v-col>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list
              selectable
              slim
              :items="availableCategories"
              item-value="id"
              item-title="name"
              v-on:click:select="categorySelected"
            >
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-card subtitle="Skills">
        <v-card-text>
          <v-row>
            <v-col>
              <v-card title="Available">
                <v-list>
                  <v-list-item v-for="skillItem in availableSkills" :key="skillItem.id">
                    <v-list-item-title>{{ skillItem.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip class="ma-1" size="x-small">Group: {{ skillItem.group_name }}</v-chip>
                      <v-chip class="ma-1" size="x-small">Category: {{ skillItem.category_name }}</v-chip>
                    </v-list-item-subtitle>
                    <template v-slot:prepend>
                      <v-list-item-action class="mr-1">
                        <v-btn color="white" size="small" @click.stop="addSkillToProject(skillItem.id)" icon>
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            <v-col>
              <v-card title="In Project">
                <v-card-text>
                  <v-data-iterator :items="projectSkills" items-per-page="-1">
                    <template v-slot:default="{ items }">
                      <v-row>
                        <v-col cols="columnWidth">Group</v-col>
                        <v-col cols="columnWidth">Category</v-col>
                        <v-col cols="columnWidth">Skill</v-col>
                        <v-col cols="columnWidth">Action</v-col>
                      </v-row>
                      <template v-for="(item, i) in items" :key="i">
                        <v-row>
                          <v-col cols="columnWidth">{{ item.raw.group_name }}</v-col>
                          <v-col cols="columnWidth">{{ item.raw.category_name }}</v-col>
                          <v-col cols="columnWidth">{{ item.raw.skill_name }}</v-col>
                          <v-col cols="columnWidth" align-content="end">
                            <v-btn icon="mdi-delete" @click.stop="confirmDelete(item.raw.id)"></v-btn>
                          </v-col>
                        </v-row>
                      </template>
                    </template>
                  </v-data-iterator> </v-card-text
              ></v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>

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
import projectService from "@/services/projectService";
import categoryGroupService from "@/services/categoryGroupService";
import categoryService from "@/services/categoryService";
import projectSkillService from "@/services/projectSkillService";
import skillService from "@/services/skillService";

export default {
  data() {
    return {
      columnWidth: 2,
      projectSkills: [],
      availableCategories: [],
      availableGroups: [],
      availableProjects: [],
      availableSkills: [],
      categoryId: null,
      groupId: null,
      projectId: null,
      project: {},
      group: {},
      category: {},
      skill: {},
      selectedSkillId: null,
      newSkillId: null,
      newProjectId: null,
      error: null,
      projectSkillIdToDelete: null,
      confirmDeleteDialog: false,
      skillIdToDelete: null,
      currentPanel: "project",
    };
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      await this.loadProjects();
      const routeParam = Number(this.$route.params.projectId);
      console.log("routerParam", routeParam);
      // this.projectId = isNaN(routeParam) ? null : routeParam;
      if (!isNaN(routeParam) && routeParam != null) {
        this.selectProject(routeParam);
      }
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
        this.availableCategories = await categoryService.load({ groupId: this.groupId });
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    async loadSkills() {
      try {
        this.availableSkills = await skillService.load({
          categoryId: this.categoryId,
          excludeProjectId: this.projectId,
        });
        this.error = null;
      } catch (error) {
        console.error("Error loading skill skills:", error);
        this.error = error.message;
      }
    },
    async fetchProjectSkills() {
      try {
        this.projectSkills = await projectSkillService.loadProjectSkills({
          projectId: this.projectId,
          groupId: this.groupId,
          categoryId: this.categoryId,
        }); // Assuming the API returns an array of Project
        this.error = null;
      } catch (error) {
        console.error("Error loading ProjectSkills :", error);
        this.error = error.message;
      }
    },
    // handling ui events
    changeProject() {
      this.resetProject();
    },
    projectSelected(event) {
      this.selectProject(event.id);
    },
    groupSelected(event) {
      this.groupId = event.id;
      this.group = this.availableGroups.find((item) => item.id == this.groupId);
      this.currentPanel = "category";
      this.loadCategories();
      this.fetchProjectSkills();
    },
    categorySelected(event) {
      this.categoryId = event.id;
      this.category = this.availableCategories.find((item) => item.id == this.categoryId);
      this.currentPanel = "skill";
      this.loadSkills();
      this.fetchProjectSkills();
    },
    async addSkillToProject(event) {
      const newProjectSkill = {
        projectId: this.projectId,
        skillId: event,
      };
      try {
        await projectSkillService.add(newProjectSkill);
        this.loadSkills();
        this.fetchProjectSkills();
      } catch (error) {
        console.error("Error adding project :", error);
        this.error = error.message;
      }
    },
    async deleteProjectSkill() {
      try {
        await projectSkillService.delete(this.skillIdToDelete);
        this.projectSkills = this.projectSkills.filter((project) => project.id !== this.skillIdToDelete);
        this.error = null;
      } catch (error) {
        console.error("Error deleting project :", error);
        this.error = error.message;
      } finally {
        this.confirmDeleteDialog = false;
        this.projectIdToDelete = null;
      }
    },
    confirmDelete(skillId) {
      this.skillIdToDelete = skillId; // Store the ID of the project to delete
      this.confirmDeleteDialog = true; // Show the confirmation dialog
    },
    selectProject(projectId) {
      this.projectId = projectId;
      this.$router.push({ name: "ProjectSkills", params: { projectId: projectId } });

      this.groupId = null;
      this.categoryId = null;

      this.group = {};
      this.category = {};

      this.project = this.availableProjects.find((item) => item.id == projectId);
      if (!this.project) {
        this.resetProject();
      } else {
        this.currentPanel = "group";
        this.loadGroups();
        this.fetchProjectSkills();
      }
    },
    resetProject() {
      this.projectId = null;
      this.$router.push({ name: "ProjectSkills" });

      this.groupId = null;
      this.categoryId = null;

      this.group = {};
      this.category = {};

      this.availableSkills = [];
      this.availableGroups = [];
      this.availableCategories = [];
      this.project = {};
      this.currentPanel = "project";
    },
  },
};
</script>
