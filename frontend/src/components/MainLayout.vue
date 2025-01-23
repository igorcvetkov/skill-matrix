<template>
  <!-- <v-app> -->
  <v-layout class="rounded rounded-md">
    <v-app-bar title="Skill Matrix"></v-app-bar>

    <v-navigation-drawer location="left" permanent>
      <v-list>
        <v-list-item link @click="handleMenuItemSelect('groups')" title="Skill Groups"></v-list-item>
        <v-list-item @click="handleMenuItemSelect('categories')" title="Skill Categories"></v-list-item>
        <v-list-item v-on:click="handleMenuItemSelect('skills')" title="Skills"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      {{ selectedMenu }}
      <SkillGroups v-if="selectedMenu === 'groups'"></SkillGroups>
      <SkillCategories v-if="selectedMenu === 'categories'"></SkillCategories>
    </v-main>
  </v-layout>
  <!-- </v-app> -->
</template>

<script>
import SkillGroups from "./SkillGroups.vue";
import SkillCategories from "./SkillCategories.vue";

export default {
  components: {
    SkillGroups,
    SkillCategories,
  },
  data() {
    return {
      selectedMenu: "",
    };
  },
  methods: {
    handleMenuItemSelect(item) {
      this.selectedMenu = item;
    },
  },
};
</script>
