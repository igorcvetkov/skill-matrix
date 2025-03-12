<template>
  <template v-if="variant === 'select'">
    <group-select @selected="groupSelected"></group-select>

    <v-select
      class="mt-2"
      label="Filter by category"
      :items="availableCategories"
      item-title="name"
      item-value="id"
      clearable
      v-model="categoryId"
      variant="solo-filled"
      @update:model-value="categorySelected"
      :menu-props="{ maxHeight: 'unset' }"
    ></v-select>
  </template>
  <template v-else>
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
</template>

<script>
import categoryGroupService from "@/services/categoryGroupService";
import categoryService from "@/services/categoryService";
import GroupSelect from "@/components/GroupSelect";

export default {
  props: {
    variant: {
      type: String,
      default: "select",
    },
  },
  components: {
    GroupSelect,
  },
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
    groupSelected(event) {
      this.groupId = event.value;
      this.group = this.availableGroups.find((item) => item.id == this.groupId);
      this.currentPanel = "category";
      this.categoryId = null;
      this.loadCategories();
      this.sendFilterChangeEvent();
    },
    categorySelected() {
      // this.categoryId = event.id;
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
