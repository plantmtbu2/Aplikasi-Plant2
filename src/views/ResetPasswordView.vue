<template>
  <div class="card shadow-lg border-0">
    <div class="card-body p-4 p-sm-5">
      <!-- Logo -->
      <div class="app-brand justify-content-center mb-4">
        <div class="app-brand-link gap-2 align-items-center">
          <span class="app-brand-text demo text-body fw-bolder text-uppercase fs-4">REPORTING PLANT2</span>
        </div>
      </div>

      <h4 class="mb-2 fw-bold text-center">Lupa Password? 🔒</h4>
      <p class="mb-4 text-muted text-center small">
        Masukkan email terdaftar Anda dan kami akan mengirimkan instruksi reset password via Supabase Auth.
      </p>

      <form @submit.prevent="handleReset">
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

        <button class="btn btn-primary d-grid w-100 py-2 fw-bold mb-3" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
          <span v-else><i class="bx bx-send me-1"></i> Kirim Link Reset</span>
        </button>

        <div class="text-center">
          <router-link to="/login" class="d-flex align-items-center justify-content-center text-xs text-primary">
            <i class="bx bx-chevron-left bx-sm"></i>
            Kembali ke Halaman Login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const loading = ref(false);

async function handleReset() {
  loading.value = true;
  await authStore.resetPassword(email.value);
  loading.value = false;
  router.push('/login');
}
</script>
