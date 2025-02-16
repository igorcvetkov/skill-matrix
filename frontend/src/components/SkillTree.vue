<template>
  <v-progress-circular v-if="isLoading" indeterminate :size="128" :width="12"></v-progress-circular>
  <!-- {{ currentFilter }} -->

  <div v-for="group in availableGroups" :key="group.id">
    <v-chip
      color="primary"
      :variant="selectedGroupId == group.id ? 'elevated' : 'outlined'"
      v-on:click="groupSelected(group)"
      class="md-1 ma-2"
      >Group: {{ group.name }}</v-chip
    >
    <div v-for="groupcat in group.categories" :key="groupcat.id">
      <v-chip color="secondary" variant="outlined" v-on:click="categorySelected(groupcat)" class="ms-5 ma-2">
        Category: {{ groupcat.name }}
      </v-chip>
      <div v-for="catskill in groupcat.skills" :key="catskill.id">
        <v-chip variant="text" class="ms-10 ma-2"> Skill: {{ catskill.skill_name }} </v-chip>
        <v-btn v-if="selectable" variant="tonal" size="x-small" v-on:click="skillSelected(catskill.id)">select</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import skillService from "@/services/skillService";
import categoryGroupService from "@/services/categoryGroupService";
import categoryService from "@/services/categoryService";
import personSkillService from "@/services/personSkillService";

export default {
  props: {
    selectable: {
      type: Boolean,
      default: false,
    },
    context: {
      type: String,
      default: "skill",
      validator: (value) => {
        const allowedValues = ["skill", "person", "project"];
        return allowedValues.includes(value);
      },
    },
    filter: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["nodeSelect", "skillSelect"],
  data() {
    return {
      availableGroups: [],
      availableCategories: [],
      skills: [],
      selectedGroupId: null,
      selectedSkillId: null,
      isLoading: false,
      currentFilter: this.filter,
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      await this.loadGroups();
    },
    // data methods
    async loadSkill() {
      this.isLoading = true;
      try {
        let response;
        if (this.context === "skill") {
          response = await skillService.load(this.filter);
        }
        if (this.context === "person") {
          response = await personSkillService.load(this.filter);
        }
        let category = this.availableCategories.find((item) => item.id == this.selectedCategoryId);
        category.skills = response;
        this.error = null;
        return response;
      } catch (error) {
        console.error("Error loading skill :", error);
        throw error;
      } finally {
        this.isLoading = false;
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
    // ui handlers
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

      this.sendGroupSelected();
    },
    async categorySelected(value) {
      this.selectedCategoryId = value.id;
      if (this.selectedCategoryId) {
        this.currentFilter.categoryId = this.selectedCategoryId;
        await this.loadSkill();
      }
    },
    skillSelected(skillId) {
      this.selectedSkillId = skillId;
      this.sendSkillSelected();
    },
    // events
    sendGroupSelected() {
      this.$emit("nodeSelect", { type: "group", value: this.selectedGroupId });
    },
    sendSkillSelected() {
      this.$emit("nodeSelect", { type: "skill", value: this.selectedSkillId });
      this.$emit("skillSelect", this.selectedSkillId);
    },
  },
};
</script>
