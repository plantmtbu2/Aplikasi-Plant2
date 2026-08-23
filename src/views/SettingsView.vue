<template>
  <div>
    <!-- Header -->
    <div class="mb-4">
      <h4 class="fw-bold mb-1">
        <span class="text-muted fw-light">Pengaturan /</span> Integrasi Supabase & Database Cloud
      </h4>
      <p class="text-muted mb-0 small">
        Kelola koneksi database Supabase PostgreSQL, verifikasi 8 tabel skema, sinkronisasi data master armada, dan panduan deployment VPS.
      </p>
    </div>

    <!-- Quick Guide Banner for Supabase Connection -->
    <div class="card bg-label-primary border-primary border-opacity-25 shadow-sm mb-4">
      <div class="card-body p-3 p-md-4">
        <div class="d-flex align-items-start gap-3">
          <div class="avatar avatar-md bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <i class="bx bxl-postgresql fs-3"></i>
          </div>
          <div class="flex-grow-1">
            <h6 class="fw-bold text-primary mb-1">
              Panduan Menghubungkan Supabase ke REPORTING PLANT2
            </h6>
            <p class="small text-muted mb-3">
              Ikuti 3 langkah cepat di bawah ini untuk menghubungkan proyek Supabase Anda ke aplikasi secara langsung:
            </p>
            <div class="row g-2 text-xs">
              <div class="col-12 col-md-4">
                <div class="p-2 bg-white rounded border h-100 dark-bg">
                  <div class="fw-bold text-success mb-1">
                    <i class="bx bx-check-circle me-1"></i> Langkah 1: Jalankan SQL
                  </div>
                  <span class="text-muted">Salin skrip SQL di bawah lalu Paste & RUN di menu <strong>SQL Editor</strong> di <code>supabase.com</code>.</span>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="p-2 bg-white rounded border h-100 dark-bg">
                  <div class="fw-bold text-primary mb-1">
                    <i class="bx bx-key me-1"></i> Langkah 2: Ambil API Kredensial
                  </div>
                  <span class="text-muted">Di Supabase, buka <strong>Project Settings (Gear) &gt; API</strong>. Salin <strong>Project URL</strong> & <strong>anon public key</strong>.</span>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="p-2 bg-white rounded border h-100 dark-bg">
                  <div class="fw-bold text-info mb-1">
                    <i class="bx bx-save me-1"></i> Langkah 3: Simpan & Sinkronkan
                  </div>
                  <span class="text-muted">Masukkan ke form di bawah, klik <strong>Simpan & Hubungkan</strong>, lalu tekan <strong>Sinkronkan Data Awal</strong>.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Supabase Connection Config Card -->
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm h-100">
          <div class="card-header border-bottom py-3 d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-bold">
              <i class="bx bxl-postgresql text-primary me-1"></i> Form Kredensial Supabase
            </h6>
            <span class="badge" :class="isSupabaseConnected ? 'bg-success' : 'bg-warning text-dark'">
              <i class="bx" :class="isSupabaseConnected ? 'bx-check-double me-1' : 'bx-wifi-off me-1'"></i>
              {{ isSupabaseConnected ? 'Terhubung ke Supabase' : 'Offline / Local Storage' }}
            </span>
          </div>

          <div class="card-body p-4">
            <form @submit.prevent="saveConfig">
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Supabase Project URL <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bx bx-globe"></i></span>
                  <input 
                    type="url" 
                    class="form-control" 
                    placeholder="https://abcdefghijklmn.supabase.co" 
                    v-model="supabaseUrl" 
                    required 
                  />
                </div>
                <div class="form-text text-xs">
                  Ditemukan di Supabase Dashboard &gt; <strong>Project Settings &gt; API &gt; Project URL</strong>.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Supabase Anon Key (Public API Key) <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bx bx-key"></i></span>
                  <input 
                    :type="showKey ? 'text' : 'password'" 
                    class="form-control font-mono" 
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                    v-model="supabaseKey" 
                    required 
                  />
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    @click="showKey = !showKey"
                    title="Tampilkan / Sembunyikan Key"
                  >
                    <i class="bx" :class="showKey ? 'bx-hide' : 'bx-show'"></i>
                  </button>
                </div>
                <div class="form-text text-xs">
                  Ditemukan di Supabase Dashboard &gt; <strong>Project Settings &gt; API &gt; Project API Keys &gt; anon / public</strong>.
                </div>
              </div>

              <!-- Connection Test Feedback Panel -->
              <div v-if="testResult" class="alert mb-3 py-2 px-3 text-xs" :class="testResult.success ? 'alert-success' : 'alert-warning'">
                <div class="d-flex align-items-start gap-2">
                  <i class="bx fs-5 mt-1" :class="testResult.success ? 'bx-check-circle text-success' : 'bx-error-circle text-warning'"></i>
                  <div>
                    <strong>{{ testResult.success ? 'Hasil Uji Koneksi: Sukses' : 'Hasil Uji Koneksi: Perhatian' }}</strong>
                    <p class="mb-1">{{ testResult.message }}</p>
                    <div v-if="testResult.tablesFound && testResult.tablesFound.length > 0" class="mt-1">
                      <span class="badge bg-success me-1 mb-1" v-for="tbl in testResult.tablesFound" :key="tbl">
                        ✓ {{ tbl }}
                      </span>
                    </div>
                    <div v-if="testResult.missingTables && testResult.missingTables.length > 0" class="mt-1">
                      <span class="badge bg-danger me-1 mb-1" v-for="tbl in testResult.missingTables" :key="tbl">
                        ✗ {{ tbl }} (Belum dibuat)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mt-4 pt-2 border-top">
                <div>
                  <button 
                    v-if="isSupabaseConnected" 
                    type="button" 
                    class="btn btn-outline-danger btn-sm" 
                    @click="disconnectSupabase"
                  >
                    <i class="bx bx-unlink me-1"></i> Putuskan Koneksi
                  </button>
                </div>

                <div class="d-flex gap-2">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    :disabled="isTesting" 
                    @click="runTestConnection"
                  >
                    <i class="bx me-1" :class="isTesting ? 'bx-loader-alt bx-spin' : 'bx-refresh'"></i>
                    {{ isTesting ? 'Menguji...' : 'Test Koneksi' }}
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="isSaving">
                    <i class="bx bx-save me-1"></i> Simpan & Hubungkan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Sync & Data Migration Card -->
      <div class="col-12 col-lg-5">
        <div class="card shadow-sm h-100">
          <div class="card-header border-bottom py-3">
            <h6 class="mb-0 fw-bold">
              <i class="bx bx-sync text-success me-1"></i> Sinkronisasi Data Cloud
            </h6>
          </div>

          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <p class="text-muted small mb-3">
                Setelah tabel dibuat di Supabase, Anda dapat mengisi tabel cloud dengan data armada awal (7 Master Alat Berat, BAP, Plan Daily & Backlog) dengan 1 klik:
              </p>

              <div class="border rounded p-3 mb-3 bg-light dark-bg">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-semibold text-xs text-uppercase text-muted">Status Data Saat Ini</span>
                  <span class="badge bg-label-info">{{ plantStore.totalUnits }} Unit Terdaftar</span>
                </div>
                <ul class="list-unstyled mb-0 text-xs space-y-1">
                  <li class="d-flex justify-content-between py-1 border-bottom">
                    <span><i class="bx bx-check text-success me-1"></i> Master Code Unit:</span>
                    <strong>{{ plantStore.totalUnits }} armada</strong>
                  </li>
                  <li class="d-flex justify-content-between py-1 border-bottom">
                    <span><i class="bx bx-file text-warning me-1"></i> Berita Acara (BAP):</span>
                    <strong>{{ plantStore.totalBaps }} laporan</strong>
                  </li>
                  <li class="d-flex justify-content-between py-1 border-bottom">
                    <span><i class="bx bx-calendar text-primary me-1"></i> Daily Rigid & Artic:</span>
                    <strong>{{ plantStore.dailyRigidList.length + plantStore.dailyArticList.length }} checklist</strong>
                  </li>
                  <li class="d-flex justify-content-between py-1">
                    <span><i class="bx bx-error text-danger me-1"></i> Backlog Spare Part:</span>
                    <strong>{{ plantStore.backlogs.length }} antrean</strong>
                  </li>
                </ul>
              </div>

              <!-- Push Data to Supabase Button -->
              <button 
                type="button" 
                class="btn btn-success w-100 mb-2" 
                :disabled="!isSupabaseConnected || isSyncing"
                @click="handlePushToSupabase"
              >
                <i class="bx me-1" :class="isSyncing ? 'bx-loader-alt bx-spin' : 'bx-cloud-upload'"></i>
                {{ isSyncing ? 'Mengunggah ke Supabase...' : 'Upload & Sinkronkan Data ke Supabase' }}
              </button>

              <!-- Pull Fresh Data from Supabase Button -->
              <button 
                type="button" 
                class="btn btn-outline-primary w-100 btn-sm" 
                :disabled="!isSupabaseConnected || isPulling"
                @click="handlePullFromSupabase"
              >
                <i class="bx me-1" :class="isPulling ? 'bx-loader-alt bx-spin' : 'bx-cloud-download'"></i>
                {{ isPulling ? 'Menarik Data Cloud...' : 'Tarik Data Terbaru dari Supabase' }}
              </button>
            </div>

            <div class="border-top pt-3 mt-3">
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-xs text-muted">Mode Role Switcher:</span>
                <div class="btn-group btn-group-sm">
                  <button 
                    class="btn btn-xs"
                    :class="authStore.isPlanner ? 'btn-primary' : 'btn-outline-primary'"
                    @click="authStore.switchRole('Planner')"
                  >
                    Planner
                  </button>
                  <button 
                    class="btn btn-xs"
                    :class="!authStore.isPlanner ? 'btn-success' : 'btn-outline-success'"
                    @click="authStore.switchRole('Maintenance')"
                  >
                    Maintenance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SQL Generator & Fix Section -->
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header border-bottom py-2 px-3 d-flex flex-wrap justify-content-between align-items-center gap-2 bg-light dark-bg">
            <ul class="nav nav-tabs card-header-tabs" role="tablist">
              <li class="nav-item">
                <button 
                  class="nav-link fw-semibold text-xs py-2" 
                  :class="{ active: sqlTab === 'fix' }"
                  @click="sqlTab = 'fix'"
                >
                  <i class="bx bx-wrench text-warning me-1"></i> Skrip Perbaikan RLS & Tipe Kolom (Quick Fix)
                  <span class="badge bg-danger ms-1">PENTING</span>
                </button>
              </li>
              <li class="nav-item">
                <button 
                  class="nav-link fw-semibold text-xs py-2" 
                  :class="{ active: sqlTab === 'full' }"
                  @click="sqlTab = 'full'"
                >
                  <i class="bx bx-code-block text-success me-1"></i> Skema SQL Lengkap (8 Tabel Baru)
                </button>
              </li>
            </ul>

            <div class="d-flex gap-2">
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noreferrer" 
                class="btn btn-xs btn-outline-secondary"
              >
                <i class="bx bx-link-external me-1"></i> Buka SQL Editor
              </a>
              <button 
                class="btn btn-xs" 
                :class="sqlTab === 'fix' ? 'btn-warning text-dark fw-semibold' : 'btn-success'" 
                @click="copyActiveSql"
              >
                <i class="bx bx-copy me-1"></i> {{ copied ? 'Tersalin!' : (sqlTab === 'fix' ? 'Copy Skrip Fix RLS' : 'Copy Skema Lengkap') }}
              </button>
            </div>
          </div>

          <div class="card-body p-3">
            <div v-if="sqlTab === 'fix'" class="alert alert-warning py-2 px-3 text-xs mb-2">
              <div class="d-flex align-items-center gap-2">
                <i class="bx bx-info-circle fs-5 text-warning flex-shrink-0"></i>
                <div>
                  <strong>Kenapa data gagal disimpan ke Supabase sebelumnya?</strong>
                  <br/>
                  Supabase mengaktifkan <em>Row Level Security (RLS)</em> secara default sehingga insert dari frontend diblokir jika policy belum diset ke <code>public</code>. Selain itu, tipe ID diubah menjadi <code>TEXT</code> agar menerima kode unit/BAP string. Salin skrip di bawah ini lalu jalankan (RUN) di <strong>Supabase SQL Editor</strong> untuk memperbaikinya dalam 1 detik!
                </div>
              </div>
            </div>

            <div class="bg-dark text-white p-3 rounded font-mono text-xs overflow-auto" style="max-height: 280px;">
              <pre class="mb-0 text-light">{{ sqlTab === 'fix' ? getSupabaseFixSql() : getSupabaseSchemaSql() }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- aaPanel VPS Deployment Guide -->
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header border-bottom py-3">
            <h6 class="mb-0 fw-bold">
              <i class="bx bx-server text-info me-1"></i> Panduan Deployment ke VPS (aaPanel / Nginx / Node.js)
            </h6>
          </div>

          <div class="card-body p-4">
            <div class="row g-4">
              <div class="col-12 col-md-4">
                <div class="p-3 border rounded h-100 bg-light dark-bg">
                  <div class="badge bg-primary mb-2">Langkah 1: Build Production</div>
                  <h6 class="fw-bold">Build Static Frontend</h6>
                  <p class="text-muted text-xs">Jalankan command build berikut pada terminal project:</p>
                  <code class="d-block p-2 bg-dark text-warning rounded text-xs mb-2">npm run build</code>
                  <span class="text-muted text-xs">Hasil build folder <code>dist/</code> siap diupload ke aaPanel.</span>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="p-3 border rounded h-100 bg-light dark-bg">
                  <div class="badge bg-info mb-2">Langkah 2: Setup aaPanel Website</div>
                  <h6 class="fw-bold">Upload ke aaPanel Web Root</h6>
                  <p class="text-muted text-xs">Di Dashboard aaPanel:</p>
                  <ol class="text-xs text-muted ps-3 mb-0">
                    <li>Pilih menu <strong>Website &gt; Add Site</strong>.</li>
                    <li>Masukkan domain Anda (misal: <code>reportingplant2.company.com</code>).</li>
                    <li>Upload isi folder <code>dist/</code> ke root direktori website (<code>/www/wwwroot/domain</code>).</li>
                  </ol>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="p-3 border rounded h-100 bg-light dark-bg">
                  <div class="badge bg-success mb-2">Langkah 3: Nginx SPA Routing & SSL</div>
                  <h6 class="fw-bold">Konfigurasi Nginx URL Rewrite</h6>
                  <p class="text-muted text-xs">Tambahkan rule rewrite berikut pada Nginx Config di aaPanel:</p>
                  <code class="d-block p-2 bg-dark text-success rounded text-xs mb-2">
                    location / {<br/>
                    &nbsp;&nbsp;try_files $uri $uri/ /index.html;<br/>
                    }
                  </code>
                  <span class="text-muted text-xs">Aktifkan <strong>Let's Encrypt SSL</strong> gratis pada tab SSL aaPanel.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePlantStore } from '../stores/plant';
import { getSupabaseSchemaSql, getSupabaseFixSql } from '../services/sqlGenerator';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  ConnectionTestResult 
} from '../services/supabase';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const plantStore = usePlantStore();

