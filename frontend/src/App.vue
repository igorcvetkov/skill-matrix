<template>
  <button @click="login">Login</button>
  <button @click="logout">Logout</button>
  <div v-if="user">
    <h2>Hello, {{ user.name }}</h2>
  </div>
  <!-- <HeaderBarLink></HeaderBarLink> -->
  <!-- <HelloWorld></HelloWorld> -->
  <MainLayout></MainLayout>
</template>

<script>
import { msalInstance } from "./config/msalConfig";
import MainLayout from "./components/MainLayout.vue";

export default {
  name: "App",
  components: {
    MainLayout,
  },
  data() {
    return {
      user: null,
    };
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
  },
  async mounted() {
    await msalInstance.initialize();
    // Handle redirect response
    msalInstance
      .handleRedirectPromise()
      .then((response) => {
        if (response) {
          this.user = response.account; // Set the user if login was successful
        } else {
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            this.user = accounts[0]; // Set the user if already logged in
          }
        }
      })
      .catch((error) => {
        console.error("Redirect error:", error);
      });
  },
};
</script>
