<template>
  <v-select
    class="mt-2"
    label="Filter by group"
    :items="availableGroups"
    item-title="name"
    item-value="id"
    clearable
    v-model="selectedGroupId"
    variant="solo-filled"
    @update:model-value="groupSelected"
    :menu-props="{ maxHeight: 'unset' }"
  ></v-select>
</template>

<script>
import categoryGroupService from "@/services/categoryGroupService";

export default {
  data() {
    return {
      availableGroups: [],
      selectedGroupId: null,
    };
  },
  //   lifecycle hooks
  created() {
    this.init();
  },
  methods: {
    init() {
      this.loadGroups();
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

    // ui handlers
    groupSelected() {
      this.group = this.availableGroups.find((item) => item.id == this.selectedGroupId);
      this.sendSelectedEvent();
    },
    // events
    sendSelectedEvent() {
      this.$emit("selected", { value: this.selectedGroupId });
    },
  },
};
</script>
