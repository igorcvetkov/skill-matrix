<template>
  <v-responsive>
    <v-app>
      <v-layout class="rounded rounded-md">
        <v-app-bar app>
          <v-toolbar-title>Skill Matrix</v-toolbar-title>
          <!-- <v-switch :model="darkMode" @change="toggleDarkMode" label="Dark or Light"></v-switch> -->
          <v-spacer></v-spacer>
          <template v-if="authStore.isAuthenticated">
            <span>{{ authStore.user?.name }}</span>
            <v-btn text @click="logout">Logout</v-btn>
          </template>
          <v-btn to="/login" text v-else>Login</v-btn>
        </v-app-bar>

        <v-navigation-drawer location="left" permanent app>
          <v-list>
            <v-list-item title="Projects" :to="{ name: 'Projects' }" router></v-list-item>
            <v-list-item title="Skill Groups" :to="{ name: 'SkillGroups', params: {} }" router></v-list-item>
            <v-list-item title="Skill Categories" :to="{ name: 'SkillCategories' }" router></v-list-item>
            <v-list-item title="Skills" :to="{ name: 'Skills' }" router></v-list-item>
            <v-list-item title="Project Skills" :to="{ name: 'ProjectSkills' }" router></v-list-item>
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
  <div>
    {{ authStore }}
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useAuthStore } from "@/store/authStore";

export default {
  name: "MainLayout",
  components: {},
  // props: {
  //   user: {
  //     type: Object,
  //     required: true, // Ensure user prop is passed
  //   },
  // },
  // watch: {
  //   state(newValue) {
  //     this.authState = newValue;
  //   },
  // },
  data() {
    return {
      darkMode: false,
      // authState: state,
      // user: state.user,
      // isAuthenticated: state.isAuthenticated,
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
