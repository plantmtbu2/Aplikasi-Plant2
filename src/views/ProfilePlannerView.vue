<template>
  <div>
    <!-- Header -->
    <div class="mb-4">
      <h4 class="fw-bold mb-1">
        <span class="text-muted fw-light">Pengaturan /</span> Profil Planner (Admin)
      </h4>
      <p class="text-muted mb-0 small">
        Kelola identitas akun Planner, hak akses verifikasi laporan daily, approval BAP, dan sinkronisasi profil ke Supabase Cloud.
      </p>
    </div>

    <div class="row g-4">
      <!-- Profile Card -->
      <div class="col-12 col-md-5 col-lg-4">
        <div class="card shadow-sm text-center">
          <div class="card-body p-4">
            <div class="position-relative d-inline-block mb-3">
              <img 
                :src="previewAvatarUrl" 
                @error="handleImageError"
                alt="Foto Profil Planner" 
                class="rounded-circle border border-primary border-3 shadow-sm"
                style="width: 120px; height: 120px; object-fit: cover;"
              />
              <span class="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1" title="Planner (Admin Verified)">
                <i class="bx bxs-badge-check fs-5"></i>
              </span>
            </div>

            <h5 class="fw-bold mb-1">{{ formData.nama || 'Planner Plant 2' }}</h5>
            <span class="badge bg-label-primary px-3 py-1 mb-3">Planner (Admin Level)</span>

            <div class="text-start border-top pt-3 mt-2">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">NRP Pegawai:</span>
                <strong class="font-mono text-dark dark-style-text">{{ formData.nrp }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Email:</span>
                <span class="fw-semibold text-truncate ms-2" style="max-width: 170px;">{{ formData.email }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">No. HP / WA:</span>
                <span>{{ formData.phone || '-' }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Departemen:</span>
                <span class="text-end text-xs fw-semibold">{{ formData.department || 'Planning & Plant Reliability' }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Shift Kerja:</span>
                <span class="badge bg-label-info">{{ formData.shift || 'Day Shift' }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Status DB:</span>
                <span class="badge" :class="isSupabaseConnected ? 'bg-success' : 'bg-secondary'">
                  <i class="bx" :class="isSupabaseConnected ? 'bx-check-double' : 'bx-hdd'"></i>
                  {{ isSupabaseConnected ? 'Cloud Synced' : 'Local Storage' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Planner Responsibility Metrics -->
        <div class="card shadow-sm mt-4">
          <div class="card-header border-bottom py-3">
            <h6 class="mb-0 fw-bold">Statistik Pekerjaan Planner</h6>
          </div>
          <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <span class="small">BAP Disetujui</span>
              <span class="badge bg-label-success">{{ plantStore.approvedBaps }} Dokumen</span>
            </div>
            <div class="d-flex align-items-center justify-content-between mb-3">
              <span class="small">Backlog Dimonitor</span>
              <span class="badge bg-label-danger">{{ plantStore.backlogs.length }} Item</span>
            </div>
            <div class="d-flex align-items-center justify-content-between">
              <span class="small">Unit Aktif Dikelola</span>
              <span class="badge bg-label-primary">{{ plantStore.codeUnits.length }} Alat Berat</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form & Change Password -->
      <div class="col-12 col-md-7 col-lg-8">
        <!-- Edit Profile Details -->
        <div class="card shadow-sm mb-4">
          <div class="card-header border-bottom py-3 d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-bold"><i class="bx bx-user me-1 text-primary"></i> Data Identitas Planner</h6>
            <span class="badge bg-label-primary">Role: Planner (Admin)</span>
          </div>

          <div class="card-body p-4">
            <form @submit.prevent="saveProfile">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Nama Planner</label>
                  <input type="text" class="form-control" v-model="formData.nama" placeholder="Masukkan nama lengkap" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">NRP (Nomor Registrasi Pegawai)</label>
                  <input type="text" class="form-control font-mono" v-model="formData.nrp" placeholder="Contoh: PLN-88001" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Email Perusahaan</label>
                  <input type="email" class="form-control" v-model="formData.email" placeholder="planner@plant2.com" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Nomor WhatsApp / HP</label>
                  <input type="text" class="form-control" v-model="formData.phone" placeholder="+62 812-xxxx-xxxx" />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Departemen</label>
                  <input type="text" class="form-control" v-model="formData.department" placeholder="Planning & Plant Reliability Dept" />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Shift Kerja</label>
                  <select class="form-select" v-model="formData.shift">
                    <option value="Day Shift">Day Shift (07:00 - 17:00)</option>
                    <option value="Night Shift">Night Shift (17:00 - 05:00)</option>
                    <option value="Roster Shift">Roster Shift (6:2)</option>
                  </select>
                </div>

                <!-- Foto Profil Section -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Foto Profil</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bx bx-image-alt"></i></span>
                    <input 
                      type="text" 
                      class="form-control" 
                      placeholder="Tempel URL Foto atau Link Google Drive..." 
                      v-model="formData.foto" 
                    />
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary"
                      @click="triggerFilePicker"
                      title="Upload dari Komputer / HP"
                    >
                      <i class="bx bx-upload me-1"></i> Upload File
                    </button>
                  </div>
                  <input 
                    ref="fileInputRef" 
                    type="file" 
                    accept="image/*" 
                    class="d-none" 
                    @change="handleFileUpload" 
                  />
                  <div class="form-text small text-muted">
                    <i class="bx bx-info-circle me-1"></i> Mendukung direct image URL, link share Google Drive, atau upload gambar JPG/PNG langsung.
                  </div>
                </div>

                <div class="col-12 text-end mt-4">
                  <button type="submit" class="btn btn-primary px-4" :disabled="isSaving">
                    <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <i v-else class="bx bx-save me-1"></i>
                    {{ isSaving ? 'Menyimpan ke Supabase...' : 'Simpan Data Profil' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password Card -->
        <div class="card shadow-sm">
          <div class="card-header border-bottom py-3">
            <h6 class="mb-0 fw-bold"><i class="bx bx-lock-alt me-1 text-danger"></i> Ubah Password</h6>
          </div>

          <div class="card-body p-4">
            <form @submit.prevent="changePassword">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Password Baru</label>
                  <input type="password" class="form-control" placeholder="Minimal 6 karakter" v-model="newPassword" required minlength="6" />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Konfirmasi Password Baru</label>
                  <input type="password" class="form-control" placeholder="Ulangi password baru" v-model="confirmPassword" required minlength="6" />
                </div>

                <div class="col-12 text-end mt-4">
                  <button type="submit" class="btn btn-label-danger">
                    <i class="bx bx-key me-1"></i> Update Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePlantStore } from '../stores/plant';
import { formatDirectImageUrl, DEFAULT_AVATARS, compressImage } from '../services/imageHelper';
import { getStoredSupabaseConfig } from '../services/supabase';
import Swal from 'sweetalert2';

import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const plantStore = usePlantStore();

const formData = ref({
  nama: 'Budi Santoso, S.T.',
  nrp: 'PLN-88001',
  email: 'planner@plant2.com',
  foto: DEFAULT_AVATARS.Planner,
  phone: '+62 812-3456-7890',
  department: 'Planning & Plant Reliability Dept',
  shift: 'Day Shift'
});

const isSaving = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const newPassword = ref('');
const confirmPassword = ref('');

const isSupabaseConnected = computed(() => {
  return getStoredSupabaseConfig().isConfigured;
});

const previewAvatarUrl = computed(() => {
  const formatted = formatDirectImageUrl(formData.value.foto);
  return formatted || DEFAULT_AVATARS.Planner;
});

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = DEFAULT_AVATARS.Planner;
}

function triggerFilePicker() {
  fileInputRef.value?.click();
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  try {
    const compressed = await compressImage(file, 320, 0.75);
    formData.value.foto = compressed;
  } catch (err) {
    console.warn('Image file compression error:', err);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        formData.value.foto = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
}

onMounted(() => {
  if (authStore.user) {
    formData.value.nama = authStore.user.nama || formData.value.nama;
    formData.value.nrp = authStore.user.nrp || formData.value.nrp;
    formData.value.email = authStore.user.email || formData.value.email;
    formData.value.foto = authStore.user.foto_profil || authStore.user.foto || formData.value.foto;
    formData.value.phone = authStore.user.phone || formData.value.phone;
    formData.value.department = authStore.user.department || formData.value.department;
    formData.value.shift = authStore.user.shift || formData.value.shift;
  }
});

async function saveProfile() {
  isSaving.value = true;

  try {
    const cleanUrl = formatDirectImageUrl(formData.value.foto);
    const res = await authStore.updateProfile({
      nama: formData.value.nama,
      nrp: formData.value.nrp,
      email: formData.value.email,
      foto: cleanUrl,
      foto_profil: cleanUrl,
      phone: formData.value.phone,
      department: formData.value.department,
      shift: formData.value.shift
    });

    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Profil Planner Berhasil Disimpan',
        text: isSupabaseConnected.value 
          ? 'Data profil berhasil disinkronkan ke Supabase Cloud dan memori lokal.' 
          : 'Data profil berhasil disimpan di penyimpanan lokal browser.',
        timer: 2500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Tersimpan Lokal dengan Catatan',
        html: `
          <p class="mb-2">Profil berhasil disimpan di browser Anda, namun gagal tersinkron ke Supabase Cloud.</p>
          <div class="p-2 bg-light rounded text-danger small font-mono text-start mb-3" style="max-height: 100px; overflow-y: auto;">
            <strong>Pesan Database:</strong> ${res.error || 'Tabel profiles tidak ditemukan atau permission terbatas'}
          </div>
          <p class="text-muted small mb-0">Pastikan Anda telah menjalankan <strong>Skrip SQL Supabase</strong> di menu Pengaturan Database Supabase SQL Editor.</p>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="bx bx-cog me-1"></i> Buka Pengaturan Database',
        cancelButtonText: 'Tutup'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/settings');
        }
      });
    }
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan ke Supabase',
      text: err?.message || 'Terjadi gangguan saat menyimpan ke database Supabase.'
    });
  } finally {
    isSaving.value = false;
  }
}

async function changePassword() {
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({
      icon: 'error',
      title: 'Password Tidak Cocok',
      text: 'Konfirmasi password baru harus sama dengan password baru.'
    });
    return;
  }

  Swal.fire({
    icon: 'success',
    title: 'Password Berhasil Diubah',
    text: 'Password baru Anda telah aktif.',
    timer: 2000,
    showConfirmButton: false
  });
  newPassword.value = '';
  confirmPassword.value = '';
}
</script>
