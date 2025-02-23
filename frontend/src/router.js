import { createRouter } from "vue-router";
import { createWebHistory } from "vue-router";
import SkillsView from "./views/SkillsView.vue";
import SkillGroups from "./views/SkillGroupsView.vue";
import SkillCategories from "./views/SkillCategoriesView.vue";
import ProjectsView from "./views/ProjectsView.vue";
import ProjectSkillsView from "./views/ProjectSkillsView.vue";
import NotFound404 from "./views/NotFound404.vue";
import MainLayout from "./components/MainLayout.vue";
import { useAuthStore } from "./store/authStore";
import LoginView from "./views/LoginView.vue";
import PersonSkillsView from "./views/PersonSkillsView.vue";
import AccessDenied403 from "./views/AccessDenied403.vue";

const roles = { ADMIN: "admin", PM: "project.manager", USER: "user" };

const router = createRouter({
  history: createWebHistory(), // Optional: use history mode for cleaner URLs
  routes: [
    {
      path: "/",
      home: "Home",
      component: MainLayout,
      children: [
        {
          path: "/groups",
          component: SkillGroups,
          name: "SkillGroups",
          meta: {
            requiresAuth: true,
            roles: [roles.ADMIN],
          },
        },
        {
          path: "/categories/:groupId?",
          name: "SkillCategories",
          component: SkillCategories,
          meta: {
            requiresAuth: true,
            roles: [roles.ADMIN],
          },
        },
        {
          path: "/skills",
          name: "Skills",
          component: SkillsView,
          meta: {
            requiresAuth: true,
            roles: [roles.ADMIN],
          },
        },
        {
          path: "/projects",
          name: "Projects",
          component: ProjectsView,
          meta: {
            requiresAuth: true,
            roles: [roles.ADMIN],
          },
        },
        {
          path: "/project-skills/:projectId?",
          name: "ProjectSkills",
          component: ProjectSkillsView,
          meta: {
            requiresAuth: true,
            roles: [roles.ADMIN, roles.PM],
          },
        },
        {
          path: "/person-skills",
          name: "PersonSkills",
          component: PersonSkillsView,
          meta: {
            requiresAuth: true,
            roles: [roles.ADMIN, roles.USER, roles.PM],
          },
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/access-denied",
      name: "accessDenied",
      component: AccessDenied403,
    },
    {
      path: "/:catchAll(.*)*", // Optional: redirect to a 404 page or home
      name: "NotFound",
      component: NotFound404,
    },
  ],
});

// Navigation Guard to protect routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  console.log("guard", authStore.user?.idTokenClaims.roles);
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      if (to.meta.roles && !to.meta.roles.some((role) => authStore.user.idTokenClaims.roles.includes(role))) {
        next({ name: "accessDenied" });
      } else {
        next();
      }
    } else {
      next({ name: "login", query: { redirect: to.fullPath } });
    }
  } else {
    next(); // Proceed to the route
  }
});

export default router;
