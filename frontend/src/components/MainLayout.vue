<template>
  <v-responsive>
    <v-app>
      <v-layout column>
        <v-app-bar app dense elevation="1">
          <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

          <v-toolbar-title>Skill Matrix</v-toolbar-title>
          <v-spacer></v-spacer>

          <template v-if="authStore.isAuthenticated">
            <span>{{ authStore?.user?.name }}</span>
            <v-btn text @click="logout">Logout</v-btn>
          </template>
          <v-btn to="/login" text v-else>Login</v-btn>
        </v-app-bar>

        <v-navigation-drawer v-model="drawer" location="left" app>
          <v-list>
            <template v-if="authStore?.roles.includes('admin')">
              <v-list-item subtitle="Setup"> </v-list-item>
              <v-divider></v-divider>
              <v-list-item title="Projects" :to="{ name: 'Projects' }" router></v-list-item>
              <v-list-item title="Skill Groups" :to="{ name: 'SkillGroups', params: {} }" router></v-list-item>
              <v-list-item title="Skill Categories" :to="{ name: 'SkillCategories' }" router></v-list-item>
              <v-list-item title="Skills" :to="{ name: 'Skills' }" router></v-list-item>
            </template>
            <v-divider></v-divider>
            <v-list-item subtitle="Skills"> </v-list-item>
            <v-divider></v-divider>
            <v-list-item title="Project Skills" :to="{ name: 'ProjectSkills' }" router></v-list-item>
            <v-list-item title="Person Skills" :to="{ name: 'PersonSkills' }" router></v-list-item>
          </v-list>
        </v-navigation-drawer>
        <v-main class="fill-height">
          <!-- <v-container class="ma-0 pa-0"> -->
          <router-view></router-view>
          <!-- </v-container> -->
        </v-main>
      </v-layout>
    </v-app>
  </v-responsive>
</template>

<script>
import { useAuthStore } from "@/store/authStore";

export default {
  components: {},
  data() {
    return {
      darkMode: false,
      drawer: false,
    };
  },
  setup() {
    const authStore = useAuthStore();

    const logout = () => {
      authStore.logout();
    };

    return {
      logout,
      authStore,
    };
  },
  methods: {},
};
</script>
