<template>
  <div class="position-relative w-100" style="min-height: 280px;">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps<{
  labels: string[];
  rigidData: number[];
  articData: number[];
  targetData: number[];
  type?: 'bar' | 'line';
  unit?: string;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

function renderChart() {
  if (!canvasRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: 'Actual Daily Rigid',
          data: props.rigidData,
          backgroundColor: '#696cff',
          borderColor: '#696cff',
          borderRadius: 4,
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        },
        {
          label: 'Actual Daily Artic',
          data: props.articData,
          backgroundColor: '#03c3ec',
          borderColor: '#03c3ec',
          borderRadius: 4,
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        },
        {
          type: 'line',
          label: 'Target Plan',
          data: props.targetData,
          borderColor: '#ffab00',
          backgroundColor: 'rgba(255, 171, 0, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 4,
          pointBackgroundColor: '#ffab00',
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            font: {
              family: 'Public Sans',
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(35, 52, 70, 0.9)',
          padding: 10,
          cornerRadius: 6,
          bodyFont: {
            family: 'Public Sans'
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Public Sans',
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(133, 146, 163, 0.15)'
          },
          ticks: {
            stepSize: 2,
            font: {
              family: 'Public Sans',
              size: 11
            }
          }
        }
      }
    }
  });
}

onMounted(() => {
  renderChart();
});

watch(
  () => [props.labels, props.rigidData, props.articData, props.targetData],
  () => {
    renderChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
