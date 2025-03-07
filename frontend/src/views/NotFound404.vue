<!-- src/components/NotFound.vue -->
<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col class="text-center">
        <v-empty-state
          action-text="Go to home page"
          icon="mdi-magnify"
          headline="404"
          title="Page not found."
          color="primary"
          @click:action="$router.push('/')"
        ></v-empty-state>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  created() {
    fetch("/config.js")
      .then((response) => response.text())
      .then((text) => {
        eval(text); // This will set window.env
        // Now you can use window.env.API_URL in your app
        console.log("API URL:", window.env.API_URL);
      });
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
