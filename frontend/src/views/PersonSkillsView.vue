<template>
  <v-card class="align-start">
    <v-toolbar>
      <v-toolbar-title>
        <v-row no-gutters>
          <v-col cols="4">Person Skills</v-col>
          <v-col cols="8">
            {{ person.name ?? person.person_id }}
            <v-chip v-if="personId" @click="changePerson" size="x-small">Change Person</v-chip>
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
        <v-expansion-panel value="person" v-if="personId == null">
          <v-expansion-panel-title>
            <v-row no-gutters>
              <v-col cols="4"> Person:</v-col>
              <v-col cols="8">
                {{ person.name }}
              </v-col>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list
              selectable
              slim
              :items="availablePersons"
              item-value="person_id"
              item-title="person_id"
              v-on:click:select="personSelected"
            >
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <skill-filter @change="handleFilterChange"></skill-filter>

      <v-card subtitle="Skills">
        <v-card-text>
          <v-row>
            <v-col>
              <skill-list title="Available" :available-skills="availableSkills">
                <template v-slot:actions="{ id }">
                  <v-btn icon="mdi-plus" color="white" size="small" @click.stop="addSkillToPerson(id)"> </v-btn>
                </template>
              </skill-list>
            </v-col>
            <v-col>
              <skill-list title="Assigned to person" :available-skills="personSkills">
                <template v-slot:actions="{ id }">
                  <v-btn icon="mdi-delete" @click.stop="confirmDelete(id)"></v-btn>
                </template>
              </skill-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>

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
