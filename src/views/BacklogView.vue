<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1">
          <span class="text-muted fw-light">Data Master /</span> Daftar Backlog & Spare Parts
        </h4>
        <p class="text-muted mb-0 small">
          Manajemen antrean perbaikan pending, reservasi part, dan maintenance order (MO).
        </p>
      </div>

      <button class="btn btn-primary" @click="openAddModal">
        <i class="bx bx-plus me-1"></i> Tambah Backlog Baru
      </button>
    </div>

    <!-- Filter Card -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Cari Backlog</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bx bx-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Cari MO, Deskripsi, Part Number..." 
                v-model="searchQuery" 
              />
            </div>
          </div>

          <div class="col-6 col-md-3">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Code Unit</label>
            <select class="form-select" v-model="filterUnit">
              <option value="">Semua Unit</option>
              <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">
                {{ u.code_unit }}
              </option>
            </select>
          </div>

          <div class="col-6 col-md-3">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Status Backlog</label>
            <select class="form-select" v-model="filterStatus">
              <option value="">Semua Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting Part">Waiting Part</option>
              <option value="Closed">Closed (Selesai)</option>
            </select>
          </div>

          <div class="col-12 col-md-2">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Prioritas</label>
            <select class="form-select" v-model="filterPriority">
              <option value="">Semua Prioritas</option>
              <option value="High">High / Urgent</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Backlog Cards / Table -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold">Daftar Item Backlog ({{ filteredBacklogs.length }})</h6>
        <div class="d-flex gap-2">
          <span class="badge bg-label-danger">{{ pendingCount }} Pending Action</span>
        </div>
      </div>

      <div class="table-responsive text-nowrap">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Timestamp & MO</th>
              <th>Code Unit</th>
              <th>Deskripsi Masalah / Backlog</th>
              <th>Part Number & Deskripsi</th>
              <th>Reservasi</th>
              <th>Prioritas & Status</th>
              <th>PIC</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="table-border-bottom-0">
            <tr v-for="bk in filteredBacklogs" :key="bk.id">
              <td>
                <span class="fw-bold d-block text-primary font-mono">{{ bk.mo_backlog }}</span>
                <small class="text-muted text-xs">{{ bk.timestamp }}</small>
              </td>
              <td>
                <span class="badge bg-label-primary fs-6">{{ bk.code_unit }}</span>
              </td>
              <td>
                <div class="fw-semibold text-truncate" style="max-width: 220px;" :title="bk.backlog_description">
                  {{ bk.backlog_description }}
                </div>
                <div v-if="bk.parts_list && bk.parts_list.length > 1" class="text-xs text-info">
                  <i class="bx bx-package me-1"></i> {{ bk.parts_list.length }} item parts terlampir
                </div>
              </td>
              <td>
                <div><code class="text-danger fw-bold">{{ bk.part_number }}</code> (Qty: {{ bk.qty }})</div>
                <small class="text-muted text-xs d-block text-truncate" style="max-width: 180px;">{{ bk.part_description }}</small>
              </td>
              <td>
                <span class="badge bg-label-secondary font-mono">{{ bk.reservasi || '-' }}</span>
              </td>
              <td>
                <div class="d-flex flex-column gap-1">
                  <span 
                    class="badge" 
                    :class="{
                      'bg-label-warning': bk.status === 'Open',
                      'bg-label-info': bk.status === 'In Progress',
                      'bg-label-danger': bk.status === 'Waiting Part',
                      'bg-label-success': bk.status === 'Closed'
                    }"
                  >
                    {{ bk.status }}
                  </span>
                  <span 
                    class="badge"
                    :class="{
                      'bg-danger': bk.priority === 'High' || bk.priority === 'Emergency',
                      'bg-warning text-dark': bk.priority === 'Medium',
                      'bg-secondary': bk.priority === 'Low'
                    }"
                    style="font-size: 0.65rem;"
                  >
                    {{ bk.priority || 'Medium' }}
                  </span>
                </div>
              </td>
              <td>
                <small class="fw-semibold">{{ bk.pic }}</small>
              </td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <button class="btn btn-icon btn-sm btn-label-primary" @click="openEditModal(bk)" title="Edit">
                    <i class="bx bx-edit"></i>
                  </button>
                  <button class="btn btn-icon btn-sm btn-label-danger" @click="plantStore.deleteBacklog(bk.id)" title="Hapus">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredBacklogs.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bx bx-check-double fs-2 text-success d-block mb-2"></i>
                Tidak ada backlog yang cocok dengan filter yang dipilih.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Backlog -->
    <div class="modal fade show d-block" v-if="showModal" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bx" :class="isEditMode ? 'bx-edit' : 'bx-plus-circle'"></i>
              {{ isEditMode ? 'Edit Backlog Unit' : 'Tambah Backlog Unit Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>

          <form @submit.prevent="saveBacklog">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Code Unit</label>
                  <select class="form-select" v-model="formData.code_unit" required>
                    <option value="" disabled>Pilih Unit</option>
                    <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">
                      {{ u.code_unit }} ({{ u.egi }})
                    </option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Timestamp / Tanggal</label>
                  <input type="text" class="form-control" v-model="formData.timestamp" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">MO Backlog (Maintenance Order)</label>
                  <input type="text" class="form-control" placeholder="misal: MO-BK-9912" v-model="formData.mo_backlog" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Nomor Reservasi Part</label>
                  <input type="text" class="form-control" placeholder="misal: RES-8820" v-model="formData.reservasi" required />
                </div>

                <div class="col-12">
                  <label class="form-label required fw-semibold">Deskripsi Backlog / Problem</label>
                  <textarea class="form-control" rows="2" placeholder="Deskripsi keluhan komponen dan hasil temuan inspeksi..." v-model="formData.backlog_description" required></textarea>
                </div>

                <!-- Primary Part -->
                <div class="col-12 col-md-4">
                  <label class="form-label required fw-semibold">Primary Part Number</label>
                  <input type="text" class="form-control font-mono" placeholder="misal: 9L-6643" v-model="formData.part_number" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Primary Part Description</label>
                  <input type="text" class="form-control" placeholder="misal: V-Belt Alternator Heavy Duty" v-model="formData.part_description" required />
                </div>

                <div class="col-12 col-md-2">
                  <label class="form-label required fw-semibold">Qty</label>
                  <input type="number" min="1" class="form-control" v-model.number="formData.qty" required />
                </div>

                <!-- Additional Multi-Parts Section -->
                <div class="col-12">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label fw-bold mb-0 text-primary">
                      <i class="bx bx-list-plus me-1"></i> Rincian Spare Parts Tambahan (Relasi Multi-Part)
                    </label>
                    <button type="button" class="btn btn-xs btn-outline-primary" @click="addPartRow">
                      <i class="bx bx-plus"></i> Tambah Part
                    </button>
                  </div>

                  <div v-for="(part, idx) in formData.parts_list" :key="idx" class="p-2 border rounded mb-2 bg-light dark-bg">
                    <div class="row g-2 align-items-center">
                      <div class="col-12 col-md-4">
                        <input type="text" class="form-control form-control-sm font-mono" placeholder="Part Number" v-model="part.part_number" />
                      </div>
                      <div class="col-12 col-md-4">
                        <input type="text" class="form-control form-control-sm" placeholder="Part Description" v-model="part.part_description" />
                      </div>
                      <div class="col-4 col-md-2">
                        <input type="number" min="1" class="form-control form-control-sm" placeholder="Qty" v-model.number="part.qty" />
                      </div>
                      <div class="col-6 col-md-1">
                        <input type="text" class="form-control form-control-sm" placeholder="Satuan" v-model="part.unit" />
                      </div>
                      <div class="col-2 col-md-1 text-end">
                        <button type="button" class="btn btn-sm btn-icon btn-label-danger" @click="removePartRow(idx)">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label required fw-semibold">Status</label>
                  <select class="form-select" v-model="formData.status" required>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting Part">Waiting Part</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label required fw-semibold">Prioritas</label>
                  <select class="form-select" v-model="formData.priority" required>
                    <option value="Emergency">Emergency</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label required fw-semibold">PIC / Planner</label>
                  <input type="text" class="form-control" v-model="formData.pic" required />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
              <button type="submit" class="btn btn-primary">
                <i class="bx bx-save me-1"></i> Simpan Backlog
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
import type { Backlog, BacklogPart } from '../types';

const plantStore = usePlantStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const filterUnit = ref('');
const filterStatus = ref('');
const filterPriority = ref('');

const pendingCount = computed(() => plantStore.backlogs.filter(b => b.status !== 'Closed').length);

const filteredBacklogs = computed(() => {
  return plantStore.backlogs.filter(b => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchQuery = !q || 
      b.mo_backlog.toLowerCase().includes(q) || 
      b.code_unit.toLowerCase().includes(q) || 
      b.backlog_description.toLowerCase().includes(q) ||
      b.part_number.toLowerCase().includes(q) ||
      b.part_description.toLowerCase().includes(q);

    const matchUnit = !filterUnit.value || b.code_unit === filterUnit.value;
    const matchStatus = !filterStatus.value || b.status === filterStatus.value;
    const matchPriority = !filterPriority.value || b.priority === filterPriority.value;

    return matchQuery && matchUnit && matchStatus && matchPriority;
  });
});

const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<string | null>(null);

const formData = ref<{
  timestamp: string;
  code_unit: string;
  mo_backlog: string;
  reservasi: string;
  backlog_description: string;
  part_number: string;
  part_description: string;
  qty: number;
  status: 'Open' | 'In Progress' | 'Waiting Part' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  pic: string;
  parts_list: BacklogPart[];
}>({
  timestamp: '',
  code_unit: '',
  mo_backlog: '',
  reservasi: '',
  backlog_description: '',
  part_number: '',
  part_description: '',
  qty: 1,
  status: 'Open',
  priority: 'Medium',
  pic: '',
  parts_list: []
});

function openAddModal() {
  isEditMode.value = false;
  editingId.value = null;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const defaultUnit = plantStore.codeUnits[0];

  formData.value = {
    timestamp: nowStr,
    code_unit: defaultUnit ? defaultUnit.code_unit : '',
    mo_backlog: `MO-BK-${Math.floor(1000 + Math.random() * 9000)}`,
    reservasi: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
    backlog_description: '',
    part_number: '',
    part_description: '',
    qty: 1,
    status: 'Open',
    priority: 'Medium',
    pic: authStore.user?.nama || 'Agus Hendrawan',
    parts_list: []
  };
  showModal.value = true;
}

function openEditModal(bk: Backlog) {
  isEditMode.value = true;
  editingId.value = bk.id;
  formData.value = {
    timestamp: bk.timestamp,
    code_unit: bk.code_unit,
    mo_backlog: bk.mo_backlog,
    reservasi: bk.reservasi,
    backlog_description: bk.backlog_description,
    part_number: bk.part_number,
    part_description: bk.part_description,
    qty: bk.qty,
    status: bk.status,
    priority: bk.priority || 'Medium',
    pic: bk.pic,
    parts_list: bk.parts_list ? [...bk.parts_list] : []
  };
  showModal.value = true;
}

function addPartRow() {
  formData.value.parts_list.push({
    part_number: '',
    part_description: '',
    qty: 1,
    unit: 'PC',
    status: 'Ordered'
  });
}

function removePartRow(idx: number) {
  formData.value.parts_list.splice(idx, 1);
}

function saveBacklog() {
  if (isEditMode.value && editingId.value) {
    plantStore.updateBacklog(editingId.value, formData.value);
  } else {
    plantStore.addBacklog(formData.value);
  }
  showModal.value = false;
}
</script>
