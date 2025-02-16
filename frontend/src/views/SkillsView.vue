<template>
  <v-card class="align-start">
    <v-toolbar title="Skills">
      <v-spacer></v-spacer>
      <v-btn variant="elevated" class="mr-1" size="small" @click="viewAll" title="btn"
        ><v-icon>mdi-plus</v-icon>view all</v-btn
      >
      <v-btn variant="elevated" class="mr-1" size="small" @click="newDialog = true" title="btn"
        ><v-icon>mdi-plus</v-icon>add new</v-btn
      >
      <v-btn variant="elevated" class="mr-5" size="small" @click="newBulkDialog = true" title="btn"
        ><v-icon>mdi-plus</v-icon>add bulk</v-btn
      >
    </v-toolbar>
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <v-tabs align-tabs="center" v-model="currentTab">
        <v-tab value="filter">Filters</v-tab>
        <v-tab value="search">search</v-tab>
        <v-tab value="tree">tree</v-tab>
      </v-tabs>

      <v-tabs-window v-model="currentTab">
        <v-tabs-window-item value="filter" key="filter"
          ><v-row>
            <v-col cols="4">
              <v-card title="Group Filter">
                <v-card-text>
                  <v-list
                    selectable
                    slim
                    :items="availableGroups"
                    item-value="id"
                    item-title="name"
                    v-on:click:select="groupSelected"
                  ></v-list>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card title="Category Filter">
                <v-card-text>
                  <v-list
                    selectable
                    slim
                    :items="availableCategories"
                    item-value="id"
                    item-title="name"
                    v-on:click:select="categorySelected"
                  ></v-list>
                </v-card-text>
              </v-card>
            </v-col> </v-row
        ></v-tabs-window-item>
        <v-tabs-window-item value="search"
          ><!-- Search Input -->
          <v-text-field
            v-model="searchQuery"
            @input="search"
            label="Search for skills, categories, or groups"
            clearable
          ></v-text-field
        ></v-tabs-window-item>
        <v-tabs-window-item value="tree">
          <v-container>
            <SkillTree></SkillTree>
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>

      <v-list>
        <!-- <v-list-item-group> -->
        <v-list-item v-for="item in searchResults" :key="item.id" @click="selectSkillcategory(item)">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
        <!-- </v-list-item-group> -->
      </v-list>

      <v-card>
        <v-list class="align-start" v-if="currentTab != 'tree'">
          <v-list-item v-for="skill in skills" :key="skill.id" @click="selectSkill(skill)" class="align-start">
            <v-list-item-title>{{ skill.skill_name }}</v-list-item-title>
            <template v-slot:append>
              <v-list-item-action>
                <v-btn @click.stop="confirmDelete(skill.id)" icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-card-text>
  </v-card>

  <v-dialog v-model="newDialog" max-width="500px">
    <v-card title="New Skill">
      <v-card-text>
        <v-form v-on:submit="handleAddSkill" @submit.prevent>
          <v-select
            variant="outlined"
            v-model="selectedCategoryId"
            :items="availableCategories"
            item-title="name"
            item-value="id"
            label="Category"
            required
          ></v-select>
          <v-text-field variant="outlined" v-model="newName" label="Skill Name" required></v-text-field>
          <v-btn type="submit">Add Skill</v-btn>
        </v-form>
      </v-card-text>
    </v-card></v-dialog
  >
  <v-dialog v-model="newBulkDialog" max-width="500px">
    <v-card title="Bulk New Skill">
      <v-card-text>
        <v-form v-on:submit="handleAddBulkSkill" @submit.prevent>
          <v-select
            variant="outlined"
            v-model="selectedCategoryId"
            :items="availableCategories"
            item-title="name"
            item-value="id"
            label="Category"
            required
          ></v-select>
          <v-textarea variant="outlined" v-model="newBulkName" label="Skill Names" required></v-textarea>
          <v-btn type="submit">Add Skills</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- configrmation to delete -->
  <v-dialog v-model="confirmDeleteDialog" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-text>Are you sure you want to delete this skill?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="deleteSkill">Yes</v-btn>
        <v-btn color="red darken-1" text @click="confirmDeleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import categoryGroupService from "@/services/categoryGroupService";
