<template>
  <div class="card shadow-lg border-0">
    <div class="card-body p-4 p-sm-5">
      <!-- Logo & Brand Header -->
      <div class="app-brand justify-content-center mb-4">
        <div class="app-brand-link gap-2 align-items-center">
          <span class="app-brand-logo demo">
            <svg width="32" height="32" viewBox="0 0 25 42" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <path d="M13.7918663,0.358365126 L3.39788168,7.44174259 C0.566865006,9.69408886 -0.379795268,12.4788597 0.557900856,15.7960551 C0.68998853,16.2305145 1.09562888,17.7872135 3.12357076,19.2293357 C3.8146334,19.7207684 5.32369333,20.3834223 7.65075054,21.2172976 L7.59773219,21.2525164 L2.63468769,24.5493413 C0.445452254,26.3002124 -0.0172796873,28.8105774 1.24649884,32.0804365 C1.36844532,32.3798621 1.76563634,33.7288487 3.51358342,34.9328228 C4.39070311,35.5369236 6.13071661,36.2731885 8.73362391,37.1416174 L8.76102801,37.1487884 C8.79002473,37.160277 8.8188182,37.1719228 8.8474092,37.1837222 C11.6192898,38.3245674 13.9142999,39.0122203 15.7324508,39.2466957 C19.5495871,39.7380908 23.4542387,37.8999942 24.3219199,33.7380772 C25.9148187,26.1114584 25.6275817,20.8524269 23.4602091,17.9609825 C22.9960833,17.3416705 21.8398821,16.2373752 19.9916052,14.6480749 L13.7918663,0.358365126 Z" id="path-1"></path>
              </defs>
              <g id="g-app-brand" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Brand-Logo" transform="translate(-27.000000, -15.000000)">
                  <g id="Icon" transform="translate(27.000000, 15.000000)">
                    <g id="Mask" transform="translate(0.000000, 8.000000)">
                      <mask id="mask-2" fill="white">
                        <use xlink:href="#path-1"></use>
                      </mask>
                      <use fill="#696cff" xlink:href="#path-1"></use>
                      <g id="Path-3" mask="url(#mask-2)">
                        <use fill="#696cff" xlink:href="#path-1"></use>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </span>
          <span class="app-brand-text demo text-body fw-bolder text-uppercase fs-4">REPORTING PLANT2</span>
        </div>
      </div>

      <h4 class="mb-2 fw-bold text-center">Selamat Datang di Plant 2! 👋</h4>
      <p class="mb-4 text-muted text-center small">Sistem Manajemen & Pelaporan Alat Berat (Rigid & Artic)</p>

      <!-- Quick Role Switcher Tabs for Easy Testing -->
      <div class="mb-4">
        <label class="form-label text-xs fw-bold text-muted text-uppercase d-block text-center">Pilih Role Login Akun</label>
        <div class="btn-group w-100" role="group">
          <button 
            type="button" 
            class="btn btn-sm"
            :class="selectedRole === 'Planner' ? 'btn-primary' : 'btn-outline-primary'"
            @click="setRolePreset('Planner')"
          >
            <i class="bx bxs-user-badge me-1"></i> Planner (Admin)
          </button>
          <button 
            type="button" 
            class="btn btn-sm"
            :class="selectedRole === 'Maintenance' ? 'btn-info text-white' : 'btn-outline-info'"
            @click="setRolePreset('Maintenance')"
          >
            <i class="bx bx-wrench me-1"></i> Maintenance (User)
          </button>
        </div>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label required fw-semibold">Email Perusahaan</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bx bx-envelope"></i></span>
            <input
              type="email"
              class="form-control"
              id="email"
              name="email"
              placeholder="nama@plant2.com"
              v-model="email"
              required
            />
          </div>
        </div>

        <div class="mb-3 form-password-toggle">
          <div class="d-flex justify-content-between">
            <label class="form-label required fw-semibold" for="password">Password</label>
            <router-link to="/reset-password" class="text-xs text-primary">
              Lupa Password?
            </router-link>
          </div>
          <div class="input-group input-group-merge">
            <span class="input-group-text"><i class="bx bx-lock-alt"></i></span>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-control"
              name="password"
              placeholder="••••••••"
              v-model="password"
              required
            />
            <span class="input-group-text cursor-pointer" @click="showPassword = !showPassword">
              <i class="bx" :class="showPassword ? 'bx-hide' : 'bx-show'"></i>
            </span>
          </div>
        </div>

        <div class="mb-4 d-flex justify-content-between align-items-center">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="remember-me" v-model="rememberMe" />
            <label class="form-check-label text-xs" for="remember-me">
              Ingat Saya (Remember Login)
            </label>
          </div>
        </div>

        <div class="mb-3">
          <button class="btn btn-primary d-grid w-100 py-2 fw-bold" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            <span v-else><i class="bx bx-log-in me-1"></i> Masuk ke Dashboard</span>
          </button>
        </div>
      </form>

      <div class="p-3 bg-light dark-bg rounded border text-xs text-muted mt-4">
        <div class="fw-bold mb-1 text-dark dark-style-text"><i class="bx bx-info-circle me-1 text-primary"></i> Info Kredensial Demo:</div>
        <div>• <strong>Planner (Admin):</strong> planner@plant2.com / password123</div>
        <div>• <strong>Maintenance (User):</strong> maintenance@plant2.com / password123</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import type { UserRole } from '../types';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('planner@plant2.com');
const password = ref('password123');
const rememberMe = ref(true);
const showPassword = ref(false);
const loading = ref(false);
const selectedRole = ref<UserRole>('Planner');

function setRolePreset(role: UserRole) {
  selectedRole.value = role;
  if (role === 'Planner') {
    email.value = 'planner@plant2.com';
    password.value = 'password123';
  } else {
    email.value = 'maintenance@plant2.com';
    password.value = 'password123';
  }
}

async function handleLogin() {
  loading.value = true;
  const success = await authStore.login(email.value, password.value, selectedRole.value);
  loading.value = false;
  if (success) {
    router.push('/dashboard');
  }
}
</script>
