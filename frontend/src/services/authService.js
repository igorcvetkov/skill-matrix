// import jwt_decode from "jwt-decode"; // Make sure to install this package

// export const getRolesFromToken = (token) => {
//   if (!token) return [];
//   const decodedToken = jwt_decode(token);
//   return decodedToken?.roles || []; // Adjust based on your token structure
// };

import { msalInstance, getAccessToken } from "@/config/msalConfig";

await msalInstance.initialize();

const authService = {
  async login() {
    const loginRequest = {
      scopes: ["User.Read"], // Add any scopes you need
    };

    msalInstance.loginRedirect(loginRequest).catch((error) => {
      console.error("Login error:", error);
    });
  },

  async logout() {
    msalInstance.logout();
  },

  async handleRedirect() {
    // await msalInstance.initialize();

    msalInstance
      .handleRedirectPromise()
      .then(async (response) => {
        if (response) {
          return response;
        } else {
          const accounts = msalInstance.getAllAccounts();

          if (accounts.length > 0) {
            return accounts[0];
          }
        }
      })
      .catch((error) => {
        console.error("Redirect error:", error);
        throw error;
      });
  },

  async getAccessToken() {
    const responseToken = await getAccessToken();
    return responseToken;
  },

  isAuthenticated() {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0; // Check if there are any logged-in accounts
  },
};

export default authService;
