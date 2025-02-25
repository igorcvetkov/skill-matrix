<template>
  <div>
    <button @click="shuffleData">Shuffle</button>
    <BarChart v-bind="barChartProps" />
  </div>
  <div>
    <h2>Spider Chart Example</h2>
    <RadarChart :chart-data="chartDataForRadar" :options="chartOptionsForRadar" />
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";
import { BarChart, useBarChart, RadarChart } from "vue-chart-3";
import { ref, computed, defineComponent } from "vue";
import { shuffle } from "lodash";

Chart.register(...registerables);

export default defineComponent({
  components: {
    BarChart,
    RadarChart,
  },
  setup() {
    const data = ref([30, 40, 60, 70, 5]);

    const chartData = computed(() => ({
      labels: ["Paris", "Nîmes", "Toulon", "Perpignan", "Autre"],
      datasets: [
        {
          data: data.value,
          backgroundColor: ["#77CEFF", "#0079AF", "#123E6B", "#97B0C4", "#A5C8ED"],
        },
      ],
    }));

    const { barChartProps, barChartRef } = useBarChart({
      chartData,
    });

    function shuffleData() {
      data.value = shuffle(data.value);
    }

    const chartDataForRadar = ref({
      labels: ["Strength", "Speed", "Endurance", "Agility", "Intelligence"],
      datasets: [
        {
          label: "Character A",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          data: [80, 70, 90, 60, 85],
        },
        {
          label: "Character B",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          data: [60, 80, 70, 90, 75],
        },
      ],
    });

    // Define options for the chart
    const chartOptionsForRadar = ref({
      responsive: true,
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    });

    return { shuffleData, barChartProps, barChartRef, chartDataForRadar, chartOptionsForRadar };
  },
});
</script>

<style></style>
