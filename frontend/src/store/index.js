import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    isAuthenticated: false,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    LOGOUT(state) {
      state.user = null; // Clear user details
    },
    setAuthentication(state, status) {
      state.isAuthenticated = status; // Mutation to update authentication status
    },
  },
  actions: {
    logout({ commit }) {
      // Perform any logout logic here (e.g., API call)
      commit("LOGOUT"); // Commit the logout mutation
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated, // Getter for authentication status
  },
});
