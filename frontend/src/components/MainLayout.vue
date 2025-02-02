<template>
  <v-responsive>
    <v-app>
      <v-layout class="rounded rounded-md">
        <v-app-bar app>
          <v-toolbar-title>Skill Matrix</v-toolbar-title>
          <v-switch :model="darkMode" @change="toggleDarkMode" label="Dark or Light"></v-switch>
          <v-spacer></v-spacer>
          {{ user.name }}
          <span v-if="isAuthenticated">{{ user.name }}</span>
          <v-btn text @click="logout" v-if="isAuthenticated">Logout</v-btn>
          <v-btn text v-else @click="login">Login</v-btn>
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
import { msalInstance, state, getAccessToken } from "@/config/msalConfig";
import jwt_decode from "jwt-decode"; // Make sure to install this package

export default {
  components: {},
  // props: {
  //   user: {
  //     type: Object,
  //     required: true, // Ensure user prop is passed
  //   },
  // },
  data() {
    return {
      darkMode: false,
      authState: state,
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    };
  },
  setup() {
    // Accessing the reactive state
    // const isAuthenticated = state.isAuthenticated;
    // const user = state.user;
    // return {
    //   isAuthenticated,
    //   user,
    // };
  },
  methods: {
    login() {
      const loginRequest = {
        scopes: ["User.Read"], // Add any scopes you need
      };

      msalInstance.loginRedirect(loginRequest).catch((error) => {
        console.error("Login error:", error);
      });
    },
    logout() {
      msalInstance.logout();
    },
    toggleDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      this.darkMode = !this.darkMode;
    },
  },
  async mounted() {
    await msalInstance.initialize();
    // Handle redirect response
    msalInstance
      .handleRedirectPromise()
      .then(async (response) => {
        if (response) {
          console.debug("response ", response);
          this.user = response.account; // Set the user if login was successful
        } else {
          const accounts = msalInstance.getAllAccounts();
          console.debug("accounts", accounts);

          if (accounts.length > 0) {
            this.user = accounts[0]; // Set the user if already logged in
            state.user = accounts[0];
            state.isAuthenticated = true;
          }
        }

        const responseToken = await getAccessToken();
        console.debug("response token ", responseToken);
        const decodedToken = jwt_decode(responseToken);
        state.roles = decodedToken?.roles;
        console.debug("roles ", state.roles);
      })
      .catch((error) => {
        console.error("Redirect error:", error);
      });
  },
};
</script>
