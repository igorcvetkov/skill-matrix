// src/router.js
import { createRouter } from "vue-router";
import SkillsView from "./views/SkillsView.vue";
import SkillGroups from "./views/SkillGroupsView.vue";
import SkillCategories from "./views/SkillCategoriesView.vue";
import { createWebHistory } from "vue-router";
import ProjectsView from "./views/ProjectsView.vue";

const router = createRouter({
  history: createWebHistory(), // Optional: use history mode for cleaner URLs
  routes: [
    {
      path: "/groups",
      name: "SkillGroups",
      component: SkillGroups,
    },
    {
      path: "/categories",
      name: "SkillCategories",
      component: SkillCategories,
    },
    {
      path: "/skills",
      name: "Skills",
      component: SkillsView,
    },
    {
      path: "/projects",
      name: "Projects",
      component: ProjectsView,
    },
    {
      path: "/:catchAll(.*)", // Optional: redirect to a 404 page or home
      redirect: "/groups",
    },
  ],
});

export default router;
