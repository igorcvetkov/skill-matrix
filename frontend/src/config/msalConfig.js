import { PublicClientApplication } from "@azure/msal-browser";
import { reactive } from "vue";
// src/authConfig.js
const msalConfig = {
  auth: {
    clientId: process.env.VUE_APP_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.VUE_APP_MSAL_TENANT_ID}`, // Use the environment variable
    redirectUri: process.env.VUE_APP_MSAL_REDIRECT_URI, // Use the environment variable
  },
  cache: {
    cacheLocation: "localStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set to true for IE 11
  },
};

export const getAccessToken = async () => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length >= 1) {
      const account = { account: accounts[0] };
      const request = Object.assign({}, graphScopes, account);
      const tokenResponse = await msalInstance.acquireTokenSilent(request);
      state.token = tokenResponse;
      return tokenResponse.accessToken;
    }
    return null;
  } catch (error) {
    // logout();
  }
};

export const graphScopes = {
  scopes: [`${process.env.VUE_APP_MSAL_CLIENT_ID}/project.read`],
};

export const state = reactive({
  isAuthenticated: false,
  user: {},
  roles: [],
  token: {},
});

export const msalInstance = new PublicClientApplication(msalConfig);
