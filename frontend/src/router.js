// src/router.js
import { createRouter } from "vue-router";
import { createWebHistory } from "vue-router";
import SkillsView from "./views/SkillsView.vue";
import SkillGroups from "./views/SkillGroupsView.vue";
import SkillCategories from "./views/SkillCategoriesView.vue";
import ProjectsView from "./views/ProjectsView.vue";
import ProjectSkillsView from "./views/ProjectSkillsView.vue";

const router = createRouter({
  history: createWebHistory(), // Optional: use history mode for cleaner URLs
  routes: [
    {
      path: "/groups",
      name: "SkillGroups",
      component: SkillGroups,
    },
    {
      path: "/categories/:groupId?",
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
      path: "/project-skills/:projectId?",
      name: "ProjectSkills",
      component: ProjectSkillsView,
    },
    {
      path: "/:catchAll(.*)", // Optional: redirect to a 404 page or home
      redirect: "/groups",
    },
  ],
});

export default router;
