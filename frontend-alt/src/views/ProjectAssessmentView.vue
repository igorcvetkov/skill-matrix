<template>
  <div class="project-assessment">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-title class="headline">
              Project Skills Assessment
            </v-card-title>
            
            <v-card-text>
              <p class="text-body-1 mb-4">
                This feature will allow you to assess projects and their required skills.
              </p>
              
              <v-alert
                type="info"
                title="Coming Soon"
                text="The project assessment functionality is currently under development and will be available soon."
                prominent
                border="start"
                class="mb-4"
              ></v-alert>
              
              <v-skeleton-loader
                type="list-item-three-line, divider, list-item-three-line, divider, list-item-three-line"
                class="mt-6 mb-4"
              ></v-skeleton-loader>
              
              <div class="d-flex justify-end">
                <v-btn 
                  color="primary" 
                  disabled
                  prepend-icon="mdi-rocket-launch"
                >
                  Start Project Assessment
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectAssessmentView',
  computed: {
    ...mapGetters(['currentUser', 'isProjectManager'])
  }
}
</script>

<style scoped>
.project-assessment {
  margin-top: 20px;
}
</style> 