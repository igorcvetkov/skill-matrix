<template>
  <v-responsive>
    <v-app>
      <v-layout class="rounded rounded-md">
        <v-app-bar title="Skill Matrix"></v-app-bar>

        <v-navigation-drawer location="left" permanent>
          <v-list>
            <v-list-item title="Projects" :to="{ name: 'Projects' }" router></v-list-item>
            <v-list-item title="Skill Groups" :to="{ name: 'SkillGroups' }" router></v-list-item>
            <v-list-item title="Skill Categories" :to="{ name: 'SkillCategories' }" router></v-list-item>
            <v-list-item title="Skills" :to="{ name: 'Skills' }" router></v-list-item>
          </v-list>
        </v-navigation-drawer>

        <v-main>
          <v-container>
            <RouterView></RouterView>
            <!-- <SkillGroups v-if="selectedMenu === 'groups'"></SkillGroups>
            <SkillCategories v-if="selectedMenu === 'categories'"></SkillCategories> -->
          </v-container>
        </v-main>
      </v-layout>
    </v-app>
  </v-responsive>
</template>

<script>
export default {
  components: {},
  data() {
    return {};
  },
  methods: {},
};
</script>
