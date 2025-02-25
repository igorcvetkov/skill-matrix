<template>
  <radar :chart-data="chartDataComplete" :options="chartOptions" />
</template>
<script>
import { RadarChart } from "vue-chart-3";

export default {
  props: {
    chartDataComplete: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  components: {
    radar: RadarChart,
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 10,
          },
        },
      },
    };
  },
  created() {},
};
</script>
