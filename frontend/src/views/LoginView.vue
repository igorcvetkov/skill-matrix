<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col class="text-center">
        user {{ user }} authstate {{ authStore }}
        <h1>Login</h1>
        <v-btn color="primary" @click="login">Login with Microsoft</v-btn>
        <!-- You can add more login options here in the future -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import { onMounted } from "vue";
import { useAuthStore } from "@/store/authStore";

export default {
  components: {},
  data() {
    return {
      darkMode: false,
    };
  },

  setup() {
    const authStore = useAuthStore();

    const login = () => {
      authStore.login(); // Call the login action from the store
    };

    return {
      login,
      authStore,
    };
  },
  async mounted() {
    const authStore = useAuthStore();
    await authStore.handleRedirect();
  },
  methods: {},
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
