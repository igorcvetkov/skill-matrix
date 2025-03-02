<template>
  <skill-page-layout :error="error">
    <template v-slot:title>
      Project: <strong>{{ project.name }}</strong>
    </template>

    <template v-slot:title-actions>
      <v-btn v-if="projectId" @click="changeProject" size="small" variant="outlined" class="ml-2">Change Project</v-btn>
    </template>

    <template v-slot:main-top>
      <!-- project selector -->
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
      </v-expansion-panels>
    </template>
    <template v-slot:main>
      <v-tabs v-model="currentTab" class="position-sticky">
        <v-tab value="skills">Skills</v-tab>
        <v-tab value="chart">Chart</v-tab>
      </v-tabs>
      <v-divider class="mb-2"></v-divider>
      <v-tabs-window v-model="currentTab" class="border">
        <v-tabs-window-item value="skills" key="skills" class="pa-0">
          <skill-filter @change="handleFilterChange" class="border"></skill-filter>
          <v-divider thickness="2" class="mt-4"></v-divider>

          <!-- mobile vuew -->
          <!-- Tabs for Skills -->
          <template v-if="$vuetify.display.smAndDown">
            <v-tabs v-model="skillsTab" class="elevation-1">
              <v-tab>Available</v-tab>
              <v-tab>In Project</v-tab>
            </v-tabs>
            <v-divider></v-divider>
            <v-tabs-window v-model="skillsTab" class="border">
              <v-tabs-window-item value="available" key="available" class="pa-0">
                <skill-list title="" :available-skills="availableSkills">
                  <template v-slot:actions="{ id }">
                    <v-btn icon="mdi-plus" color="green" size="small" @click.stop="addSkillToProject(id)"> </v-btn>
                  </template>
                </skill-list>
              </v-tabs-window-item>
              <v-tabs-window-item value="selected" key="selected" class="pa-0">
                <skill-list title="" :available-skills="projectSkills">
                  <template v-slot:actions="{ id }">
                    <v-btn color="red" icon="mdi-delete" @click.stop="confirmDelete(id)"></v-btn>
                  </template>
                </skill-list>
              </v-tabs-window-item>
            </v-tabs-window>
          </template>

          <template v-else>
            <v-row>
              <v-col cols="12" md="6">
                <skill-list title="Available" :available-skills="availableSkills">
                  <template v-slot:actions="{ id }">
                    <v-btn icon="mdi-plus" color="green" size="small" @click.stop="addSkillToProject(id)"> </v-btn>
                  </template>
                </skill-list>
              </v-col>
              <v-col cols="12" md="6">
                <skill-list title="Used in Project" :available-skills="projectSkills">
                  <template v-slot:actions="{ id }">
                    <v-btn color="red" icon="mdi-delete" @click.stop="confirmDelete(id)"></v-btn>
                  </template>
                </skill-list>
              </v-col>
            </v-row>
          </template>
        </v-tabs-window-item>
        <v-tabs-window-item value="chart" key="chart">
          <!-- <v-container> -->
          <v-btn @click="handleGroupSummary">Update Chart</v-btn>
          <radar-chart :chart-data-complete="chartData"></radar-chart>
          <!-- </v-container> -->
        </v-tabs-window-item>
      </v-tabs-window>
    </template>
  </skill-page-layout>

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
import projectSkillService from "@/services/projectSkillService";
import skillService from "@/services/skillService";
import SkillFilter from "@/components/SkillFilter.vue";
import SkillList from "@/components/SkillList.vue";
import RadarChart from "@/charts/RadarChart.vue";
import { useDisplay } from "vuetify";
import SkillPageLayout from "@/layouts/SkillPageLayout.vue";

export default {
  components: {
    SkillFilter,
    SkillList,
    RadarChart,
    SkillPageLayout,
  },
  computed: {
    isMobile() {
      return useDisplay().smAndDown;
    },
  },
  data() {
    return {
      currentTab: "skills",
      skillsTab: "available",
      columnWidth: 2,
      projectSkills: [],
      availableProjects: [],
      availableSkills: [],
      projectId: null,
      project: {},
      currentFilter: {},
      skill: {},
      selectedSkillId: null,
      newSkillId: null,
      newProjectId: null,
      error: null,
      projectSkillIdToDelete: null,
      confirmDeleteDialog: false,
      skillIdToDelete: null,
      currentPanel: "project",
      chartLabels: ["label1", "label2", "label3"],
      chartDataSet: [
        {
          label: "Character A",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          data: [80, 70, 90],
        },
      ],
      chartData: {},
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

    async loadSkills() {
      try {
        this.availableSkills = await skillService.load({
          ...this.currentFilter,
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
          ...this.currentFilter,
          projectId: this.projectId,
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
    handleFilterChange(event) {
      this.currentFilter = event;
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
        this.loadSkills();
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

      this.project = this.availableProjects.find((item) => item.id == projectId);
      if (!this.project) {
        this.resetProject();
      } else {
        this.fetchProjectSkills();
      }
    },
    resetProject() {
      this.projectId = null;
      this.$router.push({ name: "ProjectSkills" });

      this.availableSkills = [];

      this.project = {};
      this.currentPanel = "project";
    },
    async handleGroupSummary() {
      const response = await projectSkillService.groupSummary(this.projectId);
      this.chartLabels = response.map((item) => item.group_name);
      this.chartDataSet[0].data = response.map((item) => item["count(id)"]);
      this.chartData = {
        labels: this.chartLabels,
        datasets: this.chartDataSet,
      };
    },
  },
};
</script>

<style scoped></style>
