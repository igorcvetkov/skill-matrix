<template>
  <div class="login">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="elevation-12">
            <v-card-title class="text-center">
              <h1 class="display-1">Skill Matrix Login</h1>
            </v-card-title>
            
            <v-card-text>
              <v-alert
                v-if="error"
                type="error"
                dismissible
                @click:close="clearError"
              >
                {{ error }}
              </v-alert>
              
              <p class="text-center">Please sign in with your Microsoft account to access the Skill Matrix application.</p>
            </v-card-text>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                large
                block
                @click="handleLogin"
                :loading="loading"
                :disabled="loading"
              >
                <v-icon left>mdi-microsoft</v-icon>
                Sign in with Microsoft
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
            
            <v-card-text class="text-center">
              <p class="text-caption">This application uses Microsoft Azure Entra ID for authentication.</p>
              <p v-if="loading" class="text-caption mt-2">Redirecting to Microsoft login...</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { msalInstance } from '../store'

export default {
  name: 'LoginView',
  data() {
    return {
      localError: null
    }
  },
  computed: {
    ...mapGetters(['loading', 'error', 'isAuthenticated']),
    displayError() {
      return this.error || this.localError;
    }
  },
  methods: {
    ...mapActions(['login', 'handleRedirectCallback']),
    ...mapMutations(['SET_ERROR']),
    clearError() {
      this.SET_ERROR(null);
      this.localError = null;
    },
    async handleLogin() {
      try {
        this.clearError();
        // Simply call login which will redirect to Microsoft
        await this.login();
      } catch (error) {
        console.error('Login failed:', error);
        this.localError = `Authentication failed: ${error.message || 'Unknown error'}`;
      }
    }
  },
  async created() {
    // Check if the user is already authenticated
    try {
      // Check if there are any accounts
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        // Try to handle redirect or authenticate silently
        const result = await this.handleRedirectCallback();
        if (result || this.isAuthenticated) {
          this.$router.push('/');
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  }
}
</script>

<style scoped>
.login {
  height: 100%;
}
</style> 