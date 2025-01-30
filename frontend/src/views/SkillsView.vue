<template>
  g {{ selectedGroupId }} c {{ selectedCategoryId }}
  <v-card class="align-start">
    <v-toolbar title="Skills">
      <v-spacer></v-spacer>
      <v-btn variant="elevated" @click="newDialog = true" title="btn"><v-icon>mdi-plus</v-icon>add new</v-btn>
      <v-btn variant="elevated" @click="newBulkDialog = true" title="btn"><v-icon>mdi-plus</v-icon>add bulk</v-btn>
    </v-toolbar>
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <v-row>
        <v-col cols="4">
          <v-card title="Group Filter">
            <v-card-text>
              <v-list
                selectable
                slim
                v-model:selected="selectedGroupId"
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
                v-model:selected="selectedCategoryId"
                :items="availableCategories"
                item-value="id"
                item-title="name"
                v-on:click:select="categorySelected"
              ></v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-list class="align-start">
        <v-list-item v-for="skill in skills" :key="skill.id" @click="selectSkill(skill)" class="align-start">
          <v-list-item-title>{{ skill.name }}</v-list-item-title>
          <template v-slot:append>
            <v-list-item-action>
              <v-btn @click.stop="deleteSkill(skill.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
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
</template>

<script>
import categoryGroupService from "@/services/categoryGroupService";
import categoryService from "@/services/categoryService";
import axios from "axios";

export default {
  watch: {
    selectedGroupId(newValue) {
      this.loadCategories();
    },
    selectedCategoryId() {
      this.loadSkill();
    },
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
    };
  },
  async created() {
    await this.loadGroups();
    await this.loadCategories();
    await this.loadSkill(); // Load skill  when the component is created
  },
  methods: {
    async loadSkill() {
      try {
        const response = await axios.get("http://localhost:3000/api/skills");
        this.skills = response.data; // Assuming the API returns an array of skill
        this.error = null;
      } catch (error) {
        console.error("Error loading skill :", error);
        this.error = error.message;
      }
    },
    async loadCategories() {
      try {
        const response = await categoryService.load({ groupId: this.selectedGroupId });
        this.availableCategories = response; // Assuming the API returns an array of skill groups
        this.error = null;
      } catch (error) {
        console.error("Error loading skill categories:", error);
        this.error = error.message;
      }
    },

    async loadGroups() {
      try {
        const response = await categoryGroupService.load();
        this.availableGroups = response; // Assuming the API returns an array of skill groups
        this.error = null;
      } catch (error) {
        console.error("Error loading skill categories:", error);
        this.error = error.message;
      }
    },
    async handleAddSkill() {
      console.debug("Creating new  " + this.newName);
      const newSkill = {
        name: this.newName,
        category_id: this.selectedCategoryId,
      };
      try {
        const response = await axios.post("http://localhost:3000/api/skills", newSkill);
        this.skills.push(response.data); // Assuming the API returns an array of skill
        this.error = null;
        this.newName = ""; // Clear input field
      } catch (error) {
        console.error("Error adding skill :", error);
        this.error = error.message;
      }
    },
    async deleteSkill(id) {
      console.debug("Deleting skill " + id);

      try {
        await axios.delete("http://localhost:3000/api/skills/" + id);
        this.skills = this.skills.filter((skill) => skill.id !== id);
        this.error = null;
      } catch (error) {
        console.error("Error deleting skill :", error);
        this.error = error.message;
      }
    },
    selectSkill(skill) {
      this.selected = skill;
    },
  },
};
</script>
