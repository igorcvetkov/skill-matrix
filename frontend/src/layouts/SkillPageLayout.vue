<template>
  <v-card class="align-start">
    <v-card-title class="bg-primary text-white pa-3">
      <!-- <v-container fluid=""> -->
      <v-row>
        <v-col>
          <slot name="title"></slot>
          <v-spacer></v-spacer>
        </v-col>
        <v-col cols="auto">
          <slot name="title-actions"></slot>
        </v-col>
      </v-row>
      <!-- </v-container> -->
    </v-card-title>

    <v-card-text :class="{ 'ma-0 pa-0': $vuetify.display.smAndDown }">
      <!-- Error message display -->
      <v-alert v-if="error" type="error" dismissible>
        {{ error }}
      </v-alert>

      <slot name="main-top"></slot>
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
  data() {},
};
</script>
