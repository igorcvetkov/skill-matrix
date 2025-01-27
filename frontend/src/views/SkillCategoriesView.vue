<template>
  <v-card title="Skill Categories" class="align-start">
    <v-card-text>
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      Filter:
      <v-select
        v-model="selectedGroupId"
        :items="availableGroups"
        item-title="name"
        item-value="id"
        label="Group"
        variant="outlined"
      ></v-select>

      Rows:
      <v-list class="align-start">
        <v-list-item
          v-for="category in categories"
          :key="category.id"
          @click="selectSkillcategory(category)"
          class="align-start"
        >
          <v-list-item-title>{{ category.name }}</v-list-item-title>
          <template v-slot:append>
            <v-list-item-action>
              <v-btn @click.stop="deleteCategory(category.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>

  <v-card title="New Category">
    <!-- New Category -->
    <v-card-text>
      <v-form v-on:submit="handleAdd" @submit.prevent>
        <v-select
          variant="outlined"
          v-model="selectedGroupId"
          :items="availableGroups"
          item-title="name"
          item-value="id"
          label="Group"
          required
        ></v-select>
        <v-text-field variant="outlined" v-model="newCategoryName" label="category Name" required></v-text-field>
        <v-btn type="submit">Add Skill category</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      categories: [], // Array to hold skill categories
      availableGroups: [],
      newCategoryName: "", // Model for new category name input
      selectedGroupId: null, // Track the selected skill category
      error: null,
    };
  },
  created() {
    this.loadData(); // Load skill categories when the component is created
    this.loadGroups();
  },
  methods: {
    async loadData() {
      try {
        const response = await axios.get("http://localhost:3000/api/skill-categories");
        this.categories = response.data; // Assuming the API returns an array of skill categories
        this.error = null;
      } catch (error) {
        console.error("Error loading skill categories:", error);
        this.error = error.message;
      }
    },
    async loadGroups() {
      try {
        const response = await axios.get("http://localhost:3000/api/skill-groups");
        this.availableGroups = response.data; // Assuming the API returns an array of skill groups
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    async handleAdd() {
      console.debug("Creating new category " + this.newCategoryName);
      const newCategory = {
        name: this.newCategoryName,
        groupId: this.selectedGroupId,
      };
      try {
        const response = await axios.post("http://localhost:3000/api/skill-categories", newCategory);
        this.categories.push(response.data); // Assuming the API returns an array of skill categories
        this.error = null;
        this.newCategoryName = ""; // Clear input field
      } catch (error) {
        console.error("Error adding skill category:", error);
        this.error = error.message;
      }
    },
    async deleteCategory(id) {
      console.debug("Deleting category " + id);

      try {
        await axios.delete("http://localhost:3000/api/skill-categories/" + id);
        this.categories = this.categories.filter((category) => category.id !== id);
        this.error = null;
      } catch (error) {
        console.error("Error deleting skill category:", error);
        this.error = error.message;
      }
    },
    selectSkillcategory(category) {
      this.selectedcategory = category;
    },
  },
};
</script>
