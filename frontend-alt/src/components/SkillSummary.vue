<template>
  <div class="skill-summary">
    <v-card>
      <v-card-title class="bg-primary text-white py-4">
        <v-icon size="large" class="mr-2">mdi-chart-box</v-icon>
        <h2>Your Skill Assessment Results</h2>
      </v-card-title>
      <v-card-text class="pa-6">
        <v-alert
          v-if="!hasSkills"
          type="info"
          class="mb-4"
        >
          No skills have been assessed yet. Please complete the assessment to see your summary.
        </v-alert>
        
        <div v-else>
          <!-- Overall Score -->
          <v-row class="mb-8">
            <v-col cols="12" md="6">
              <div class="text-center">
                <h3 class="text-h5 mb-4">Overall Proficiency</h3>
                <v-progress-circular
                  :model-value="getOverallProficiencyPercentage"
                  color="primary"
                  size="150"
                  width="15"
                  class="mb-3"
                >
                  {{ Math.round(getOverallProficiencyPercentage) }}%
                </v-progress-circular>
                <div class="text-h6 mt-2">
                  {{ getSelectedSkillsCount }} of {{ getTotalSkillsCount }} skills mastered
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center">
              <v-card variant="outlined" class="w-100 pa-4">
                <div class="text-h6 mb-3">Assessment Overview</div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Total Groups:</span>
                  <strong>{{ skillGroups.length }}</strong>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Total Categories:</span>
                  <strong>{{ categories.length }}</strong>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Total Skills:</span>
                  <strong>{{ getTotalSkillsCount }}</strong>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span>Skills Mastered:</span>
                  <strong>{{ getSelectedSkillsCount }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Proficiency Rate:</span>
                  <strong>{{ Math.round(getOverallProficiencyPercentage) }}%</strong>
                </div>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Group Breakdown -->
          <div class="mb-8">
            <h3 class="text-h5 mb-4">Group Breakdown</h3>
            <v-row>
              <v-col cols="12" md="6" v-for="(group, index) in sortedGroups" :key="group.id">
                <v-card variant="outlined" class="pa-3 mb-3">
                  <div class="d-flex align-center mb-2">
                    <div class="group-rank mr-3">{{ index + 1 }}</div>
                    <div>
                      <div class="text-subtitle-1 font-weight-medium">{{ group.name }}</div>
                      <div class="text-caption">{{ getGroupSelectedCount(group) }}/{{ getGroupTotalCount(group) }} skills mastered</div>
                    </div>
                  </div>
                  <v-progress-linear
                    :model-value="getGroupPercentage(group)"
                    height="8"
                    :color="getGroupColor(group)"
                    class="mb-1"
                    rounded
                  ></v-progress-linear>
                  <div class="d-flex justify-space-between text-caption">
                    <span>{{ Math.round(getGroupPercentage(group)) }}% proficiency</span>
                    <span>{{ getGroupSelectedCount(group) }} of {{ getGroupTotalCount(group) }}</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
          
          <!-- Category Breakdown -->
          <div class="mb-8">
            <h3 class="text-h5 mb-4">Category Breakdown</h3>
            <v-row>
              <v-col cols="12" md="6" v-for="(category, index) in sortedCategories" :key="category.id">
                <v-card variant="outlined" class="pa-3 mb-3">
                  <div class="d-flex align-center mb-2">
                    <div class="category-rank mr-3">{{ index + 1 }}</div>
                    <div>
                      <div class="text-subtitle-1 font-weight-medium">{{ category.name }}</div>
                      <div class="text-caption">
                        <span>{{ category.group_name }}</span> • 
                        <span>{{ getCategorySelectedCount(category) }}/{{ category.skills.length }} skills mastered</span>
                      </div>
                    </div>
                  </div>
                  <v-progress-linear
                    :model-value="getCategoryPercentage(category)"
                    height="8"
                    :color="getCategoryColor(category)"
                    class="mb-1"
                    rounded
                  ></v-progress-linear>
                  <div class="d-flex justify-space-between text-caption">
                    <span>{{ Math.round(getCategoryPercentage(category)) }}% proficiency</span>
                    <span>{{ getCategorySelectedCount(category) }} of {{ category.skills.length }}</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
          
          <!-- Action Buttons -->
          <div class="d-flex justify-end mb-8">
            <v-btn
              color="primary"
              variant="outlined"
              class="mr-2"
              prepend-icon="mdi-file-pdf-box"
              @click="downloadPDF"
            >
              Download PDF
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-email-outline"
              @click="shareResults"
            >
              Share Results
            </v-btn>
          </div>
          
          <!-- Skill List -->
          <div>
            <h3 class="text-h5 mb-4">Your Mastered Skills</h3>
            <v-card variant="outlined">
              <v-data-table
                :headers="skillHeaders"
                :items="selectedSkills"
                :items-per-page="10"
                class="elevation-0"
              >
                <template v-slot:[`item.group_name`]="{ item }">
                  <span>{{ item.group_name }}</span>
                </template>
                <template v-slot:[`item.category_name`]="{ item }">
                  <span>{{ item.category_name }}</span>
                </template>
                <template v-slot:[`item.skill_name`]="{ item }">
                  <span>{{ item.skill_name }}</span>
                </template>
              </v-data-table>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'SkillSummary',
  props: {
    categories: {
      type: Array,
      required: true
    },
    skillGroups: {
      type: Array,
      required: true
    },
    userSkills: {
      type: Object,
      default: () => ({})
    },
    selectedSkills: {
      type: Array,
      default: () => []
    },
    userSkillsMap: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      skillHeaders: [
        { title: 'Group', key: 'group_name', sortable: true },
        { title: 'Category', key: 'category_name', sortable: true },
        { title: 'Skill', key: 'skill_name', sortable: true }
      ]
    }
  },
  computed: {
    hasSkills() {
      return Object.values(this.userSkills).some(value => value === true)
    },
    getTotalSkillsCount() {
      let count = 0
      this.categories.forEach(category => {
        count += category.skills.length
      })
      return count
    },
    getSelectedSkillsCount() {
      return this.selectedSkills.length
    },
    getOverallProficiencyPercentage() {
      if (this.getTotalSkillsCount === 0) return 0;
      
      // For projects, we only count skills with proficiency = 1
      const selectedSkills = this.selectedSkills.filter(skill => {
        const skillRecord = this.userSkillsMap[skill.id];
        return skillRecord && skillRecord.proficiency === 1;
      });
      
      return (selectedSkills.length / this.getTotalSkillsCount) * 100;
    },
    sortedCategories() {
      return [...this.categories].sort((a, b) => {
        const aPercentage = this.getCategoryPercentage(a)
        const bPercentage = this.getCategoryPercentage(b)
        return bPercentage - aPercentage
      })
    },
    sortedGroups() {
      if (!this.skillGroups || this.skillGroups.length === 0) {
        return []
      }
      
      return [...this.skillGroups].sort((a, b) => {
        const aPercentage = this.getGroupPercentage(a)
        const bPercentage = this.getGroupPercentage(b)
        return bPercentage - aPercentage
      })
    },
    allSkills() {
      const skills = []
      this.categories.forEach(category => {
        category.skills.forEach(skill => {
          skills.push({
            ...skill,
            category_name: category.name,
            group_name: category.group_name
          })
        })
      })
      return skills
    }
  },
  methods: {
    getCategorySelectedCount(category) {
      // For projects, we only count skills with proficiency = 1
      return category.skills.filter(skill => {
        const skillRecord = this.userSkillsMap[skill.id];
        return skillRecord && skillRecord.proficiency === 1;
      }).length;
    },
    getCategoryPercentage(category) {
      if (category.skills.length === 0) return 0;
      
      // For projects, we only count skills with proficiency = 1
      const selectedSkills = category.skills.filter(skill => {
        const skillRecord = this.userSkillsMap[skill.id];
        return skillRecord && skillRecord.proficiency === 1;
      });
      
      return (selectedSkills.length / category.skills.length) * 100;
    },
    getCategoryColor(category) {
      const percentage = this.getCategoryPercentage(category)
      if (percentage === 0) return 'grey'
      if (percentage < 50) return 'warning'
      if (percentage < 100) return 'info'
      return 'success'
    },
    getGroupTotalCount(group) {
      if (!group) return 0
      let count = 0
      this.categories.forEach(category => {
        if (category.group_id === group.id) {
          count += category.skills ? category.skills.length : 0
        }
      })
      return count
    },
    getGroupSelectedCount(group) {
      const groupSkills = this.allSkills.filter(skill => skill.group_id === group.id);
      
      // For projects, we only count skills with proficiency = 1
      return groupSkills.filter(skill => {
        const skillRecord = this.userSkillsMap[skill.id];
        return skillRecord && skillRecord.proficiency === 1;
      }).length;
    },
    getGroupPercentage(group) {
      const groupSkills = this.allSkills.filter(skill => skill.group_id === group.id);
      if (groupSkills.length === 0) return 0;
      
      // For projects, we only count skills with proficiency = 1
      const selectedSkills = groupSkills.filter(skill => {
        const skillRecord = this.userSkillsMap[skill.id];
        return skillRecord && skillRecord.proficiency === 1;
      });
      
      return (selectedSkills.length / groupSkills.length) * 100;
    },
    getGroupColor(group) {
      const percentage = this.getGroupPercentage(group)
      if (percentage === 0) return 'grey'
      if (percentage < 50) return 'warning'
      if (percentage < 100) return 'info'
      return 'success'
    },
    downloadPDF() {
      // Placeholder for PDF download functionality
      alert('PDF download functionality will be implemented in the future')
    },
    shareResults() {
      // Placeholder for sharing functionality
      alert('Sharing functionality will be implemented in the future')
    }
  }
}
</script>

<style scoped>
.skill-summary {
  margin-top: 20px;
}

.group-rank, .category-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f5f5f5;
  font-weight: bold;
  color: #1976d2;
}
</style> 