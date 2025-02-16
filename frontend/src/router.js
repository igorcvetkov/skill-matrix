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
          },
        },
        {
          path: "/categories/:groupId?",
          name: "SkillCategories",
          component: SkillCategories,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: "/skills",
          name: "Skills",
          component: SkillsView,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: "/projects",
          name: "Projects",
          component: ProjectsView,
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: "/project-skills/:projectId?",
          name: "ProjectSkills",
          component: ProjectSkillsView,
          meta: {
            requiresAuth: true,
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
      path: "/:catchAll(.*)*", // Optional: redirect to a 404 page or home
      name: "NotFound",
      component: NotFound404,
    },
  ],
});

// Navigation Guard to protect routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else {
    next(); // Proceed to the route
  }
});

export default router;
