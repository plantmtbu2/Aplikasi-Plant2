<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1">
          <span class="text-muted fw-light">Plan Today /</span> Berita Acara Pemeriksaan (BAP)
        </h4>
        <p class="text-muted mb-0 small">
          Penerbitan dokumen BAP untuk investigasi kerusakan, breakdown berat, tindakan perbaikan, dan approval Planner.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-warning text-dark fw-semibold" @click="openAddModal">
          <i class="bx bx-plus me-1"></i> Buat BAP Baru
        </button>
      </div>
    </div>

    <!-- Status Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card p-3 shadow-sm border-start border-warning border-3">
          <span class="text-xs text-muted text-uppercase fw-bold">BAP Open / Review</span>
          <h4 class="mb-0 fw-bold text-warning font-mono">{{ plantStore.openBaps }}</h4>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card p-3 shadow-sm border-start border-info border-3">
          <span class="text-xs text-muted text-uppercase fw-bold">BAP Approved</span>
          <h4 class="mb-0 fw-bold text-info font-mono">{{ plantStore.approvedBaps }}</h4>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card p-3 shadow-sm border-start border-success border-3">
          <span class="text-xs text-muted text-uppercase fw-bold">BAP Completed</span>
          <h4 class="mb-0 fw-bold text-success font-mono">{{ plantStore.completedBaps }}</h4>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card p-3 shadow-sm border-start border-primary border-3">
          <span class="text-xs text-muted text-uppercase fw-bold">Total Dokumen BAP</span>
          <h4 class="mb-0 fw-bold text-primary font-mono">{{ plantStore.totalBaps }}</h4>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Cari BAP</label>
            <input type="text" class="form-control" placeholder="Cari Code Unit, MO, Plan Action..." v-model="searchQuery" />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Code Unit</label>
            <select class="form-select" v-model="filterUnit">
              <option value="">Semua Unit</option>
              <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">{{ u.code_unit }}</option>
            </select>
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Status BAP</label>
            <select class="form-select" v-model="filterStatus">
              <option value="">Semua Status</option>
              <option value="Open">Open</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- BAP Table -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold">Daftar Dokumen BAP ({{ filteredBaps.length }})</h6>
        <span class="badge bg-label-warning text-dark">Plant 2 BAP Register</span>
      </div>

      <div class="table-responsive text-nowrap">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Timestamp & MO</th>
              <th>Code Unit & HM</th>
              <th>Plan Action & Deskripsi</th>
              <th>Lokasi & Durasi</th>
              <th>Status</th>
              <th>PIC & Approval</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="table-border-bottom-0">
            <tr v-for="bap in filteredBaps" :key="bap.id">
              <td>
                <span class="fw-bold d-block text-primary font-mono">{{ bap.mo || 'NO-MO' }}</span>
                <small class="text-muted text-xs">{{ bap.timestamp }}</small>
                <div v-if="bap.notif" class="text-xs text-muted font-mono">Ref: {{ bap.notif }}</div>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="avatar avatar-sm rounded flex-shrink-0">
                    <img :src="bap.foto || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100'" alt="Foto BAP" class="rounded" />
                  </div>
                  <div>
                    <span class="fw-bold text-primary">{{ bap.code_unit }}</span>
                    <small class="text-muted d-block text-xs font-mono">HM: {{ bap.hm }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="fw-bold text-truncate" style="max-width: 220px;" :title="bap.plan_action">{{ bap.plan_action }}</div>
                <small class="text-muted text-xs d-block text-truncate" style="max-width: 220px;">{{ bap.deskripsi_bap }}</small>
              </td>
              <td>
                <div><i class="bx bx-map-pin text-danger me-1"></i>{{ bap.lokasi_action_bap }}</div>
                <span class="badge bg-label-secondary text-xs mt-1">{{ bap.durasi_perbaikan }}</span>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="{
                    'bg-label-warning': bap.status === 'Open' || bap.status === 'Draft',
                    'bg-label-info': bap.status === 'Approved',
                    'bg-label-success': bap.status === 'Completed',
                    'bg-label-danger': bap.status === 'Rejected'
                  }"
                >
                  {{ bap.status }}
                </span>
              </td>
              <td>
                <div class="fw-semibold text-xs">{{ bap.pic }}</div>
                <small v-if="bap.approved_by" class="text-success text-xs d-block">
                  <i class="bx bx-check-double"></i> {{ bap.approved_by }}
                </small>
              </td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-1">
                  <!-- Quick Approve Button for Planner -->
                  <button 
                    v-if="authStore.isPlanner && bap.status === 'Open'" 
                    class="btn btn-xs btn-success text-nowrap" 
                    @click="approveBap(bap)"
                    title="Approve BAP sebagai Planner"
                  >
                    <i class="bx bx-check"></i> Approve
                  </button>

                  <button class="btn btn-icon btn-sm btn-label-info" @click="viewDetail(bap)" title="Lihat BAP Sheet">
                    <i class="bx bx-show"></i>
                  </button>
                  <button class="btn btn-icon btn-sm btn-label-primary" @click="openEditModal(bap)" title="Edit">
                    <i class="bx bx-edit"></i>
                  </button>
                  <button class="btn btn-icon btn-sm btn-label-danger" @click="plantStore.deleteBap(bap.id)" title="Hapus">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredBaps.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="bx bx-file-blank fs-2 text-warning d-block mb-2"></i>
                Tidak ada dokumen BAP yang cocok dengan filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit BAP) -->
    <div class="modal fade show d-block" v-if="showModal" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title fw-bold">
              <i class="bx" :class="isEditMode ? 'bx-edit' : 'bx-plus-circle'"></i>
              {{ isEditMode ? 'Edit Dokumen BAP' : 'Buat Berita Acara Pemeriksaan (BAP) Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>

          <form @submit.prevent="saveBap">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Code Unit</label>
                  <select class="form-select" v-model="formData.code_unit" @change="onUnitChange" required>
                    <option value="" disabled>Pilih Unit Alat Berat</option>
                    <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">
                      {{ u.code_unit }} ({{ u.egi }})
                    </option>
                  </select>
                </div>

                <div class="col-12 col-md-3">
                  <label class="form-label required fw-semibold">Hour Meter (HM)</label>
                  <input type="number" step="0.1" class="form-control" v-model.number="formData.hm" required />
                </div>

                <div class="col-12 col-md-3">
                  <label class="form-label required fw-semibold">Durasi Perbaikan</label>
                  <input type="text" class="form-control" placeholder="misal: 4.5 Jam" v-model="formData.durasi_perbaikan" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Maintenance Order (MO)</label>
                  <input type="text" class="form-control font-mono" placeholder="misal: MO-2025-0891" v-model="formData.mo" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Notification Number (Notif)</label>
                  <input type="text" class="form-control font-mono" placeholder="misal: NOTIF-PLN-5541" v-model="formData.notif" />
                </div>

                <div class="col-12">
                  <label class="form-label required fw-semibold">Plan Action / Rencana Tindakan</label>
                  <input type="text" class="form-control" placeholder="misal: Troubleshoot & Replace Main Hydraulic Pump Seal Kit" v-model="formData.plan_action" required />
                </div>

                <div class="col-12">
                  <label class="form-label required fw-semibold">Deskripsi Kerusakan / Temuan BAP</label>
                  <textarea class="form-control" rows="3" placeholder="Rincian kronologi temuan, gejala kerusakan komponen, dan analisis teknis awal..." v-model="formData.deskripsi_bap" required></textarea>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Lokasi Action BAP</label>
                  <input type="text" class="form-control" placeholder="misal: Workshop Plant 2 Bay 2 / Pit South" v-model="formData.lokasi_action_bap" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Status Dokumen</label>
                  <select class="form-select" v-model="formData.status" required>
                    <option value="Draft">Draft</option>
                    <option value="Open">Open (Menunggu Approval Planner)</option>
                    <option value="Approved">Approved (Disetujui)</option>
                    <option value="Completed">Completed (Perbaikan Selesai)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Kebutuhan Part & Material</label>
                  <textarea class="form-control" rows="2" placeholder="Daftar part number, seal kit, oli Tellus, gasket, dan consumables..." v-model="formData.kebutuhan_part"></textarea>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Catatan Tambahan & Rekomendasi</label>
                  <textarea class="form-control" rows="2" placeholder="Catatan keselamatan kerja LOTO, isolasi energi, dll..." v-model="formData.catatan"></textarea>
                </div>

                <div class="col-12">
                  <PhotoUploadPreview label="Dokumentasi Foto Kerusakan / Part (Foto BAP)" v-model="formData.foto" />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">PIC Pembuat BAP</label>
                  <input type="text" class="form-control" v-model="formData.pic" required />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Approved By (Planner)</label>
                  <input type="text" class="form-control" placeholder="Nama Planner Approval" v-model="formData.approved_by" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
              <button type="submit" class="btn btn-warning text-dark fw-semibold">
                <i class="bx bx-save me-1"></i> Simpan BAP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Printable BAP Sheet Modal -->
    <div class="modal fade show d-block" v-if="detailBap" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title text-white fw-bold">
              <i class="bx bx-file me-1"></i> Berita Acara Pemeriksaan: {{ detailBap.mo }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="detailBap = null"></button>
          </div>
          <div class="modal-body p-4" id="printable-bap">
            <!-- Header BAP Slip -->
            <div class="text-center border-bottom pb-3 mb-3">
              <h5 class="fw-bold mb-0">BERITA ACARA PEMERIKSAAN KERUSAKAN (BAP)</h5>
              <span class="text-muted small">PLANT 2 HEAVY EQUIPMENT RELIABILITY & MAINTENANCE</span>
            </div>

            <div class="row g-3 mb-3 border-bottom pb-3">
              <div class="col-6 col-md-3"><span class="text-muted text-xs d-block">Code Unit:</span><strong>{{ detailBap.code_unit }}</strong></div>
              <div class="col-6 col-md-3"><span class="text-muted text-xs d-block">Hour Meter:</span><strong>{{ detailBap.hm }} Jam</strong></div>
              <div class="col-6 col-md-3"><span class="text-muted text-xs d-block">No. MO:</span><strong class="font-mono text-primary">{{ detailBap.mo }}</strong></div>
              <div class="col-6 col-md-3"><span class="text-muted text-xs d-block">Status:</span><span class="badge bg-label-warning text-dark">{{ detailBap.status }}</span></div>
            </div>

            <div class="mb-3">
              <label class="text-xs fw-bold text-muted text-uppercase">Plan Action Perbaikan</label>
              <div class="p-2 border rounded bg-light dark-bg fw-bold text-primary">{{ detailBap.plan_action }}</div>
            </div>

            <div class="mb-3">
              <label class="text-xs fw-bold text-muted text-uppercase">Deskripsi Temuan & Kronologi</label>
              <p class="p-2 border rounded bg-light dark-bg mb-0 small">{{ detailBap.deskripsi_bap }}</p>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-6"><label class="text-xs fw-bold text-muted text-uppercase">Lokasi Action</label><div class="small fw-semibold">{{ detailBap.lokasi_action_bap }}</div></div>
              <div class="col-6"><label class="text-xs fw-bold text-muted text-uppercase">Estimasi Durasi</label><div class="small fw-semibold">{{ detailBap.durasi_perbaikan }}</div></div>
            </div>

            <div class="mb-3" v-if="detailBap.kebutuhan_part">
              <label class="text-xs fw-bold text-muted text-uppercase">Kebutuhan Part & Material</label>
              <div class="p-2 border rounded bg-light dark-bg small font-mono">{{ detailBap.kebutuhan_part }}</div>
            </div>

            <div class="mb-3" v-if="detailBap.foto">
              <label class="text-xs fw-bold text-muted text-uppercase">Dokumentasi Foto Kerusakan</label>
              <div><img :src="detailBap.foto" class="img-fluid rounded border" style="max-height: 240px; object-fit: cover;" /></div>
            </div>

            <div class="row g-3 pt-3 border-top text-center">
              <div class="col-6">
                <span class="text-xs text-muted d-block">Dibuat Oleh (PIC Maintenance):</span>
                <div class="fw-bold mt-4">{{ detailBap.pic }}</div>
              </div>
              <div class="col-6">
                <span class="text-xs text-muted d-block">Disetujui Oleh (Planner):</span>
                <div class="fw-bold mt-4 text-success">{{ detailBap.approved_by || '(Menunggu Approval)' }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="detailBap = null">Tutup</button>
            <button type="button" class="btn btn-primary" @click="printBap">
              <i class="bx bx-printer me-1"></i> Cetak BAP
            </button>
          </div>
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
import Swal from 'sweetalert2';
import type { Bap } from '../types';

const plantStore = usePlantStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const filterUnit = ref('');
const filterStatus = ref('');

const filteredBaps = computed(() => {
  return plantStore.baps.filter(b => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchQuery = !q ||
      b.code_unit.toLowerCase().includes(q) ||
      b.plan_action.toLowerCase().includes(q) ||
      b.mo.toLowerCase().includes(q) ||
      b.deskripsi_bap.toLowerCase().includes(q);

    const matchUnit = !filterUnit.value || b.code_unit === filterUnit.value;
    const matchStatus = !filterStatus.value || b.status === filterStatus.value;

    return matchQuery && matchUnit && matchStatus;
  });
});

const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<string | null>(null);
const detailBap = ref<Bap | null>(null);

const formData = ref<Omit<Bap, 'id' | 'created_at'>>({
  timestamp: '',
  code_unit: '',
  hm: 0,
  plan_action: '',
  durasi_perbaikan: '',
  deskripsi_bap: '',
  lokasi_action_bap: '',
  kebutuhan_part: '',
  catatan: '',
  foto: '',
  mo: '',
  notif: '',
  status: 'Open',
  pic: '',
  approved_by: ''
});

function onUnitChange() {
  const u = plantStore.codeUnits.find(unit => unit.code_unit === formData.value.code_unit);
  if (u) {
    formData.value.hm = u.current_hm;
    formData.value.lokasi_action_bap = u.lokasi;
  }
}

function openAddModal() {
  isEditMode.value = false;
  editingId.value = null;
  const defaultUnit = plantStore.codeUnits[0];

  formData.value = {
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    code_unit: defaultUnit ? defaultUnit.code_unit : '',
    hm: defaultUnit ? defaultUnit.current_hm : 0,
    plan_action: '',
    durasi_perbaikan: '4 Jam',
    deskripsi_bap: '',
    lokasi_action_bap: defaultUnit ? defaultUnit.lokasi : 'Workshop Plant 2 Bay 2',
    kebutuhan_part: '',
    catatan: '',
    foto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
    mo: `MO-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    notif: `NOTIF-PLN-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Open',
    pic: authStore.user?.nama || 'Agus Hendrawan',
    approved_by: authStore.isPlanner ? authStore.user?.nama : ''
  };
  showModal.value = true;
}

function openEditModal(bap: Bap) {
  isEditMode.value = true;
  editingId.value = bap.id;
  formData.value = { ...bap };
  showModal.value = true;
}

function viewDetail(bap: Bap) {
  detailBap.value = bap;
}

function approveBap(bap: Bap) {
  plantStore.updateBap(bap.id, {
    status: 'Approved',
    approved_by: authStore.user?.nama || 'Planner Admin'
  });
  Swal.fire({
    icon: 'success',
    title: 'BAP Disetujui',
    text: `BAP ${bap.mo} untuk ${bap.code_unit} telah disetujui oleh Planner.`,
    timer: 2000,
    showConfirmButton: false
  });
}

function printBap() {
  window.print();
}

function saveBap() {
  if (isEditMode.value && editingId.value) {
    plantStore.updateBap(editingId.value, formData.value);
  } else {
    plantStore.addBap(formData.value);
  }
  showModal.value = false;
}
</script>
