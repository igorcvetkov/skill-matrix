import { PublicClientApplication } from "@azure/msal-browser";

// src/authConfig.js
const msalConfig = {
  auth: {
    clientId: process.env.VUE_APP_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.VUE_APP_MSAL_TENANT_ID}`, // Use the environment variable
    redirectUri: process.env.VUE_APP_MSAL_REDIRECT_URI, // Use the environment variable
  },
  cache: {
    cacheLocation: "localStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: true, // Set to true for IE 11
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
