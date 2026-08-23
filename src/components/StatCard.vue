<template>
  <div class="card h-100 bento-stat-card border-0 shadow-sm">
    <div class="d-flex align-items-center justify-content-between mb-1">
      <div class="bento-icon-wrapper" :class="iconBgClass">
        <i class="bx fs-4" :class="[icon, iconColorClass]"></i>
      </div>
      <span 
        v-if="trend" 
        class="badge text-xs" 
        :class="trendPositive ? 'bg-label-success' : 'bg-label-danger'"
      >
        <i class="bx text-xs me-0.5" :class="trendPositive ? 'bx-up-arrow-alt' : 'bx-down-arrow-alt'"></i>
        {{ trend }}
      </span>
    </div>
    
    <div class="mt-2">
      <div class="text-xs text-muted fw-semibold text-uppercase tracking-wider mb-1">{{ title }}</div>
      <div class="fs-3 fw-bold text-dark dark-style-text lh-1 mb-1">{{ value }}</div>
      <div v-if="subtitle" class="text-xs text-muted text-truncate mt-1">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string | number;
    icon: string;
    color?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'secondary';
    trend?: string;
    trendPositive?: boolean;
    subtitle?: string;
  }>(),
  {
    color: 'primary',
    trendPositive: true
  }
);

const iconBgClass = computed(() => {
  return `bg-label-${props.color}`;
});

const iconColorClass = computed(() => {
  return `text-${props.color}`;
});
</script>

<style scoped>
.dark-style .dark-style-text {
  color: #e4e6f6 !important;
}
.tracking-wider {
  letter-spacing: 0.05em;
}
</style>

