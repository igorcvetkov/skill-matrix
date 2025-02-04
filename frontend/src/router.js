// src/router.js
import { createRouter } from "vue-router";
import { createWebHistory } from "vue-router";
import SkillsView from "./views/SkillsView.vue";
import SkillGroups from "./views/SkillGroupsView.vue";
import SkillCategories from "./views/SkillCategoriesView.vue";
import ProjectsView from "./views/ProjectsView.vue";
import ProjectSkillsView from "./views/ProjectSkillsView.vue";
// import { state } from "@/config/msalConfig";

const router = createRouter({
  history: createWebHistory(), // Optional: use history mode for cleaner URLs
  routes: [
    {
      path: "/groups",
      name: "SkillGroups",
      component: SkillGroups,
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
    {
      path: "/:catchAll(.*)", // Optional: redirect to a 404 page or home
      redirect: "/groups",
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

// Navigation Guard to protect routes
// router.beforeEach((to, from, next) => {
//   console.log("navigation guard", state);
//   if (to.meta.requiresAuth && !state.isAuthenticated) {
//     next("/login"); // Redirect unauthenticated users
//   } else {
//     next(); // Allow access
//   }
// });

export default router;