import categoryService from "@/services/categoryService";
import skillService from "@/services/skillService";
import axios from "axios";
import { backendUrl } from "@/config/appConfig";
import SkillTree from "@/components/SkillTree.vue";

export default {
  components: {
    SkillTree,
  },
  data() {
    return {
      skills: [], // Array to hold skill
      availableCategories: [],
      selectedCategoryId: null,
      availableGroups: [],
      selectedGroupId: null,
      newName: "", // Model for new  name input
      selected: null, // Track the selected skill
      error: null,
      newDialog: false,
      newBulkDialog: false,
      confirmDeleteDialog: false,
      searchQuery: "",
      searchResults: [],
      currentTab: "filter", // possible options: filter, search, tree
    };
  },
  async created() {
    await this.loadGroups();
  },
  methods: {
    async loadSkill() {
      try {
        const response = await skillService.load({ categoryId: this.selectedCategoryId });
        this.skills = response;
        this.error = null;
      } catch (error) {
        console.error("Error loading skill :", error);
        this.error = error.message;
      }
    },
    async loadCategories() {
      try {
        const response = await categoryService.load({ groupId: this.selectedGroupId });
        this.availableCategories = response;
        this.error = null;
      } catch (error) {
        console.error("Error loading skill categories:", error);
        this.error = error.message;
      }
    },

    async loadGroups() {
      try {
        const response = await categoryGroupService.load();
        this.availableGroups = response;
        this.error = null;
      } catch (error) {
        console.error("Error loading skill categories:", error);
        this.error = error.message;
      }
    },
    // UI Events handlers like button clicks, list item selections
    async groupSelected(value) {
      // clean categories and skills
      this.selectedCategoryId = null;
      this.availableCategories = [];
      this.skills = [];

      // set new value
      this.selectedGroupId = value?.id;
      if (this.selectedGroupId) {
        await this.loadCategories();
        let group = this.availableGroups.find((item) => item.id == this.selectedGroupId);
        group.categories = this.availableCategories;
      }
    },
    async categorySelected(value) {
      this.skills = [];
      this.selectedCategoryId = value.id;
      if (this.selectedCategoryId) {
        await this.loadSkill();
        let category = this.availableCategories.find((item) => item.id == this.selectedCategoryId);
        category.skills = this.skills;
      }
    },
    viewAll() {
      this.groupSelected(null);
      this.loadSkill();
    },
    async handleAddSkill() {
      const newSkill = {
        name: this.newName,
        category_id: this.selectedCategoryId,
      };
      try {
        const response = await axios.post(`${backendUrl}/api/skills`, newSkill);
        this.skills.push(response.data); // Assuming the API returns an array of skill
        this.error = null;
        this.newName = ""; // Clear input field
      } catch (error) {
        console.error("Error adding skill :", error);
        this.error = error.message;
      } finally {
        this.newDialog = false;
      }
    },
    async search() {
      if (this.searchQuery.length > 2) {
        // Start searching after 3 characters
        const response = await skillService.search(this.searchQuery);
        this.searchResults = response;
      } else {
        this.searchResults = [];
      }
    },
    async handleAddBulkSkill() {
      const newSkills = this.newBulkName
        .split("\n")
        .map((item) => {
          return { name: item.trim(), categoryId: this.selectedCategoryId };
        })
        .filter((item) => item);

      try {
        const response = await skillService.bulkInsert(newSkills);
        this.skills.push(response);
        this.error = null;
        this.newBulkName = ""; // Clear input field
      } catch (error) {
        console.error("Error adding skill :", error);
        this.error = error.message;
      } finally {
        this.newBulkDialog = false;
      }
    },
    confirmDelete(id) {
      this.skillIdToDeleteId = id;
      this.confirmDeleteDialog = true;
    },

    async deleteSkill() {
      try {
        await axios.delete(`${backendUrl}/api/skills/` + this.skillIdToDeleteId);
        this.skills = this.skills.filter((skill) => skill.id !== this.skillIdToDeleteId);
        this.error = null;
      } catch (error) {
        console.error("Error deleting skill :", error);
        this.error = error.message;
      } finally {
        this.skillIdToDeleteId = null;
        this.confirmDeleteDialog = false;
      }
    },
    selectSkill(skill) {
      this.selected = skill;
    },
  },
};
</script>
