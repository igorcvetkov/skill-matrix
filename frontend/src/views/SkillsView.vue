<template>
  <v-card title="Skills" class="align-start">
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

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
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      skills: [], // Array to hold skill
      availableCategories: [],
      selectedCategoryId: null,
      newName: "", // Model for new  name input
      selected: null, // Track the selected skill
      error: null,
    };
  },
  created() {
    this.loadSkill(); // Load skill  when the component is created
    this.loadCategories();
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
        const response = await axios.get("http://localhost:3000/api/skill-categories");
        this.availableCategories = response.data; // Assuming the API returns an array of skill groups
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
