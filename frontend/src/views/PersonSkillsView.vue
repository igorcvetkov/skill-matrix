<template>
  <v-row>
    <v-col size="5">
      <v-card title="Available">
        <SkillTree
          ref="availableSkills"
          :filter="excludePersonSkillFilter"
          selectable
          context="skill"
          @nodeSelect="handleSkillNodeSelected"
          @skillSelect="handleSkillSelect"
        ></SkillTree>
      </v-card>
    </v-col>
    <v-col size="5">
      <v-card title="Own">
        <SkillTree ref="personSkills" context="person" :filter="personSkillFilter"></SkillTree>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import SkillTree from "@/components/SkillTree.vue";
import personSkillService from "@/services/personSkillService";
import { useAuthStore } from "@/store/authStore";
export default {
  setup() {
    const authStore = useAuthStore();

    return {
      authStore,
    };
  },
  components: {
    SkillTree,
  },
  data() {
    return {
      excludePersonSkillFilter: { excludePersonId: this.authStore.user.username },
      personSkillFilter: { personId: this.authStore.user.username },
    };
  },
  methods: {
    handleSkillNodeSelected(event) {
      console.log(event);
      // alert(JSON.stringify(event));
    },
    async handleSkillSelect(event) {
      const newPersonSkill = {
        personId: this.authStore.user.username,
        skillId: event,
      };
      try {
        await personSkillService.add(newPersonSkill);
        // alert("Person skill added successfully");
        this.$refs.availableSkills.loadSkill();
        this.$refs.personSkills.loadSkill();
      } catch (error) {
        console.error("Error adding project :", error);
        alert(error);
        this.error = error.message;
      }
    },
  },
};
</script>
