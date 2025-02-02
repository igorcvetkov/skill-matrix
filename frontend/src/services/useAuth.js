import { ref } from "vue";
import { msalInstance, state, graphScopes } from "@/config/msalConfig";

export function useAuth() {
  const isAuthenticated = ref(false);

  const login = async () => {
    try {
      if (!msalInstance) {
        throw new Error("MSAL not initialized. Call initializeMSAL() before using MSAL API");
      }
      const loginResponse = await msalInstance.loginRedirect();
      isAuthenticated.value = true;

      console.log("Login success: ", loginResponse);
    } catch (error) {
      console.error("Login error: ", error);
    }
  };

  const logout = () => {
    if (!msalInstance) {
      throw new Error("MSAL not initialized. Call initializeMSAL() before using MSAL API");
    }

    msalInstance.logoutRedirect({
      onRedirectNavigate: (url) => {
        // Example logic: Redirect to a specific page after logout
        if (url.includes("some-condition")) {
          return true; // Allow navigation
        }
        return false; // Prevent navigation
      },
    });

    isAuthenticated.value = false;
    console.log("Logged out");
  };

  const handleRedirect = async () => {
    try {
      await msalInstance.handleRedirectPromise();
      state.isAuthenticated = msalInstance.getAllAccounts().length > 0;
      state.user = msalInstance.getAllAccounts()[0];
    } catch (error) {
      console.error("Redirect error: ", error);
    }
  };

  const getAccessToken = async () => {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length >= 1) {
        const account = { account: accounts[0] };
        const request = Object.assign({}, graphScopes, account);
        const tokenResponse = await msalInstance.acquireTokenSilent(request);
        console.debug("tokenResponse", tokenResponse);
        return tokenResponse.accessToken;
      }
      return null;
    } catch (error) {
      logout();
    }
  };

  return { isAuthenticated, login, logout, handleRedirect, getAccessToken };
}
