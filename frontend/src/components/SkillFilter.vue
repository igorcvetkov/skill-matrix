<template>
  <!-- </v-card> -->
  <v-expansion-panels v-model="currentPanel" variant="accordion">
    <v-expansion-panel value="group">
      <v-expansion-panel-title>
        <v-row no-gutters>
          <v-col cols="4">Group:</v-col>
          <v-col cols="8">
            {{ group.name }}
          </v-col>
        </v-row>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-list
          selectable
          slim
          :items="availableGroups"
          item-value="id"
          item-title="name"
          v-on:click:select="groupSelected"
        >
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel value="category">
      <v-expansion-panel-title>
        <v-row no-gutters>
          <v-col cols="4">Category:</v-col>
          <v-col cols="8">
            {{ category.name }}
          </v-col>
        </v-row>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pa-0 ma-0">
        <v-list
          selectable
          slim
          :items="availableCategories"
          item-value="id"
          item-title="name"
          item-props="{class:'ma-0 mp-0'}"
          v-on:click:select="categorySelected"
        >
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import categoryGroupService from "@/services/categoryGroupService";
import categoryService from "@/services/categoryService";

export default {
  data() {
    return {
      filterSheet: false,
      availableGroups: [],
      availableCategories: [],
      groupId: null,
      categoryId: null,
      group: {},
      category: {},
      currentPanel: "",
      selectedGroupId: null,
    };
  },
  created() {
    this.init();
  },
  methods: {
    // controller logic methods
    async init() {
      await this.loadGroups();
    },
    // data methods
    async loadGroups() {
      try {
        this.availableGroups = await categoryGroupService.load();
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    async loadCategories() {
      try {
        this.availableCategories = await categoryService.load({ groupId: this.groupId });
        this.error = null;
      } catch (error) {
        console.error("Error loading skill groups:", error);
        this.error = error.message;
      }
    },
    // ui element event handlers
    groupSelectedId() {
      this.group = this.availableGroups.find((item) => item.id == this.groupId);
      this.currentPanel = "category";
      this.categoryId = null;
      this.loadCategories();
      this.sendFilterChangeEvent();
    },
    categorySelectedId() {
      this.category = this.availableCategories.find((item) => item.id == this.categoryId);
      this.currentPanel = "";
      this.sendFilterChangeEvent();
    },
    groupSelected(event) {
      console.debug("groupselected", event);
      this.groupId = event.id;
      this.group = this.availableGroups.find((item) => item.id == this.groupId);
      this.currentPanel = "category";
      this.categoryId = null;
      this.loadCategories();
      this.sendFilterChangeEvent();
    },
    categorySelected(event) {
      this.categoryId = event.id;
      this.category = this.availableCategories.find((item) => item.id == this.categoryId);
      this.currentPanel = "";
      this.sendFilterChangeEvent();
    },

    // component events
    sendFilterChangeEvent() {
      this.$emit("change", { groupId: this.groupId, categoryId: this.categoryId });
    },
  },
};
</script>
