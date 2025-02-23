<!-- src/components/NotFound.vue -->
<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col class="text-center">
        <h1 class="display-1">403</h1>
        <h2>Access Denied</h2>
        <p>Sorry, the page you are looking not accessible.</p>
        <v-btn color="primary" @click="$router.push('/')">Go back to Home</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
