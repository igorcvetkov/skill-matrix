<template>
  <!-- <v-app> -->
  <v-layout class="rounded rounded-md">
    <v-app-bar title="Skill Matrix"></v-app-bar>

    <v-navigation-drawer location="left" permanent>
      <v-list>
        <v-list-item link title="Skill Groups"></v-list-item>
        <v-list-item link title="Skill Categories"></v-list-item>
        <v-list-item link title="Skills"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <SkillGroups></SkillGroups>
    </v-main>
  </v-layout>
  <!-- </v-app> -->
</template>

<script>
import SkillGroups from "./SkillGroups.vue";

export default {
  components: {
    SkillGroups,
  },
};
</script>
