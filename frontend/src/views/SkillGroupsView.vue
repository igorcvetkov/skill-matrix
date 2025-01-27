<template>
  <v-card title="Skill Groups" class="align-start">
    <!-- Error message display -->
    <v-alert v-if="error" type="error" dismissible>
      {{ error }}
    </v-alert>

    <v-list class="align-start">
      <v-list-item v-for="group in skillGroups" :key="group.id" @click="selectSkillGroup(group)" class="align-start">
        <v-list-item-title>{{ group.name }}</v-list-item-title>
        <template v-slot:append>
          <v-list-item-action>
            <v-btn @click.stop="deleteSkillGroup(group.id)" icon>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
  </v-card>

  <v-form v-on:submit="handleAddSkillGroup" @submit.prevent>
    <v-text-field v-model="newGroupName" label="Group Name" required></v-text-field>
    <v-btn type="submit">Add Skill Group</v-btn>
  </v-form>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      skillGroups: [], // Array to hold skill groups
      newGroupName: "", // Model for new group name input
      selectedGroup: null, // Track the selected skill group
      error: null,
    };
  },
  created() {
    this.loadSkillGroups(); // Load skill groups when the component is created
  },
  methods: {
    async loadSkillGroups() {
      try {
        const response = await axios.get("http://localhost:3000/api/skill-groups");
        this.skillGroups = response.data; // Assuming the API returns an array of skill groups
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    async handleAddSkillGroup() {
      console.debug("Creating new group " + this.newGroupName);
      const newGroup = {
        name: this.newGroupName,
      };
      try {
        const response = await axios.post("http://localhost:3000/api/skill-groups", newGroup);
        this.skillGroups.push(response.data); // Assuming the API returns an array of skill groups
        this.error = null;
        this.newGroupName = ""; // Clear input field
      } catch (error) {
        console.error("Error adding skill group:", error);
        this.error = error.message;
      }
    },
    async deleteSkillGroup(id) {
      console.debug("Deleting group " + id);

      try {
        await axios.delete("http://localhost:3000/api/skill-groups/" + id);
        this.skillGroups = this.skillGroups.filter((group) => group.id !== id);
        this.error = null;
      } catch (error) {
        console.error("Error deleting skill group:", error);
        this.error = error.message;
      }
    },
    selectSkillGroup(group) {
      this.selectedGroup = group;
    },
  },
};
</script>
