<template>
  <div class="container-xxl min-vh-100 d-flex align-items-center justify-content-center py-5">
    <div class="authentication-wrapper authentication-basic container-p-y w-100" style="max-width: 440px;">
      <div class="authentication-inner">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.applyInitialTheme();
});
</script>
