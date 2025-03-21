<template>
  <v-card class="mb-6">
    <v-card-item>
      <v-card-title class="text-h4">{{ userName ? `Welcome, ${userName}!` : 'Skill Self-Assessment' }}</v-card-title>
      <template v-slot:append>
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
        ></v-progress-circular>
      </template>
    </v-card-item>
    
    <v-card-text>
      <v-alert
        v-if="error"
        type="error"
        dismissible
        class="mb-4"
      >
        {{ error }}
      </v-alert>
      
      <div class="text-subtitle-1 font-weight-medium mb-2 text-left">How it works:</div>
      <ol class="mb-4">
        <li>You'll be guided through each skill category one by one</li>
        <li>For each skill, select either "Yes" or "No" to indicate your proficiency</li>
        <li>Add optional notes for context if needed</li>
        <li>After completing all categories, you'll see your assessment summary</li>
      </ol>
      
      <div class="d-flex justify-center mt-6">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-play"
          @click="$emit('start')"
          :disabled="loading"
          :loading="loading"
        >
          Start Assessment
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'IntroductionCard',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    userName: {
      type: String,
      default: null
    }
  },
  emits: ['start']
}
</script>

<style scoped>
/* Ordered list styling - fixing the gap between numbers and text */
ol {
  padding-left: 1.5rem;
  text-align: left;
}

ol li {
  padding-left: 0.5rem;
  display: list-item;
}
</style> 