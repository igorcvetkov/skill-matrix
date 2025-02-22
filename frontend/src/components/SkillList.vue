<template>
  <v-card :title="title">
    <v-list>
      <v-list-item v-for="skillItem in availableSkills" :key="skillItem.id">
        <v-list-item-title>{{ skillItem.skill_name }}</v-list-item-title>
        <v-list-item-subtitle>
          <v-chip class="ma-1" size="x-small">Group: {{ skillItem.group_name }}</v-chip>
          <v-chip class="ma-1" size="x-small">Category: {{ skillItem.category_name }}</v-chip>
        </v-list-item-subtitle>
        <template v-slot:prepend>
          <slot name="actions" v-bind="skillItem"></slot>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "Skills",
    },
    availableSkills: {
      type: Array,
      regired: true,
      default: () => {
        [];
      },
    },
  },
  components: {},
};
</script>
