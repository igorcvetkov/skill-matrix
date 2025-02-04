import axios from "axios";
/// not finalized.
/// idea to keep here generic API connector things, like url, auth headers etc

const api = axios.create({
  baseURL: "http://localhost:3000", // Backend API base URL
});

// Automatically attach the token to every request
api.interceptors.request.use(
  (config) => {
    const idToken = localStorage.getItem("idToken"); // Store token in localStorage or Vuex
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
