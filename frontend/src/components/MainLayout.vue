<template>
  {{ this.$vuetify.theme.name }}
  <v-responsive>
    <v-app>
      <v-layout class="rounded rounded-md">
        <v-app-bar app>
          <v-toolbar-title>Skill Matrix</v-toolbar-title>
          <v-switch :model="darkMode" @change="toggleDarkMode" label="Dark or Light"></v-switch>
          <v-spacer></v-spacer>{{ user.name }}
          <v-btn text>logout</v-btn>
        </v-app-bar>

        <v-navigation-drawer location="left" permanent>
          <v-list>
            <v-list-item title="Projects" :to="{ name: 'Projects' }" router></v-list-item>
            <v-list-item title="Skill Groups" :to="{ name: 'SkillGroups' }" router></v-list-item>
            <v-list-item title="Skill Categories" :to="{ name: 'SkillCategories' }" router></v-list-item>
            <v-list-item title="Skills" :to="{ name: 'Skills' }" router></v-list-item>
            <v-list-item title="Project Skills" :to="{ name: 'ProjectSkills' }" router></v-list-item>
          </v-list>
        </v-navigation-drawer>

        <v-main>
          <v-container>
            <RouterView></RouterView>
          </v-container>
        </v-main>
      </v-layout>
    </v-app>
  </v-responsive>
</template>

<script>
export default {
  components: {},
  props: {
    user: {
      type: Object,
      required: true, // Ensure user prop is passed
    },
  },
  data() {
    return {
      darkMode: false,
    };
  },

  methods: {
    toggleDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      this.darkMode = !this.darkMode;
    },
  },
};
</script>