const config = getStoredSupabaseConfig();
const supabaseUrl = ref(config.url);
const supabaseKey = ref(config.anonKey);
const showKey = ref(false);
const isSupabaseConnected = ref(config.isConfigured);

const isTesting = ref(false);
const isSaving = ref(false);
const isSyncing = ref(false);
const isPulling = ref(false);
const copied = ref(false);
const sqlTab = ref<'fix' | 'full'>('fix');
const testResult = ref<ConnectionTestResult | null>(null);

onMounted(async () => {
  if (isSupabaseConnected.value && supabaseUrl.value && supabaseKey.value) {
    const res = await testSupabaseConnection(supabaseUrl.value, supabaseKey.value);
    testResult.value = res;
  }
});

async function runTestConnection() {
  if (!supabaseUrl.value.trim() || !supabaseKey.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Data Belum Lengkap',
      text: 'Silakan isi Supabase Project URL dan Anon Key terlebih dahulu.'
    });
    return;
  }

  isTesting.value = true;
  try {
    const res = await testSupabaseConnection(supabaseUrl.value, supabaseKey.value);
    testResult.value = res;

    if (res.success) {
      isSupabaseConnected.value = true;
      Swal.fire({
        icon: 'success',
        title: 'Koneksi Berhasil!',
        html: `<strong>${res.message}</strong><br><br><small class="text-muted">Total baris data terdeteksi: ${res.rowCount || 0}</small>`,
        confirmButtonText: 'Bagus!'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Belum Berhasil',
        html: `<p>${res.message}</p>${res.errorDetail ? `<small class="text-danger font-monospace">${res.errorDetail}</small>` : ''}`,
        confirmButtonText: 'Periksa Kembali'
      });
    }
  } finally {
    isTesting.value = false;
  }
}

