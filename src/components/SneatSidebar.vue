<template>
  <aside class="sneat-sidebar" :class="{ 'show-sidebar': isMobileOpen }">
    <!-- Brand Logo -->
    <div class="app-brand">
      <router-link to="/dashboard" class="d-flex align-items-center text-decoration-none gap-2">
        <div class="app-brand-logo">
          <i class="bx bxs-truck fs-3"></i>
        </div>
        <div class="d-flex flex-column">
          <span class="app-brand-text fw-bolder">PLANT 2</span>
          <span class="text-xs text-muted fw-semibold">REPORTING SYSTEM</span>
        </div>
      </router-link>

      <button 
        class="btn btn-sm btn-icon d-xl-none text-muted" 
        @click="$emit('close-sidebar')"
        type="button"
      >
        <i class="bx bx-chevron-left fs-4"></i>
      </button>
    </div>

    <!-- Active User Role Badge -->
    <div class="px-3 pb-2 pt-1">
      <div 
        class="p-2 rounded d-flex align-items-center justify-content-between"
        :class="authStore.isPlanner ? 'bg-label-primary' : 'bg-label-success'"
      >
        <div class="d-flex align-items-center gap-2">
          <i class="bx fs-5" :class="authStore.isPlanner ? 'bx-shield-quarter' : 'bx-wrench'"></i>
          <div class="d-flex flex-column">
            <span class="text-xs fw-bold">{{ authStore.user?.role?.toUpperCase() }}</span>
            <span class="text-xs text-muted opacity-75">{{ authStore.isPlanner ? 'Admin Access' : 'User Access' }}</span>
          </div>
        </div>
        <span class="badge" :class="authStore.isPlanner ? 'bg-primary' : 'bg-success'">
          {{ authStore.user?.nrp || 'NRP' }}
        </span>
      </div>
    </div>

    <div class="menu-divider my-1 border-bottom"></div>

    <!-- Menu Items -->
    <ul class="menu-inner py-1">
      <!-- Dashboard -->
      <li class="menu-item" :class="{ active: $route.path === '/dashboard' }">
        <router-link to="/dashboard" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-home-circle"></i>
          <div>Dashboard</div>
        </router-link>
      </li>

      <!-- DATA MASTER HEADER -->
      <li class="menu-header small text-uppercase">
        <span class="menu-header-text">DATA MASTER</span>
      </li>

      <li class="menu-item" :class="{ active: $route.path === '/master/code-unit' }">
        <router-link to="/master/code-unit" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-car"></i>
          <div>Code Unit</div>
          <span class="badge rounded-pill bg-label-primary menu-badge">{{ plantStore.codeUnits.length }}</span>
        </router-link>
      </li>

      <li class="menu-item" :class="{ active: $route.path === '/master/hm' }">
        <router-link to="/master/hm" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-time-five"></i>
          <div>HM (Hour Meter)</div>
        </router-link>
      </li>

      <li class="menu-item" :class="{ active: $route.path === '/master/backlog' }">
        <router-link to="/master/backlog" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-list-check"></i>
          <div>Backlog</div>
          <span v-if="plantStore.pendingBacklogs > 0" class="badge rounded-pill bg-danger menu-badge">
            {{ plantStore.pendingBacklogs }}
          </span>
        </router-link>
      </li>

      <!-- PLAN TODAY HEADER -->
      <li class="menu-header small text-uppercase">
        <span class="menu-header-text">PLAN TODAY</span>
      </li>

      <!-- Plan Daily Submenu -->
      <li class="menu-item" :class="{ active: $route.path.startsWith('/plan/daily') }">
        <div 
          class="menu-link cursor-pointer d-flex justify-content-between align-items-center"
          @click="togglePlanDailyMenu"
        >
          <div class="d-flex align-items-center">
            <i class="menu-icon tf-icons bx bx-calendar-event"></i>
            <div>Plan Daily</div>
          </div>
          <i class="bx text-muted fs-6" :class="isPlanDailyOpen ? 'bx-chevron-down' : 'bx-chevron-right'"></i>
        </div>

        <ul class="list-unstyled ps-4 pt-1" v-show="isPlanDailyOpen">
          <li class="menu-item" :class="{ active: $route.path === '/plan/daily-rigid' }">
            <router-link to="/plan/daily-rigid" class="menu-link py-2" @click="handleLinkClick">
              <i class="bx bx-radio-circle-marked me-2"></i>
              <div>Daily Rigid</div>
            </router-link>
          </li>
          <li class="menu-item" :class="{ active: $route.path === '/plan/daily-artic' }">
            <router-link to="/plan/daily-artic" class="menu-link py-2" @click="handleLinkClick">
              <i class="bx bx-radio-circle-marked me-2"></i>
              <div>Daily Artic</div>
            </router-link>
          </li>
        </ul>
      </li>

      <!-- BAP -->
      <li class="menu-item" :class="{ active: $route.path === '/plan/bap' }">
        <router-link to="/plan/bap" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-file-blank"></i>
          <div>BAP</div>
          <span v-if="plantStore.openBaps > 0" class="badge rounded-pill bg-warning text-dark menu-badge">
            {{ plantStore.openBaps }}
          </span>
        </router-link>
      </li>

      <!-- AKTIVITAS -->
      <li class="menu-header small text-uppercase">
        <span class="menu-header-text">AKTIVITAS</span>
      </li>

      <li class="menu-item" :class="{ active: $route.path === '/aktivitas' }">
        <router-link to="/aktivitas" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-run"></i>
          <div>Log Aktivitas</div>
        </router-link>
      </li>

      <!-- LAPORAN -->
      <li class="menu-header small text-uppercase">
        <span class="menu-header-text">LAPORAN & ANALISIS</span>
      </li>

      <li class="menu-item" :class="{ active: $route.path === '/laporan' }">
        <router-link to="/laporan" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-chart"></i>
          <div>Laporan & Export</div>
        </router-link>
      </li>

      <!-- PENGATURAN -->
      <li class="menu-header small text-uppercase">
        <span class="menu-header-text">PENGATURAN</span>
      </li>

      <li class="menu-item" :class="{ active: $route.path === '/profil/planner' }">
        <router-link to="/profil/planner" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-user-pin"></i>
          <div>Profil Planner</div>
        </router-link>
      </li>

      <li class="menu-item" :class="{ active: $route.path === '/profil/maintenance' }">
        <router-link to="/profil/maintenance" class="menu-link" @click="handleLinkClick">
          <i class="menu-icon tf-icons bx bx-user-check"></i>
          <div>Profil Maintenance</div>
        </router-link>
      </li>

      <li class="menu-item" :class="{ active: $route.path === '/settings' }">
        <router-link to="/settings" class="menu-link d-flex justify-content-between align-items-center" @click="handleLinkClick">
          <div class="d-flex align-items-center">
            <i class="menu-icon tf-icons bx bx-cog"></i>
            <div>Supabase & Setup</div>
          </div>
          <span 
            class="badge rounded-pill" 
            :class="isSupabaseActive ? 'bg-success' : 'bg-warning text-dark'"
            style="font-size: 0.65rem;"
          >
            {{ isSupabaseActive ? 'Online' : 'Setup' }}
          </span>
        </router-link>
      </li>

      <li class="menu-item mt-3">
        <a href="javascript:void(0);" class="menu-link text-danger" @click="handleLogout">
          <i class="menu-icon tf-icons bx bx-power-off text-danger"></i>
          <div>Logout</div>
        </a>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePlantStore } from '../stores/plant';
import { getStoredSupabaseConfig } from '../services/supabase';

defineProps<{
  isMobileOpen: boolean;
}>();

const emit = defineEmits(['close-sidebar']);

const router = useRouter();
const authStore = useAuthStore();
const plantStore = usePlantStore();

const isSupabaseActive = computed(() => {
  return getStoredSupabaseConfig().isConfigured;
});

const isPlanDailyOpen = ref(true);

function togglePlanDailyMenu() {
  isPlanDailyOpen.value = !isPlanDailyOpen.value;
}

function handleLinkClick() {
  emit('close-sidebar');
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
