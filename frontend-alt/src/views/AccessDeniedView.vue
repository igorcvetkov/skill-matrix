<template>
  <v-container>
    <v-row class="text-center">
      <v-col>
        <v-icon color="error" size="x-large" icon="mdi-alert-circle"></v-icon>
        <h1 class="text-h4 my-4">Access Denied</h1>
        <p class="text-body-1 mb-4">
          You do not have permission to access the requested page.
        </p>
        <p class="text-body-2 mb-8">
          Your current role does not have the necessary permissions. 
          Please contact your administrator if you believe this is an error.
        </p>
        <v-btn color="primary" to="/">
          Return to Home
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AccessDeniedView'
}
</script> 