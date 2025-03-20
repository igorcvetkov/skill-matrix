<template>
  <div class="home">
    <v-container>
      <!-- Skill Matrix Component -->
      <skill-matrix></skill-matrix>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SkillMatrix from '@/components/SkillMatrix.vue'

export default {
  name: 'HomeView',
  components: {
    SkillMatrix
  },
  computed: {
    ...mapGetters(['currentUser'])
  }
}
</script> 