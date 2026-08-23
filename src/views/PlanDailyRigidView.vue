<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1">
          <span class="text-muted fw-light">Plan Today /</span> Plan Daily Rigid Dump Truck
        </h4>
        <p class="text-muted mb-0 small">
          Pemeriksaan harian (P1/P2/Pre-Shift) unit Rigid (CAT 777D, CAT 785C) dengan 19 titik inspeksi kritis & 4 foto dokumentasi.
        </p>
      </div>

      <button class="btn btn-primary" @click="openAddModal">
        <i class="bx bx-plus me-1"></i> Tambah Daily Rigid
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Cari Laporan</label>
            <input type="text" class="form-control" placeholder="Cari Code Unit, PIC, Planning..." v-model="searchQuery" />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Filter Tanggal</label>
            <input type="date" class="form-control" v-model="filterDate" />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Status Laporan</label>
            <select class="form-select" v-model="filterStatus">
              <option value="">Semua Status</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted (Menunggu Review)</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Rigid Table -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold">Daftar Inspeksi Daily Rigid ({{ filteredList.length }})</h6>
        <span class="badge bg-label-primary">Heavy Dump Truck</span>
      </div>

      <div class="table-responsive text-nowrap">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Tanggal & Waktu</th>
              <th>Code Unit & EGI</th>
              <th>Planning / Inspection</th>
              <th>HM & Durasi</th>
              <th>Checklist Summary</th>
              <th>Status</th>
              <th>PIC</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="table-border-bottom-0">
            <tr v-for="item in filteredList" :key="item.id">
              <td>
                <strong>{{ item.date }}</strong>
                <small class="text-muted d-block text-xs">{{ item.start_time }} - {{ item.finish_time }}</small>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="avatar avatar-sm bg-label-primary rounded d-flex align-items-center justify-content-center">
                    <i class="bx bxs-truck fs-5"></i>
                  </div>
                  <div>
                    <span class="fw-bold text-primary">{{ item.code_unit }}</span>
                    <small class="text-muted d-block text-xs">{{ item.egi }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="fw-semibold text-truncate" style="max-width: 200px;" :title="item.planning">{{ item.planning }}</div>
                <span class="badge bg-label-secondary text-xs">{{ item.inspection_type }}</span>
              </td>
              <td>
                <span class="badge bg-label-dark font-mono">HM: {{ item.hm }}</span>
                <small class="text-muted d-block text-xs mt-1">{{ item.total_hours }} Jam</small>
              </td>
              <td>
                <div class="d-flex align-items-center gap-1">
                  <span 
                    class="badge" 
                    :class="hasAbnormal(item) ? 'bg-label-danger' : 'bg-label-success'"
                  >
                    {{ hasAbnormal(item) ? 'Perlu Tindakan / Temuan' : '19/19 Normal' }}
                  </span>
                  <button 
                    class="btn btn-xs btn-label-info btn-icon" 
                    @click="viewDetail(item)"
                    title="Lihat Rincian 19 Titik & Foto"
                  >
                    <i class="bx bx-show"></i>
                  </button>
                </div>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="item.status === 'Approved' ? 'bg-label-success' : 'bg-label-warning'"
                >
                  {{ item.status }}
                </span>
              </td>
              <td>
                <small class="fw-semibold">{{ item.pic }}</small>
              </td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-1">
                  <button class="btn btn-icon btn-sm btn-label-info" @click="viewDetail(item)" title="Detail Checklist">
                    <i class="bx bx-list-check"></i>
                  </button>
                  <button class="btn btn-icon btn-sm btn-label-primary" @click="openEditModal(item)" title="Edit">
                    <i class="bx bx-edit"></i>
                  </button>
                  <button class="btn btn-icon btn-sm btn-label-danger" @click="plantStore.deleteDailyRigid(item.id)" title="Hapus">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredList.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bx bx-check-circle text-success fs-2 d-block mb-2"></i>
                Tidak ada data inspeksi Daily Rigid yang sesuai filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Input / Edit Daily Rigid -->
    <div class="modal fade show d-block" v-if="showModal" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="bx" :class="isEditMode ? 'bx-edit' : 'bx-plus-circle'"></i>
              {{ isEditMode ? 'Edit Daily Rigid' : 'Tambah Laporan Daily Rigid Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>

          <form @submit.prevent="saveDailyRigid">
            <div class="modal-body">
              <!-- Section 1: General Info -->
              <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                <i class="bx bx-info-circle me-1"></i> 1. Informasi Dasar & Planning
              </h6>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <label class="form-label required fw-semibold">Code Unit</label>
                  <select class="form-select" v-model="formData.code_unit" @change="onUnitChange" required>
                    <option value="" disabled>Pilih Unit Rigid</option>
                    <option v-for="u in rigidUnits" :key="u.id" :value="u.code_unit">
                      {{ u.code_unit }} ({{ u.egi }})
                    </option>
                  </select>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label required fw-semibold">EGI</label>
                  <input type="text" class="form-control" v-model="formData.egi" required />
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label required fw-semibold">Inspection Type</label>
                  <select class="form-select" v-model="formData.inspection_type">
                    <option value="P1 (Daily)">P1 (Daily Inspection)</option>
                    <option value="P2 (Weekly)">P2 (Weekly Inspection)</option>
                    <option value="P3 (Monthly)">P3 (Monthly Inspection)</option>
                    <option value="Pre-Shift">Pre-Shift Check</option>
                    <option value="Post-Shift">Post-Shift Check</option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Planning Description</label>
                  <input type="text" class="form-control" placeholder="misal: Daily P1 Inspection & Greasing Shift 1" v-model="formData.planning" required />
                </div>

                <div class="col-6 col-md-2">
                  <label class="form-label required fw-semibold">Tanggal</label>
                  <input type="date" class="form-control" v-model="formData.date" required />
                </div>

                <div class="col-6 col-md-2">
                  <label class="form-label required fw-semibold">Start Time</label>
                  <input type="time" class="form-control" v-model="formData.start_time" @change="calcHours" required />
                </div>

                <div class="col-6 col-md-2">
                  <label class="form-label required fw-semibold">Finish Time</label>
                  <input type="time" class="form-control" v-model="formData.finish_time" @change="calcHours" required />
                </div>

                <div class="col-6 col-md-3">
                  <label class="form-label required fw-semibold">Total Hours</label>
                  <input type="number" step="0.1" class="form-control" v-model.number="formData.total_hours" required />
                </div>

                <div class="col-6 col-md-3">
                  <label class="form-label required fw-semibold">Current HM</label>
                  <input type="number" step="0.1" class="form-control" v-model.number="formData.hm" required />
                </div>

                <div class="col-6 col-md-3">
                  <label class="form-label required fw-semibold">PIC / Inspector</label>
                  <input type="text" class="form-control" v-model="formData.pic" required />
                </div>

                <div class="col-6 col-md-3">
                  <label class="form-label required fw-semibold">Status Approval</label>
                  <select class="form-select" v-model="formData.status" required>
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved (Planner)</option>
                  </select>
                </div>
              </div>

              <!-- Section 2: 19 Inspection Points -->
              <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h6 class="fw-bold text-primary mb-0">
                  <i class="bx bx-check-double me-1"></i> 2. Form Checklist 19 Titik Inspeksi Rigid
                </h6>
                <button type="button" class="btn btn-xs btn-outline-success" @click="setAllNormal">
                  <i class="bx bx-check-double"></i> Set Semua Normal
                </button>
              </div>

              <div class="row g-2 mb-4">
                <div 
                  v-for="(label, key) in rigidChecklistFields" 
                  :key="key" 
                  class="col-12 col-md-6 col-lg-4"
                >
                  <div class="p-2 border rounded bg-light dark-bg d-flex justify-content-between align-items-center">
                    <span class="text-xs fw-semibold">{{ label }}</span>
                    <select 
                      class="form-select form-select-sm" 
                      style="width: 130px;"
                      v-model="(formData as any)[key]"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Action Needed">Action Needed</option>
                      <option value="Abnormal">Abnormal</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 3: Deviation Notes -->
              <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                <i class="bx bx-comment-error me-1"></i> 3. Deviation / Catatan Temuan Lapangan
              </h6>
              <div class="mb-4">
                <textarea 
                  class="form-control" 
                  rows="2" 
                  placeholder="Tuliskan temuan abnormalitas, deviasi spesifikasi, atau rekomendasi perbaikan..." 
                  v-model="formData.deviation"
                ></textarea>
              </div>

              <!-- Section 4: 4 Inspection Photos Upload -->
              <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                <i class="bx bx-images me-1"></i> 4. Dokumentasi Foto Inspeksi (4 Foto)
              </h6>
              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <PhotoUploadPreview label="Foto 1: Tampak Depan / Cabin" v-model="formData.foto1" />
                </div>
                <div class="col-6 col-md-3">
                  <PhotoUploadPreview label="Foto 2: Engine & Level Fluida" v-model="formData.foto2" />
                </div>
                <div class="col-6 col-md-3">
                  <PhotoUploadPreview label="Foto 3: Suspensi & Undercarriage" v-model="formData.foto3" />
                </div>
                <div class="col-6 col-md-3">
                  <PhotoUploadPreview label="Foto 4: Tyre / Komponen Temuan" v-model="formData.foto4" />
                </div>
              </div>

              <!-- Section 5: Sub-Aktivitas & Sub-Backlog Linked -->
              <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                <i class="bx bx-link-alt me-1"></i> 5. Hubungkan Aktivitas & Backlog Terkait
              </h6>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div class="card bg-light dark-bg border shadow-none p-3 h-100">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <strong class="small text-primary"><i class="bx bx-run me-1"></i> Aktivitas Terkait</strong>
                      <router-link to="/aktivitas" class="btn btn-xs btn-outline-primary" target="_blank">
                        + Tambah Aktivitas
                      </router-link>
                    </div>
                    <small class="text-muted">Aktivitas perbaikan dapat diinput langsung atau dihubungkan melalui modul Log Aktivitas.</small>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="card bg-light dark-bg border shadow-none p-3 h-100">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <strong class="small text-danger"><i class="bx bx-time me-1"></i> Backlog Terkait</strong>
                      <router-link to="/master/backlog" class="btn btn-xs btn-outline-danger" target="_blank">
                        + Tambah Backlog
                      </router-link>
                    </div>
                    <small class="text-muted">Jika ada part yang butuh pergantian, buat Backlog untuk reservasi nomor part.</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
              <button type="submit" class="btn btn-primary">
                <i class="bx bx-save me-1"></i> Simpan Daily Rigid
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal View Detail -->
    <div class="modal fade show d-block" v-if="detailItem" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title text-white fw-bold">
              <i class="bx bx-check-shield me-1"></i> Detail Laporan Daily Rigid: {{ detailItem.code_unit }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="detailItem = null"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3 mb-3">
              <div class="col-6 col-md-3">
                <span class="text-xs text-muted d-block">Tanggal:</span>
                <strong>{{ detailItem.date }}</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-xs text-muted d-block">Jam Kerja:</span>
                <strong>{{ detailItem.start_time }} - {{ detailItem.finish_time }} ({{ detailItem.total_hours }}h)</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-xs text-muted d-block">Hour Meter (HM):</span>
                <strong>{{ detailItem.hm }} Jam</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-xs text-muted d-block">PIC / Status:</span>
                <span class="badge bg-label-success">{{ detailItem.pic }} ({{ detailItem.status }})</span>
              </div>
            </div>

            <h6 class="fw-bold border-bottom pb-2">Status 19 Titik Pengecekan:</h6>
            <div class="row g-2 mb-3">
              <div v-for="(label, key) in rigidChecklistFields" :key="key" class="col-6 col-md-4">
                <div class="p-2 border rounded d-flex justify-content-between align-items-center">
                  <span class="text-xs">{{ label }}</span>
                  <span 
                    class="badge" 
                    :class="(detailItem as any)[key] === 'Normal' ? 'bg-label-success' : 'bg-label-danger'"
                  >
                    {{ (detailItem as any)[key] }}
                  </span>
                </div>
              </div>
            </div>

            <h6 class="fw-bold border-bottom pb-2">Deviasi & Foto:</h6>
            <p class="text-muted small mb-3">{{ detailItem.deviation || 'Tidak ada catatan deviasi abnormal.' }}</p>

            <div class="row g-2">
              <div v-if="detailItem.foto1" class="col-6 col-md-3">
                <img :src="detailItem.foto1" class="img-fluid rounded border" alt="Foto 1" />
                <span class="text-xs text-muted text-center d-block mt-1">Foto 1</span>
              </div>
              <div v-if="detailItem.foto2" class="col-6 col-md-3">
                <img :src="detailItem.foto2" class="img-fluid rounded border" alt="Foto 2" />
                <span class="text-xs text-muted text-center d-block mt-1">Foto 2</span>
              </div>
              <div v-if="detailItem.foto3" class="col-6 col-md-3">
                <img :src="detailItem.foto3" class="img-fluid rounded border" alt="Foto 3" />
                <span class="text-xs text-muted text-center d-block mt-1">Foto 3</span>
              </div>
              <div v-if="detailItem.foto4" class="col-6 col-md-3">
                <img :src="detailItem.foto4" class="img-fluid rounded border" alt="Foto 4" />
                <span class="text-xs text-muted text-center d-block mt-1">Foto 4</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="detailItem = null">Tutup</button>
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
import type { DailyRigid, InspectionStatus } from '../types';

const plantStore = usePlantStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const filterDate = ref('');
const filterStatus = ref('');

const rigidUnits = computed(() => plantStore.codeUnits.filter(u => u.type === 'Rigid'));

const rigidChecklistFields: Record<string, string> = {
  engine_oil_level: 'Engine Oil Level',
  tm_oil_level: 'T/M Oil Level',
  hyd_oil_level: 'Hyd Oil Level',
  v_belts: 'V-Belts Condition',
  eg_oil_leakage: 'E/G Oil Leakage',
  common_rail_connector: 'Common Rail Connector',
  injector_tube: 'Injector Tube',
  fm_radio: 'FM Radio & Antenna',
  fatigue_warning: 'Fatigue Warning Sensor',
  power_window: 'Power Window Cab',
  operator_seat: 'Operator Seat & Belt',
  hand_rail: 'Hand Rail & Ladder',
  common_rail_pressure_on: 'Common Rail Press. [On]',
  power_supplay_voltage_on: 'Power Supply Volt [On]',
  susp_pressure_fl: 'Susp. Pressure FL',
  susp_pressure_fr: 'Susp. Pressure FR',
  susp_pressure_rl: 'Susp. Pressure RL',
  susp_pressure_rr: 'Susp. Pressure RR',
  tyre_condition: 'Tyre & Rims Condition'
};

const filteredList = computed(() => {
  return plantStore.dailyRigidList.filter(item => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchQuery = !q || 
      item.code_unit.toLowerCase().includes(q) || 
      item.pic.toLowerCase().includes(q) || 
      item.planning.toLowerCase().includes(q);

    const matchDate = !filterDate.value || item.date === filterDate.value;
    const matchStatus = !filterStatus.value || item.status === filterStatus.value;

    return matchQuery && matchDate && matchStatus;
  });
});

function hasAbnormal(item: DailyRigid): boolean {
  for (const key of Object.keys(rigidChecklistFields)) {
    if ((item as any)[key] === 'Action Needed' || (item as any)[key] === 'Abnormal') {
      return true;
    }
  }
  return false;
}

const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<string | null>(null);
const detailItem = ref<DailyRigid | null>(null);

const formData = ref<Omit<DailyRigid, 'id' | 'created_at'>>({
  timestamp: '',
  planning: '',
  inspection_type: 'P1 (Daily)',
  code_unit: '',
  egi: '',
  date: new Date().toISOString().split('T')[0],
  start_time: '07:00',
  finish_time: '08:30',
  total_hours: 1.5,
  hm: 0,
  engine_oil_level: 'Normal',
  tm_oil_level: 'Normal',
  hyd_oil_level: 'Normal',
  v_belts: 'Normal',
  eg_oil_leakage: 'Normal',
  common_rail_connector: 'Normal',
  injector_tube: 'Normal',
  fm_radio: 'Normal',
  fatigue_warning: 'Normal',
  power_window: 'Normal',
  operator_seat: 'Normal',
  hand_rail: 'Normal',
  common_rail_pressure_on: 'Normal',
  power_supplay_voltage_on: 'Normal',
  susp_pressure_fl: 'Normal',
  susp_pressure_fr: 'Normal',
  susp_pressure_rl: 'Normal',
  susp_pressure_rr: 'Normal',
  tyre_condition: 'Normal',
  deviation: '',
  pic: '',
  foto1: '',
  foto2: '',
  foto3: '',
  foto4: '',
  status: 'Submitted'
});

function setAllNormal() {
  for (const key of Object.keys(rigidChecklistFields)) {
    (formData.value as any)[key] = 'Normal';
  }
}

function onUnitChange() {
  const u = plantStore.codeUnits.find(unit => unit.code_unit === formData.value.code_unit);
  if (u) {
    formData.value.egi = u.egi;
    formData.value.hm = u.current_hm;
  }
}

function calcHours() {
  if (formData.value.start_time && formData.value.finish_time) {
    const [h1, m1] = formData.value.start_time.split(':').map(Number);
    const [h2, m2] = formData.value.finish_time.split(':').map(Number);
    let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (diff < 0) diff += 24;
    formData.value.total_hours = Math.round(diff * 10) / 10;
  }
}

function openAddModal() {
  isEditMode.value = false;
  editingId.value = null;
  const defaultUnit = rigidUnits.value[0] || plantStore.codeUnits[0];

  formData.value = {
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    planning: 'Daily Scheduled P1 Inspection & Greasing',
    inspection_type: 'P1 (Daily)',
    code_unit: defaultUnit ? defaultUnit.code_unit : '',
    egi: defaultUnit ? defaultUnit.egi : '',
    date: new Date().toISOString().split('T')[0],
    start_time: '07:00',
    finish_time: '08:30',
    total_hours: 1.5,
    hm: defaultUnit ? defaultUnit.current_hm : 0,
    engine_oil_level: 'Normal',
    tm_oil_level: 'Normal',
    hyd_oil_level: 'Normal',
    v_belts: 'Normal',
    eg_oil_leakage: 'Normal',
    common_rail_connector: 'Normal',
    injector_tube: 'Normal',
    fm_radio: 'Normal',
    fatigue_warning: 'Normal',
    power_window: 'Normal',
    operator_seat: 'Normal',
    hand_rail: 'Normal',
    common_rail_pressure_on: 'Normal',
    power_supplay_voltage_on: 'Normal',
    susp_pressure_fl: 'Normal',
    susp_pressure_fr: 'Normal',
    susp_pressure_rl: 'Normal',
    susp_pressure_rr: 'Normal',
    tyre_condition: 'Normal',
    deviation: '',
    pic: authStore.user?.nama || 'Agus Hendrawan',
    foto1: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
    foto2: '',
    foto3: '',
    foto4: '',
    status: authStore.isPlanner ? 'Approved' : 'Submitted'
  };
  showModal.value = true;
}

function openEditModal(item: DailyRigid) {
  isEditMode.value = true;
  editingId.value = item.id;
  formData.value = { ...item };
  showModal.value = true;
}

function viewDetail(item: DailyRigid) {
  detailItem.value = item;
}

function saveDailyRigid() {
  if (isEditMode.value && editingId.value) {
    plantStore.updateDailyRigid(editingId.value, formData.value);
  } else {
    plantStore.addDailyRigid(formData.value);
  }
  showModal.value = false;
}
</script>
