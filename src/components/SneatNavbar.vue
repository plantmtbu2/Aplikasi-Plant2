<template>
  <nav class="sneat-navbar navbar navbar-expand-xl align-items-center" id="layout-navbar">
    <div class="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
      <a class="nav-item nav-link px-0 me-xl-4 cursor-pointer" @click="$emit('toggle-sidebar')">
        <i class="bx bx-menu bx-sm"></i>
      </a>
    </div>

    <div class="navbar-nav-right d-flex align-items-center justify-content-between w-100" id="navbar-collapse">
      <!-- Search Input / Breadcrumb Info -->
      <div class="navbar-nav align-items-center">
        <div class="nav-item d-flex align-items-center">
          <i class="bx bx-search fs-4 lh-0 text-muted me-2"></i>
          <input
            type="text"
            class="form-control border-0 shadow-none ps-1 ps-sm-2"
            placeholder="Cari Code Unit (misal: RD-777D, AT-740B)..."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            style="min-width: 220px;"
          />
        </div>
      </div>

      <!-- Right Action Icons & Profile -->
      <ul class="navbar-nav flex-row align-items-center ms-auto gap-2">
        <!-- Supabase Status Badge Button -->
        <li class="nav-item d-none d-sm-block">
          <router-link 
            to="/settings" 
            class="btn btn-sm py-1 px-2 d-flex align-items-center gap-1 rounded-pill"
            :class="isSupabaseActive ? 'btn-label-success' : 'btn-label-warning'"
            :title="isSupabaseActive ? 'Supabase Terhubung (Klik untuk melihat Pengaturan DB)' : 'Supabase Belum Terhubung (Klik untuk memasukkan Kredensial)'"
          >
            <i class="bx fs-6" :class="isSupabaseActive ? 'bxl-postgresql text-success' : 'bx-wifi-off text-warning'"></i>
            <span class="text-xs fw-semibold">
              {{ isSupabaseActive ? 'Supabase Cloud' : 'Connect DB' }}
            </span>
          </router-link>
        </li>

        <!-- Quick Role Switcher (Planner / Maintenance) -->
        <li class="nav-item">
          <div class="btn-group btn-group-sm" role="group">
            <button
              type="button"
              class="btn"
              :class="authStore.isPlanner ? 'btn-primary' : 'btn-outline-primary'"
              @click="authStore.switchRole('Planner')"
              title="Ganti ke Role Planner (Admin)"
            >
              <i class="bx bx-shield-quarter me-1"></i>
              <span class="d-none d-md-inline">Planner (Admin)</span>
            </button>
            <button
              type="button"
              class="btn"
              :class="authStore.isMaintenance ? 'btn-success' : 'btn-outline-success'"
              @click="authStore.switchRole('Maintenance')"
              title="Ganti ke Role Maintenance (User)"
            >
              <i class="bx bx-wrench me-1"></i>
              <span class="d-none d-md-inline">Maintenance (User)</span>
            </button>
          </div>
        </li>

        <!-- Dark / Light Mode Toggle -->
        <li class="nav-item">
          <button 
            class="btn btn-icon btn-sm btn-label-secondary rounded-circle" 
            @click="authStore.toggleDarkMode"
            :title="authStore.isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'"
            type="button"
          >
            <i class="bx fs-5" :class="authStore.isDarkMode ? 'bx-sun text-warning' : 'bx-moon text-primary'"></i>
          </button>
        </li>

        <!-- Notification Bell -->
        <li class="nav-item dropdown">
          <button 
            class="btn btn-icon btn-sm btn-label-secondary rounded-circle position-relative" 
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bx bx-bell fs-5"></i>
            <span 
              v-if="plantStore.openBaps + plantStore.pendingBacklogs > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style="font-size: 0.65rem;"
            >
              {{ plantStore.openBaps + plantStore.pendingBacklogs }}
            </span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end p-2 shadow" style="min-width: 280px;">
            <li class="dropdown-header text-uppercase text-xs fw-bold text-muted pb-1">
              Notifikasi Plant 2
            </li>
            <li><hr class="dropdown-divider my-1"></li>
            <li v-if="plantStore.openBaps > 0">
              <router-link to="/plan/bap" class="dropdown-item d-flex align-items-center gap-2 py-2">
                <i class="bx bx-error-circle text-warning fs-4"></i>
                <div class="d-flex flex-column">
                  <span class="text-xs fw-bold">{{ plantStore.openBaps }} BAP Memerlukan Tindakan</span>
                  <span class="text-xs text-muted">Review dan approve perbaikan unit</span>
                </div>
              </router-link>
            </li>
            <li v-if="plantStore.pendingBacklogs > 0">
              <router-link to="/master/backlog" class="dropdown-item d-flex align-items-center gap-2 py-2">
                <i class="bx bx-time text-danger fs-4"></i>
                <div class="d-flex flex-column">
                  <span class="text-xs fw-bold">{{ plantStore.pendingBacklogs }} Backlog Menunggu Part/Action</span>
                  <span class="text-xs text-muted">Pengecekan part dan reservasi</span>
                </div>
              </router-link>
            </li>
            <li v-if="plantStore.openBaps === 0 && plantStore.pendingBacklogs === 0">
              <div class="p-3 text-center text-muted small">
                <i class="bx bx-check-double text-success fs-3 d-block mb-1"></i>
                Tidak ada notifikasi mendesak saat ini.
              </div>
            </li>
          </ul>
        </li>

        <!-- User Profile Dropdown -->
        <li class="nav-item dropdown">
          <a
            class="nav-link dropdown-toggle hide-arrow d-flex align-items-center gap-2 cursor-pointer p-0"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div class="avatar avatar-online">
              <img 
                :src="authStore.user?.foto_profil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'" 
                @error="($event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'"
                alt="Avatar" 
                class="rounded-circle shadow-sm"
                style="object-fit: cover; width: 38px; height: 38px;"
              />
            </div>
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow p-2" style="min-width: 240px;">
            <li>
              <div class="d-flex align-items-center gap-2 p-2">
                <div class="avatar avatar-md">
                  <img 
                    :src="authStore.user?.foto_profil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'" 
                    @error="($event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'"
                    class="rounded-circle" 
                    style="object-fit: cover; width: 40px; height: 40px;"
                  />
                </div>
                <div class="d-flex flex-column">
                  <span class="fw-semibold text-truncate" style="max-width: 150px;">{{ authStore.user?.nama }}</span>
                  <span class="text-xs text-muted">{{ authStore.user?.nrp }} • {{ authStore.user?.role }}</span>
                </div>
              </div>
            </li>
            <li><hr class="dropdown-divider my-1"></li>
            <li>
              <router-link :to="authStore.isPlanner ? '/profil/planner' : '/profil/maintenance'" class="dropdown-item d-flex align-items-center py-2">
                <i class="bx bx-user me-2"></i>
                <span>Profil Saya</span>
              </router-link>
            </li>
            <li>
              <router-link to="/settings" class="dropdown-item d-flex align-items-center py-2">
                <i class="bx bx-cog me-2"></i>
                <span>Supabase & DB Setup</span>
              </router-link>
            </li>
            <li><hr class="dropdown-divider my-1"></li>
            <li>
              <a class="dropdown-item text-danger d-flex align-items-center py-2 cursor-pointer" @click="handleLogout">
                <i class="bx bx-power-off me-2"></i>
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePlantStore } from '../stores/plant';
import { getStoredSupabaseConfig } from '../services/supabase';

defineEmits(['toggle-sidebar']);

const router = useRouter();
const authStore = useAuthStore();
const plantStore = usePlantStore();

const isSupabaseActive = computed(() => {
  return getStoredSupabaseConfig().isConfigured;
});

const searchQuery = ref('');

function handleSearch() {
  if (!searchQuery.value.trim()) return;
  router.push({
    path: '/master/code-unit',
    query: { q: searchQuery.value.trim() }
  });
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
