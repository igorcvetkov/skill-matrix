<template>
  <v-card elevation="2">
    <template v-if="title">
      <v-card-title>{{ title }}</v-card-title>
      <v-divider></v-divider>
    </template>
    <v-container>
      <!-- {{ hasSkills }} -->
      <v-list dense v-if="hasSkills">
        <v-list-item v-for="skillItem in availableSkills" :key="skillItem.id" :class="{ 'pa-0': isMobile }">
          <v-row :class="{ 'no-gutters': isMobile }">
            <v-col>
              <v-list-item-title class="text-wrap">{{ skillItem.skill_name }}</v-list-item-title>
              <v-list-item-subtitle> {{ skillItem.group_name }}: {{ skillItem.category_name }} </v-list-item-subtitle>
            </v-col>
            <v-col cols="auto">
              <slot name="actions" v-bind="skillItem"></slot>
            </v-col>
            <!-- <v-col cols="12"> </v-col> -->
          </v-row>
          <v-divider class="ma-2"></v-divider>
        </v-list-item>
      </v-list>
      <v-empty-state v-else>No skills availabe. Try apply filters.</v-empty-state>
    </v-container>
  </v-card>
</template>
<script>
import { useDisplay } from "vuetify";
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
  computed: {
    isMobile() {
      return useDisplay().smAndDown;
    },
    hasSkills() {
      return this.availableSkills && this.availableSkills.length > 0;
    },
  },
};
</script>

<style scoped>
.text-wrap {
  white-space: normal;
  word-break: break-word;
}
</style>
