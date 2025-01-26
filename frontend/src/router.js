// src/router.js
import { createRouter } from "vue-router";
import SkillGroups from "./components/SkillGroups.vue";
import SkillCategories from "./components/SkillCategories.vue";
import { createWebHistory } from "vue-router";

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
      path: "/:catchAll(.*)", // Optional: redirect to a 404 page or home
      redirect: "/groups",
    },
  ],
});

export default router;
