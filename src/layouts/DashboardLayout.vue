<template>
  <div class="layout-wrapper layout-content-navbar">
    <div class="layout-container">
      <!-- Sneat Sidebar -->
      <SneatSidebar 
        :is-mobile-open="isMobileSidebarOpen"
        @close-sidebar="isMobileSidebarOpen = false"
      />

      <!-- Mobile Backdrop -->
      <div 
        v-if="isMobileSidebarOpen" 
        class="sidebar-backdrop d-xl-none" 
        @click="isMobileSidebarOpen = false"
      ></div>

      <!-- Layout Page -->
      <div class="layout-page">
        <!-- Sneat Navbar -->
        <SneatNavbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />

        <!-- Content wrapper -->
        <div class="content-wrapper">
          <main class="container-xxl flex-grow-1 container-p-y py-4">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </main>

          <!-- Sneat Footer -->
          <SneatFooter />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SneatSidebar from '../components/SneatSidebar.vue';
import SneatNavbar from '../components/SneatNavbar.vue';
import SneatFooter from '../components/SneatFooter.vue';
import { useAuthStore } from '../stores/auth';
import { usePlantStore } from '../stores/plant';

const isMobileSidebarOpen = ref(false);
const authStore = useAuthStore();
const plantStore = usePlantStore();

onMounted(() => {
  authStore.applyInitialTheme();
  plantStore.fetchFromSupabase();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
