<template>
  <skill-page-layout :error="error">
    <template v-slot:title>{{ person.name ?? person.person_id }}</template>
    <template v-slot:title-actions>
      <v-btn v-if="personId" @click="changePerson" size="small" variant="outlined" class="ml-2">Change Person</v-btn>
    </template>
    <template v-slot:main-top>
      <v-expansion-panels v-model="currentPanel">
        <v-expansion-panel value="person" v-if="personId == null" title="Select Person">
          <v-list
            selectable
            slim
            :items="availablePersons"
            item-value="person_id"
            item-title="person_id"
            v-on:click:select="personSelected"
          >
          </v-list>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

    <template v-slot:main>
      <v-tabs v-model="currentTab">
        <v-tab value="skills">Skills</v-tab>
        <v-tab value="chart">Chart</v-tab>
      </v-tabs>
      <v-divider class="mb-2"></v-divider>
      <v-tabs-window v-model="currentTab" class="border">
        <v-tabs-window-item value="skills" key="skills" class="pa-0">
          <skill-filter @change="handleFilterChange"></skill-filter>
          <v-divider thickness="2" class="mt-4"></v-divider>

          <!-- mobile vuew -->
          <!-- Tabs for Skills -->
          <template v-if="$vuetify.display.smAndDown">
            <v-tabs v-model="skillsTab" class="elevation-1">
              <v-tab>Available</v-tab>
              <v-tab>Selected</v-tab>
            </v-tabs>
            <v-divider></v-divider>
            <v-tabs-window v-model="skillsTab" class="border">
              <v-tabs-window-item value="available" key="available" class="pa-0">
                <skill-list title="" :available-skills="availableSkills">
                  <template v-slot:actions="{ id }">
                    <v-btn icon="mdi-plus" color="green" size="small" @click.stop="addSkillToPerson(id)"> </v-btn>
                  </template>
                </skill-list>
              </v-tabs-window-item>
              <v-tabs-window-item value="selected" key="selected" class="pa-0">
                <skill-list title="" :available-skills="personSkills">
                  <template v-slot:actions="{ id }">
                    <v-btn color="red" icon="mdi-delete" size="small" @click.stop="confirmDelete(id)"></v-btn>
                  </template>
                </skill-list>
              </v-tabs-window-item>
            </v-tabs-window>
          </template>
          <!-- desktop -->
          <template v-else>
            <v-row>
              <v-col cols="12" md="6">
                <skill-list title="Available" :available-skills="availableSkills">
                  <template v-slot:actions="{ id }">
                    <v-btn icon="mdi-plus" color="green" size="small" @click.stop="addSkillToPerson(id)"> </v-btn>
                  </template>
                </skill-list>
              </v-col>
              <v-col cols="12" md="6">
                <skill-list title="Selected" :available-skills="personSkills">
                  <template v-slot:actions="{ id }">
                    <v-btn color="red" icon="mdi-delete" @click.stop="confirmDelete(id)"></v-btn>
                  </template>
                </skill-list>
              </v-col>
            </v-row>
          </template> </v-tabs-window-item
      ></v-tabs-window>
    </template>
  </skill-page-layout>

  <!-- confirmation to delete person -->
  <v-dialog v-model="confirmDeleteDialog" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-text>Are you sure you want to delete this skill from person?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="deletePersonSkill">Yes</v-btn>
        <v-btn color="red darken-1" text @click="confirmDeleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import personSkillService from "@/services/personSkillService";
import skillService from "@/services/skillService";
import { useAuthStore } from "@/store/authStore";
import SkillFilter from "@/components/SkillFilter.vue";
import SkillList from "@/components/SkillList.vue";
import personService from "@/services/personService";
import SkillPageLayout from "@/layouts/SkillPageLayout.vue";

export default {
  setup() {
    const authStore = useAuthStore();

    return {
      authStore,
    };
  },
  components: {
    SkillFilter,
    SkillList,
    SkillPageLayout,
  },
  data() {
    return {
      columnWidth: 2,
      personSkills: [],
      availablePersons: [],
      availableSkills: [],
      currentSkillFilter: {},
      personId: this.authStore.user.username,
      person: {
        id: this.authStore.user.username,
        name: this.authStore.user.name,
      },
      skill: {},
      selectedSkillId: null,
      newSkillId: null,
      newpersonId: null,
      error: null,
      personSkillIdToDelete: null,
      confirmDeleteDialog: false,
      skillIdToDelete: null,
      currentPanel: "person",
      currentTab: "skills",
      skillsTab: "available",
    };
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      await this.loadSkills();
      this.fetchPersonSkills();
      const routeParam = this.$route.params.personId;
      console.log("routerParam", routeParam);
      await this.loadPersons();
      if (routeParam) {
        this.selectPerson(routeParam);
      }
    },
    async loadPersons() {
      console.log("load persons");
      try {
        this.availablePersons = await personService.load();
        this.error = null;
      } catch (error) {
        this.error = error;
      }
    },
    async loadSkills() {
      try {
        this.availableSkills = await skillService.load({ ...this.currentSkillFilter, excludePersonId: this.personId });
        this.error = null;
      } catch (error) {
        console.error("Error loading skill skills:", error);
        this.error = error.message;
      }
    },
    async fetchPersonSkills() {
      try {
        this.personSkills = await personSkillService.load({ ...this.currentSkillFilter, personId: this.personId }); // Assuming the API returns an array of person
        this.error = null;
      } catch (error) {
        console.error("Error loading personSkills :", error);
        this.error = error.message;
      }
    },
    // handling ui events
    changePerson() {
      this.resetPerson();
    },
    personSelected(event) {
      this.selectPerson(event.id);
    },
    handleFilterChange(event) {
      this.currentSkillFilter = event;
      this.loadSkills();
      this.fetchPersonSkills();
    },
    async addSkillToPerson(event) {
      const newpersonSkill = {
        personId: this.personId,
        skillId: event,
      };
      try {
        await personSkillService.add(newpersonSkill);
        this.loadSkills();
        this.fetchPersonSkills();
      } catch (error) {
        console.error("Error adding person :", error);
        this.error = error.message;
      }
    },
    async deletePersonSkill() {
      try {
        await personSkillService.delete(this.skillIdToDelete);
        this.personSkills = this.personSkills.filter((person) => person.id !== this.skillIdToDelete);
        this.error = null;
        this.loadSkills();
      } catch (error) {
        console.error("Error deleting person :", error);
        this.error = error.message;
      } finally {
        this.confirmDeleteDialog = false;
        this.personIdToDelete = null;
      }
    },
    confirmDelete(skillId) {
      this.skillIdToDelete = skillId; // Store the ID of the person to delete
      this.confirmDeleteDialog = true; // Show the confirmation dialog
    },
    selectPerson(personId) {
      this.personId = personId;
      // this.$router.push({ name: "PersonSkills", params: { personId: personId } });

      this.groupId = null;
      this.categoryId = null;

      this.group = {};
      this.category = {};

      this.person = this.availablePersons.find((item) => item.person_id == personId);
      if (!this.person) {
        this.resetPerson();
      } else {
        this.currentPanel = "group";
        this.fetchPersonSkills();
      }
    },
    resetPerson() {
      this.personId = null;
      this.$router.push({ name: "PersonSkills" });

      this.groupId = null;
      this.categoryId = null;

      this.group = {};
      this.category = {};

      this.availableSkills = [];
      this.availableGroups = [];
      this.availableCategories = [];
      this.person = {};
      this.currentPanel = "person";
    },
  },
};
</script>
