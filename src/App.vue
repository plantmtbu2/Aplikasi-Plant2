<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { usePlantStore } from './stores/plant';

const authStore = useAuthStore();
const plantStore = usePlantStore();

onMounted(() => {
  authStore.initAuth();
  plantStore.initStore();
});
</script>
