<!-- src/components/NotFound.vue -->
<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col class="text-center">
        <v-img src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo.svg" max-width="200" class="mb-4"></v-img>
        <h1 class="display-1">404</h1>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you are looking for does not exist.</p>
        <v-btn color="primary" @click="$router.push('/')">Go back to Home</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped>
/* .fill-height {
  min-height: 100vh;
} */
</style>