async function saveConfig() {
  if (!supabaseUrl.value.trim() || !supabaseKey.value.trim()) return;
  isSaving.value = true;

  try {
    saveSupabaseConfig(supabaseUrl.value, supabaseKey.value);
    isSupabaseConnected.value = true;

    // Test and pull fresh data
    const res = await testSupabaseConnection(supabaseUrl.value, supabaseKey.value);
    testResult.value = res;

    await plantStore.fetchFromSupabase();

    Swal.fire({
      icon: 'success',
      title: 'Konfigurasi Tersimpan!',
      text: 'Supabase client telah aktif dan sinkronisasi data dimulai.',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: e?.message || 'Terjadi kesalahan saat menginisialisasi client Supabase.'
    });
  } finally {
    isSaving.value = false;
  }
}

function disconnectSupabase() {
  Swal.fire({
    title: 'Putuskan Supabase?',
    text: 'Aplikasi akan kembali ke mode penyimpanan offline LocalStorage.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Putuskan',
    cancelButtonText: 'Batal'
  }).then((r) => {
    if (r.isConfirmed) {
      saveSupabaseConfig('', '');
      supabaseUrl.value = '';
      supabaseKey.value = '';
      isSupabaseConnected.value = false;
      testResult.value = null;
      Swal.fire('Terputus', 'Supabase telah dinonaktifkan.', 'info');
    }
  });
}

