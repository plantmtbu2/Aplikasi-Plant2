<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1">
          <span class="text-muted fw-light">Data Master /</span> Master Code Unit
        </h4>
        <p class="text-muted mb-0 small">
          Kelola armada alat berat (Rigid Truck, Articulated Hauler, Support Grader & Dozer) di Plant 2.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button 
          class="btn btn-primary"
          @click="openAddModal"
        >
          <i class="bx bx-plus me-1"></i> Tambah Code Unit
        </button>
      </div>
    </div>

    <!-- Filter & Search Card -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Pencarian</label>
            <div class="input-group input-group-merge">
              <span class="input-group-text"><i class="bx bx-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Cari Code Unit, EGI, atau Model..." 
                v-model="searchQuery" 
              />
            </div>
          </div>

          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Tipe Unit</label>
            <select class="form-select" v-model="filterType">
              <option value="">Semua Tipe (All)</option>
              <option value="Rigid">Rigid (Dump Truck)</option>
              <option value="Artic">Artic (Articulated Hauler)</option>
              <option value="Support">Support (Grader/Dozer)</option>
            </select>
          </div>

          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Status Operasional</label>
            <select class="form-select" v-model="filterStatus">
              <option value="">Semua Status</option>
              <option value="Operating">Operating (Aktif)</option>
              <option value="Under Maintenance">Under Maintenance (Breakdown/Bay)</option>
              <option value="Standby">Standby (Siap)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Code Units Table Card -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold">Daftar Code Unit ({{ filteredUnits.length }})</h6>
        <span class="badge bg-label-primary">Plant 2 Fleet</span>
      </div>

      <div class="table-responsive text-nowrap">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Code Unit</th>
              <th>EGI & Model</th>
              <th>Tipe</th>
              <th>Lokasi Pit/Area</th>
              <th>Current HM</th>
              <th>Status</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="table-border-bottom-0">
            <tr v-for="unit in filteredUnits" :key="unit.id">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div 
                    class="avatar avatar-sm rounded d-flex align-items-center justify-content-center"
                    :class="unit.type === 'Rigid' ? 'bg-label-primary' : (unit.type === 'Artic' ? 'bg-label-info' : 'bg-label-warning')"
                  >
                    <i class="bx fs-5" :class="unit.type === 'Rigid' ? 'bxs-truck' : (unit.type === 'Artic' ? 'bx-wrench' : 'bx-layer')"></i>
                  </div>
                  <div>
                    <strong class="d-block text-primary">{{ unit.code_unit }}</strong>
                    <small class="text-muted text-xs font-mono">{{ unit.serial_number || 'S/N N/A' }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="fw-semibold">{{ unit.egi }}</div>
                <small class="text-muted text-xs">{{ unit.model || '-' }}</small>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-label-primary': unit.type === 'Rigid',
                    'bg-label-info': unit.type === 'Artic',
                    'bg-label-warning': unit.type === 'Support'
                  }"
                >
                  {{ unit.type }}
                </span>
              </td>
              <td>
                <i class="bx bx-map-pin text-danger me-1"></i>
                <span>{{ unit.lokasi }}</span>
              </td>
              <td>
                <span class="badge bg-label-secondary font-mono fs-6">
                  {{ unit.current_hm.toLocaleString('id-ID') }} Jam
                </span>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-label-success': unit.status === 'Operating',
                    'bg-label-danger': unit.status === 'Under Maintenance' || unit.status === 'Breakdown',
                    'bg-label-warning': unit.status === 'Standby'
                  }"
                >
                  {{ unit.status }}
                </span>
              </td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <button 
                    class="btn btn-icon btn-sm btn-label-primary" 
                    @click="openEditModal(unit)"
                    title="Edit Unit"
                  >
                    <i class="bx bx-edit"></i>
                  </button>
                  <button 
                    class="btn btn-icon btn-sm btn-label-danger" 
                    @click="plantStore.deleteCodeUnit(unit.id)"
                    title="Hapus Unit"
                  >
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredUnits.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="bx bx-info-circle fs-2 d-block mb-2 text-warning"></i>
                Tidak ada unit yang sesuai dengan kriteria filter/pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit Code Unit) -->
    <div 
      class="modal fade show d-block" 
      v-if="showModal" 
      tabindex="-1" 
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bx" :class="isEditMode ? 'bx-edit' : 'bx-plus-circle'"></i>
              {{ isEditMode ? 'Edit Code Unit' : 'Tambah Code Unit Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <form @submit.prevent="saveUnit">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Code Unit</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="misal: RD-777D-03" 
                    v-model="formData.code_unit" 
                    required 
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">EGI (Equipment Group)</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="misal: CAT 777D" 
                    v-model="formData.egi" 
                    required 
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Tipe Alat Berat</label>
                  <select class="form-select" v-model="formData.type" required>
                    <option value="Rigid">Rigid (Dump Truck)</option>
                    <option value="Artic">Artic (Articulated Hauler)</option>
                    <option value="Support">Support</option>
                    <option value="Excavator">Excavator</option>
                    <option value="Dozer">Dozer</option>
                    <option value="Grader">Grader</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Status</label>
                  <select class="form-select" v-model="formData.status" required>
                    <option value="Operating">Operating (Beroperasi)</option>
                    <option value="Under Maintenance">Under Maintenance (Breakdown/Bay)</option>
                    <option value="Standby">Standby (Siap)</option>
                    <option value="Breakdown">Breakdown</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label required fw-semibold">Lokasi Operasional / Workshop</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="misal: Pit North Block 4 / Workshop Bay 2" 
                    v-model="formData.lokasi" 
                    required 
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Current Hour Meter (HM)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    class="form-control" 
                    placeholder="12450.5" 
                    v-model.number="formData.current_hm" 
                  />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Serial Number</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="misal: 777D-SN09814" 
                    v-model="formData.serial_number" 
                  />
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Model Deskripsi Lengkap</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="misal: Caterpillar 777D Off-Highway Truck 100 Ton" 
                    v-model="formData.model" 
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary">
                <i class="bx bx-save me-1"></i> {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Unit' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePlantStore } from '../stores/plant';
import type { CodeUnit } from '../types';

const route = useRoute();
const plantStore = usePlantStore();

const searchQuery = ref('');
const filterType = ref('');
const filterStatus = ref('');

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q as string;
  }
});

