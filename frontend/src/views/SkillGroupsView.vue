<template>
  <v-card class="align-start">
    <v-toolbar title=" Skills Groups">
      <v-spacer></v-spacer>
      <v-btn variant="elevated" size="small" @click="newDialog = true" title="btn"
        ><v-icon>mdi-plus</v-icon>add new</v-btn
      >
    </v-toolbar>
    <!-- Error message display -->
    <v-alert v-if="error" type="error" dismissible>
      {{ error }}
    </v-alert>

    <v-list class="align-start">
      <v-list-item v-for="group in skillGroups" :key="group.id" @click="selectSkillGroup(group)" class="align-start">
        <v-list-item-title>{{ group.name }}</v-list-item-title>
        <template v-slot:append>
          <v-list-item-action>
            <v-btn icon :to="{ name: 'SkillCategories', params: { groupId: group.id } }" router>
              <v-icon>mdi-view-list</v-icon>
            </v-btn>
            <v-btn @click.stop="confirmDeleteSkillGroup(group.id)" icon>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
  </v-card>

  <!-- new skill group -->
  <v-dialog v-model="newDialog" max-width="500px">
    <v-card title="New Group">
      <v-card-text>
        <v-form v-on:submit="handleAddSkillGroup" @submit.prevent>
          <v-text-field v-model="newGroupName" label="Group Name" required></v-text-field>
          <v-btn type="submit">Add Skill Group</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- configrmation to delete -->
  <v-dialog v-model="confirmDeleteDialog" persistent max-width="500px">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-text>Are you sure you want to delete this group?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="deleteGroup">Yes</v-btn>
        <v-btn color="red darken-1" text @click="confirmDeleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import categoryGroupService from "@/services/categoryGroupService";
import { backendUrl } from "@/config/appConfig";

export default {
  data() {
    return {
      skillGroups: [], // Array to hold skill groups
      newGroupName: "", // Model for new group name input
      selectedGroup: null, // Track the selected skill group
      error: null,
      newDialog: false,
      confirmDeleteDialog: false,
      groupToDeleteId: null,
    };
  },
  created() {
    this.loadSkillGroups(); // Load skill groups when the component is created
  },
  methods: {
    async loadSkillGroups() {
      try {
        this.skillGroups = await categoryGroupService.load();
        console.log(this.skillGroups);
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    async handleAddSkillGroup() {
      const newGroup = {
        name: this.newGroupName,
      };
      try {
        const response = await axios.post(`${backendUrl}/api/skill-groups`, newGroup);
        this.skillGroups.push(response.data); // Assuming the API returns an array of skill groups
        this.error = null;
      } catch (error) {
        console.error("Error adding skill group:", error);
        this.error = error.message;
      } finally {
        this.newGroupName = ""; // Clear input field
        this.newDialog = false;
      }
    },
    confirmDeleteSkillGroup(id) {
      this.groupToDeleteId = id;
      this.confirmDeleteDialog = true;
    },
    async deleteGroup() {
      console.debug("Deleting group " + this.groupToDeleteId);
      const id = this.groupToDeleteId;

      try {
        await axios.delete(`${backendUrl}/api/skill-groups/` + id);
        this.skillGroups = this.skillGroups.filter((group) => group.id !== id);
        this.error = null;
      } catch (error) {
        console.error("Error deleting skill group:", error);
        this.error = error.message;
      } finally {
        this.groupToDeleteId = null;
        this.confirmDeleteDialog = false;
      }
    },
    selectSkillGroup(group) {
      this.selectedGroup = group;
    },
  },
};
</script>
