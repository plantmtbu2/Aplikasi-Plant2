<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1">
          <span class="text-muted fw-light">Aktivitas /</span> Log Aktivitas Perbaikan & Maintenance
        </h4>
        <p class="text-muted mb-0 small">
          Pencatatan real-time kegiatan teknisi di workshop dan lapangan (greasing, flushing, penggantian part, troubleshooting).
        </p>
      </div>

      <button class="btn btn-primary" @click="openAddModal">
        <i class="bx bx-plus me-1"></i> Tambah Aktivitas
      </button>
    </div>

    <!-- Filter -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-5">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Cari Aktivitas</label>
            <input type="text" class="form-control" placeholder="Cari deskripsi, PIC, catatan..." v-model="searchQuery" />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Filter Code Unit</label>
            <select class="form-select" v-model="filterUnit">
              <option value="">Semua Unit</option>
              <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">{{ u.code_unit }}</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Total Log</label>
            <div class="form-control bg-light dark-bg fw-bold font-mono">{{ filteredList.length }} Aktivitas</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aktivitas Cards Grid / Table -->
    <div class="row g-3">
      <div 
        v-for="akt in filteredList" 
        :key="akt.id"
        class="col-12 col-md-6 col-xl-4"
      >
        <div class="card h-100 shadow-sm border">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-label-primary fs-6">{{ akt.code_unit }}</span>
              <span class="badge bg-label-secondary font-mono">HM: {{ akt.hm }}</span>
            </div>

            <h6 class="fw-bold mb-2 text-truncate" :title="akt.deskripsi_aktivitas">
              {{ akt.deskripsi_aktivitas }}
            </h6>

            <p class="text-muted text-xs mb-3" style="min-height: 38px;">
              {{ akt.catatan || 'Tidak ada catatan tambahan teknis.' }}
            </p>

            <div v-if="akt.foto" class="mb-3">
              <img :src="akt.foto" alt="Foto Aktivitas" class="img-fluid rounded border w-100" style="height: 140px; object-fit: cover;" />
            </div>

            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
              <div class="d-flex align-items-center gap-1">
                <i class="bx bx-user text-muted text-xs"></i>
                <small class="text-muted text-xs">{{ akt.pic }} • {{ akt.timestamp }}</small>
              </div>
              <div class="d-flex gap-1">
                <button class="btn btn-icon btn-sm btn-label-primary" @click="openEditModal(akt)" title="Edit">
                  <i class="bx bx-edit"></i>
                </button>
                <button class="btn btn-icon btn-sm btn-label-danger" @click="plantStore.deleteAktivitas(akt.id)" title="Hapus">
                  <i class="bx bx-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredList.length === 0" class="col-12">
        <div class="card p-5 text-center text-muted">
          <i class="bx bx-run fs-1 text-primary mb-2"></i>
          <p class="mb-0">Belum ada log aktivitas yang tercatat untuk filter ini.</p>
        </div>
      </div>
    </div>

    <!-- Modal Form Aktivitas -->
    <div class="modal fade show d-block" v-if="showModal" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bx" :class="isEditMode ? 'bx-edit' : 'bx-plus-circle'"></i>
              {{ isEditMode ? 'Edit Log Aktivitas' : 'Tambah Log Aktivitas Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>

          <form @submit.prevent="saveAktivitas">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Code Unit</label>
                  <select class="form-select" v-model="formData.code_unit" @change="onUnitChange" required>
                    <option value="" disabled>Pilih Unit</option>
                    <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">{{ u.code_unit }}</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Hour Meter (HM)</label>
                  <input type="number" step="0.1" class="form-control" v-model.number="formData.hm" required />
                </div>

                <div class="col-12">
                  <label class="form-label required fw-semibold">Timestamp / Waktu</label>
                  <input type="text" class="form-control" v-model="formData.timestamp" required />
                </div>

                <div class="col-12">
                  <label class="form-label required fw-semibold">Deskripsi Aktivitas</label>
                  <textarea class="form-control" rows="2" placeholder="misal: Flushing sistem hidrolik dan pergantian return filter..." v-model="formData.deskripsi_aktivitas" required></textarea>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Catatan Tambahan Teknis</label>
                  <textarea class="form-control" rows="2" placeholder="Catatan part number, volume oli, tekanan kerja..." v-model="formData.catatan"></textarea>
                </div>

                <div class="col-12">
                  <PhotoUploadPreview label="Dokumentasi Foto Pekerjaan (Foto Aktivitas)" v-model="formData.foto" />
                </div>

                <div class="col-12">
                  <label class="form-label required fw-semibold">PIC Teknisi / Mekanik</label>
                  <input type="text" class="form-control" v-model="formData.pic" required />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
              <button type="submit" class="btn btn-primary">
                <i class="bx bx-save me-1"></i> Simpan Aktivitas
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlantStore } from '../stores/plant';
import { useAuthStore } from '../stores/auth';
import PhotoUploadPreview from '../components/PhotoUploadPreview.vue';
import type { Aktivitas } from '../types';

const plantStore = usePlantStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const filterUnit = ref('');

const filteredList = computed(() => {
  return plantStore.aktivitasList.filter(a => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchQuery = !q || 
      a.code_unit.toLowerCase().includes(q) || 
      a.deskripsi_aktivitas.toLowerCase().includes(q) || 
      a.pic.toLowerCase().includes(q) ||
      a.catatan.toLowerCase().includes(q);

    const matchUnit = !filterUnit.value || a.code_unit === filterUnit.value;
    return matchQuery && matchUnit;
  });
});

const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<string | null>(null);

const formData = ref<Omit<Aktivitas, 'id' | 'created_at'>>({
  timestamp: '',
  code_unit: '',
  hm: 0,
  deskripsi_aktivitas: '',
  catatan: '',
  foto: '',
  pic: ''
});

function onUnitChange() {
  const u = plantStore.codeUnits.find(unit => unit.code_unit === formData.value.code_unit);
  if (u) formData.value.hm = u.current_hm;
}

function openAddModal() {
  isEditMode.value = false;
  editingId.value = null;
  const defaultUnit = plantStore.codeUnits[0];

  formData.value = {
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    code_unit: defaultUnit ? defaultUnit.code_unit : '',
    hm: defaultUnit ? defaultUnit.current_hm : 0,
    deskripsi_aktivitas: '',
    catatan: '',
    foto: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500',
    pic: authStore.user?.nama || 'Agus Hendrawan'
  };
  showModal.value = true;
}

function openEditModal(akt: Aktivitas) {
  isEditMode.value = true;
  editingId.value = akt.id;
  formData.value = { ...akt };
  showModal.value = true;
}

function saveAktivitas() {
  if (isEditMode.value && editingId.value) {
    plantStore.updateAktivitas(editingId.value, formData.value);
  } else {
    plantStore.addAktivitas(formData.value);
  }
  showModal.value = false;
}
</script>
