<template>
  <v-card class="align-start">
    <v-card-title class="bg-primary text-white pa-3">
      <v-row>
        <v-col>
          <slot name="title"></slot>
          <v-spacer></v-spacer>
        </v-col>
        <v-col cols="auto">
          <slot name="title-actions"></slot>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text :class="{ 'ma-0 pa-0': $vuetify.display.smAndDown }">
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <slot name="main-top"></slot>
      <v-tabs v-model="currentTab" class="position-sticky">
        <v-tab value="skills">Skills</v-tab>
        <v-tab value="chart">Chart</v-tab>
      </v-tabs>
      <v-divider class="mb-2"></v-divider>
      <v-tabs-window v-model="currentTab" class="border">
        <v-tabs-window-item value="skills" key="skills" class="pa-0">
          <slot name="tab-skills"></slot>
        </v-tabs-window-item>
        <v-tabs-window-item value="chart" key="chart">
          <slot name="tab-chart">
            <v-empty-state text="Not implemented yet"></v-empty-state>
          </slot>
        </v-tabs-window-item>
      </v-tabs-window>
      <slot name="main"></slot>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    error: {
      type: String,
      default: null,
    },
  },
  data() {
    return { currentTab: "skills" };
  },
};
</script>
