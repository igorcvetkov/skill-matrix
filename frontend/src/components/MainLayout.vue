<template>
  <v-responsive>
    <v-app>
      <v-layout class="rounded rounded-md">
        <v-app-bar app>
          <v-toolbar-title>Skill Matrix</v-toolbar-title>
          <!-- <v-switch :model="darkMode" @change="toggleDarkMode" label="Dark or Light"></v-switch> -->
          <v-spacer></v-spacer>
          <template v-if="authStore.isAuthenticated">
            <span>{{ authStore?.user?.name }}</span>
            <v-btn text @click="logout">Logout</v-btn>
          </template>
          <v-btn to="/login" text v-else>Login</v-btn>
        </v-app-bar>

        <v-navigation-drawer location="left" permanent app>
          <v-list>
            <template v-if="authStore?.roles.includes('admin')">
              <v-list-item title="Config" disabled type="subheader"></v-list-item>
              <v-list-item title="Projects" :to="{ name: 'Projects' }" router></v-list-item>
              <v-list-item title="Skill Groups" :to="{ name: 'SkillGroups', params: {} }" router></v-list-item>
              <v-list-item title="Skill Categories" :to="{ name: 'SkillCategories' }" router></v-list-item>
              <v-list-item title="Skills" :to="{ name: 'Skills' }" router></v-list-item>
            </template>
            <v-list-item title="Skills" disabled type="subheader"></v-list-item>
            <v-list-item title="Project Skills" :to="{ name: 'ProjectSkills' }" router></v-list-item>
            <v-list-item title="Person Skills" :to="{ name: 'PersonSkills' }" router></v-list-item>
          </v-list>
        </v-navigation-drawer>

        <v-main>
          <v-container>
            <router-view></router-view>
          </v-container>
        </v-main>
      </v-layout>
    </v-app>
  </v-responsive>
</template>

<script>
import { useAuthStore } from "@/store/authStore";

export default {
  name: "MainLayout",
  components: {},
  data() {
    return {
      darkMode: false,
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
