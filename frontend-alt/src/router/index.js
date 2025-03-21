import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import UserAssessmentView from '../views/UserAssessmentView.vue'
import ProjectAssessmentView from '../views/ProjectAssessmentView.vue'
import store from '../store'
import { msalInstance } from '../store'

// Define standard roles to match the original implementation
export const roles = {
  ADMIN: 'admin',
  PM: 'project.manager',
  USER: 'user'
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/access-denied',
    name: 'accessDenied',
    component: () => import('../views/AccessDeniedView.vue')
  },
  {
    path: '/user-assessment',
    name: 'userAssessment',
    component: UserAssessmentView,
    meta: { 
      requiresAuth: true,
      roles: [roles.ADMIN, roles.PM]
    }
  },
  {
    path: '/project-assessment',
    name: 'projectAssessment',
    component: ProjectAssessmentView,
    meta: { 
      requiresAuth: true,
      roles: [roles.ADMIN, roles.PM]
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  // For development, bypass authentication checks
  const bypassAuth = process.env.NODE_ENV === 'development' && process.env.VUE_APP_BYPASS_AUTH === 'true';

  if (bypassAuth) {
    // Set a mock user in the store if not already set
    if (!store.getters.currentUser) {
      await store.dispatch('setMockUser');
    }
    next();
    return;
  }

  // Handle the redirect callback from Microsoft authentication
  if (to.path.includes('/login')) {
    try {
      await store.dispatch('handleRedirectCallback')
    } catch (error) {
      console.error('Error handling redirect:', error)
    }
  }

  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if the user is authenticated
    const isAuthenticated = store.getters.isAuthenticated
    
    if (!isAuthenticated) {
      // If not authenticated, check if there are any accounts
      const accounts = msalInstance.getAllAccounts()
      
      if (accounts.length > 0) {
        // Try to authenticate silently
        try {
          await store.dispatch('checkAuth')
          
          // Check role-based access if specified in the route
          if (to.meta.roles && !checkUserHasRequiredRole(to.meta.roles)) {
            next({ name: 'accessDenied' })
            return
          }
          
          next()
          return
        } catch (error) {
          console.error('Silent authentication failed:', error)
        }
      }
      
      // If still not authenticated, redirect to login
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      // If authenticated, check role-based access
      if (to.meta.roles && !checkUserHasRequiredRole(to.meta.roles)) {
        next({ name: 'accessDenied' })
        return
      }
      
      next()
    }
  } else {
    next()
  }
})

// Helper function to check if the user has any of the required roles
function checkUserHasRequiredRole(requiredRoles) {
  return requiredRoles.some(role => store.getters.hasRole(role))
}

export default router 