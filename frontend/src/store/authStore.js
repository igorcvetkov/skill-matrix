import { defineStore } from "pinia";
import authService from "@/services/authService";
import { msalInstance } from "@/config/msalConfig";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null,
  }),
  actions: {
    async login() {
      await authService.login();
      this.isAuthenticated = true; // Update the state
    },
    logout() {
      authService.logout();
      this.isAuthenticated = false; // Update the state
      this.user = null; // Clear user details
    },
    async handleRedirect(redirect) {
      try {
        const response = await msalInstance.handleRedirectPromise(); //.handleRedirect();
        if (response) {
          this.isAuthenticated = true; // Update the state
          this.user = response.account; // Set user details

          const token = await authService.getAccessToken();
          this.token = token;

          // router.push("/");

          const redirectPath = redirect || "/"; // Default to home if no redirect
          router.push(redirectPath); // Red
        }
      } catch (error) {
        console.error("error", error);
      }
    },
  },
});
