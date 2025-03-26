import { createStore } from 'vuex'
import { PublicClientApplication } from '@azure/msal-browser'
import axios from 'axios'

// MSAL configuration - simplified to match the original implementation
const msalConfig = {
  auth: {
    clientId: process.env.VUE_APP_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.VUE_APP_MSAL_TENANT_ID}`,
    redirectUri: process.env.VUE_APP_MSAL_REDIRECT_URI
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
}

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL
msalInstance.initialize().catch(error => {
  console.error('MSAL initialization failed:', error)
})

// Define scopes for token acquisition
const tokenRequest = {
  scopes: ['User.Read']
}

export default createStore({
  state: {
    user: null,
    accessToken: null,
    roles: [],
    loading: false,
    error: null
  },
  getters: {
    isAuthenticated: state => !!state.accessToken || !!state.user,
    currentUser: state => state.user,
    userRoles: state => state.roles,
    hasRole: state => role => state.roles.includes(role),
    isAdmin: state => state.roles.includes('admin'),
    isProjectManager: state => state.roles.includes('project.manager'),
    isUser: state => state.roles.includes('user'),
    loading: state => state.loading,
    error: state => state.error
  },
  mutations: {
    SET_USER(state, user) {
      // Map MSAL user to our application's user format
      state.user = user ? {
        person_id: user.username,
        name: user.name,
        username: user.username
      } : null
    },
    SET_ACCESS_TOKEN(state, token) {
      state.accessToken = token
    },
    SET_ROLES(state, roles) {
      state.roles = roles || []
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.accessToken = null
      state.roles = []
    }
  },
  actions: {
    async login({ commit }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        // Use redirect-based authentication like the original implementation
        await msalInstance.loginRedirect(tokenRequest)
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Login error:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async handleRedirectCallback({ commit }) {
      try {
        commit('SET_LOADING', true)
        
        const response = await msalInstance.handleRedirectPromise()
        
        if (response) {
          // User has been authenticated
          const user = response.account
          // console.log('User:', user);
          commit('SET_USER', user);
          commit('SET_ACCESS_TOKEN', response.accessToken);
          
          // Extract roles from ID token claims
          const idTokenClaims = user.idTokenClaims;
          const roles = idTokenClaims && idTokenClaims.roles ? idTokenClaims.roles : [];  
          commit('SET_ROLES', roles);
          
          // Configure axios to use the token for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
          
          return true;
        }
        
        // Check if user is already logged in
        const accounts = msalInstance.getAllAccounts()
        if (accounts.length > 0) {
          const account = accounts[0]
          
          try {
            // Try to acquire token silently
            const silentRequest = {
              ...tokenRequest,
              account: account
            }
            
            const tokenResponse = await msalInstance.acquireTokenSilent(silentRequest)
            
            commit('SET_USER', account)
            commit('SET_ACCESS_TOKEN', tokenResponse.accessToken)
            
            // Extract roles from ID token claims
            const idTokenClaims = account.idTokenClaims
            const roles = idTokenClaims && idTokenClaims.roles ? idTokenClaims.roles : []
            commit('SET_ROLES', roles)
            
            // Configure axios to use the token for all requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.accessToken}`
            
            return true
          } catch (silentError) {
            console.error('Silent token acquisition failed:', silentError)
            return false
          }
        }
        
        return false
      } catch (error) {
        console.error('Error handling redirect:', error)
        commit('SET_ERROR', error.message)
        return false
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async logout({ commit }) {
      try {
        // Use the same logout approach as the original implementation
        await msalInstance.logoutRedirect()
        commit('CLEAR_AUTH')
        delete axios.defaults.headers.common['Authorization']
      } catch (error) {
        console.error('Logout error:', error)
      }
    },
    
    async checkAuth({ dispatch }) {
      // Use the handleRedirectCallback action to check authentication
      return dispatch('handleRedirectCallback')
    }
  }
}) 