const filteredUnits = computed(() => {
  return plantStore.codeUnits.filter(u => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchQuery = !q || 
      u.code_unit.toLowerCase().includes(q) || 
      u.egi.toLowerCase().includes(q) || 
      (u.model && u.model.toLowerCase().includes(q)) ||
      u.lokasi.toLowerCase().includes(q);

    const matchType = !filterType.value || u.type === filterType.value;
    const matchStatus = !filterStatus.value || u.status === filterStatus.value;

    return matchQuery && matchType && matchStatus;
  });
});

// Modal State
const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<string | null>(null);

const formData = ref<Omit<CodeUnit, 'id'>>({
  code_unit: '',
  egi: '',
  type: 'Rigid',
  lokasi: '',
  current_hm: 0,
  status: 'Operating',
  model: '',
  serial_number: ''
});

function openAddModal() {
  isEditMode.value = false;
  editingId.value = null;
  formData.value = {
    code_unit: '',
    egi: '',
    type: 'Rigid',
    lokasi: '',
    current_hm: 0,
    status: 'Operating',
    model: '',
    serial_number: ''
  };
  showModal.value = true;
}

function openEditModal(unit: CodeUnit) {
  isEditMode.value = true;
  editingId.value = unit.id;
  formData.value = {
    code_unit: unit.code_unit,
    egi: unit.egi,
    type: unit.type,
    lokasi: unit.lokasi,
    current_hm: unit.current_hm,
    status: unit.status,
    model: unit.model || '',
    serial_number: unit.serial_number || ''
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function saveUnit() {
  if (isEditMode.value && editingId.value) {
    plantStore.updateCodeUnit(editingId.value, formData.value);
  } else {
    plantStore.addCodeUnit(formData.value);
  }
  closeModal();
}
</script>