async function handlePushToSupabase() {
  isSyncing.value = true;
  try {
    await plantStore.pushAllDataToSupabase();
    Swal.fire({
      icon: 'success',
      title: 'Data Berhasil Diunggah!',
      text: 'Seluruh data armada Plant 2, BAP, Daily Plans, dan Backlogs berhasil disinkronkan ke Supabase.',
      confirmButtonText: 'Selesai'
    });
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Sinkronisasi',
      text: e?.message || 'Pastikan skema tabel sudah dibuat di Supabase SQL Editor.'
    });
  } finally {
    isSyncing.value = false;
  }
}

async function handlePullFromSupabase() {
  isPulling.value = true;
  try {
    const hasData = await plantStore.fetchFromSupabase();
    Swal.fire({
      icon: 'success',
      title: 'Data Berhasil Ditarik!',
      text: hasData ? 'Data terbaru dari database Supabase telah dimuat.' : 'Tabel Supabase terhubung namun masih kosong.',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menarik Data',
      text: e?.message || 'Gagal memuat data dari Supabase.'
    });
  } finally {
    isPulling.value = false;
  }
}

function copyActiveSql() {
  const sql = sqlTab.value === 'fix' ? getSupabaseFixSql() : getSupabaseSchemaSql();
  navigator.clipboard.writeText(sql);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2500);

  Swal.fire({
    icon: 'success',
    title: sqlTab.value === 'fix' ? 'Skrip Quick Fix Tersalin!' : 'Skema SQL Lengkap Tersalin!',
    html: `
      <p class="mb-2">Buka <strong>SQL Editor</strong> di dashboard Supabase Anda, Paste, lalu klik tombol <strong>RUN</strong>.</p>
      <span class="text-xs text-muted">Setelah RUN selesai, klik tombol <strong>Upload & Sinkronkan Data</strong> di atas.</span>
    `,
    timer: 2800,
    showConfirmButton: false
  });
}

function copySql() {
  copyActiveSql();
}
</script>
