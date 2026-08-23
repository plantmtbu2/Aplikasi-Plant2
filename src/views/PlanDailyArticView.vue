<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1">
          <span class="text-muted fw-light">Plan Today /</span> Plan Daily Artic Hauler & Grader
        </h4>
        <p class="text-muted mb-0 small">
          Inspeksi komprehensif 40 titik (Cylinders, Articulation Pin, Hydraulic Leaks, Circle Motor, Radiator) & 4 dokumentasi foto.
        </p>
      </div>

      <button class="btn btn-info text-white" @click="openAddModal">
        <i class="bx bx-plus me-1"></i> Tambah Daily Artic
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Cari Laporan</label>
            <input type="text" class="form-control" placeholder="Cari Unit Artic, PIC, Planning..." v-model="searchQuery" />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Filter Tanggal</label>
            <input type="date" class="form-control" v-model="filterDate" />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Status</label>
            <select class="form-select" v-model="filterStatus">
              <option value="">Semua Status</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Artic Table -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold">Daftar Inspeksi Daily Artic ({{ filteredList.length }})</h6>
        <span class="badge bg-label-info">40-Point Articulated Fleet</span>
      </div>

      <div class="table-responsive text-nowrap">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Tanggal & Jam</th>
              <th>Code Unit & EGI</th>
              <th>Planning / Tipe</th>
              <th>HM & Durasi</th>
              <th>40-Point Status</th>
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
                  <div class="avatar avatar-sm bg-label-info rounded d-flex align-items-center justify-content-center">
                    <i class="bx bx-cog fs-5 text-info"></i>
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
                    {{ hasAbnormal(item) ? 'Ada Temuan / Action' : '40/40 Normal' }}
                  </span>
                  <button class="btn btn-xs btn-label-info btn-icon" @click="viewDetail(item)" title="Detail Checklist">
                    <i class="bx bx-show"></i>
                  </button>
                </div>
              </td>
              <td>
                <span class="badge" :class="item.status === 'Approved' ? 'bg-label-success' : 'bg-label-warning'">
                  {{ item.status }}
                </span>
              </td>
              <td>
                <small class="fw-semibold">{{ item.pic }}</small>
              </td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap-1">
                  <button class="btn btn-icon btn-sm btn-label-info" @click="viewDetail(item)" title="Detail">
                    <i class="bx bx-list-check"></i>
                  </button>
                  <button class="btn btn-icon btn-sm btn-label-primary" @click="openEditModal(item)" title="Edit">
                    <i class="bx bx-edit"></i>
                  </button>
                  <button class="btn btn-icon btn-sm btn-label-danger" @click="plantStore.deleteDailyArtic(item.id)" title="Hapus">
                    <i class="bx bx-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredList.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bx bx-check-circle text-info fs-2 d-block mb-2"></i>
                Tidak ada data inspeksi Daily Artic yang sesuai filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Input / Edit Daily Artic -->
    <div class="modal fade show d-block" v-if="showModal" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title text-white fw-bold">
              <i class="bx" :class="isEditMode ? 'bx-edit' : 'bx-plus-circle'"></i>
              {{ isEditMode ? 'Edit Daily Artic' : 'Tambah Laporan Daily Artic (40 Titik)' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showModal = false"></button>
          </div>

          <form @submit.prevent="saveDailyArtic">
            <div class="modal-body">
              <!-- Section 1: General Info -->
              <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                <i class="bx bx-info-circle me-1"></i> 1. Informasi Dasar & Planning Artic
              </h6>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <label class="form-label required fw-semibold">Code Unit</label>
                  <select class="form-select" v-model="formData.code_unit" @change="onUnitChange" required>
                    <option value="" disabled>Pilih Unit Artic / Support</option>
                    <option v-for="u in articUnits" :key="u.id" :value="u.code_unit">
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
                  <input type="text" class="form-control" placeholder="misal: Scheduled 40-Point Artic Inspection Shift 1" v-model="formData.planning" required />
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

              <!-- Section 2: 40 Inspection Checklist Points (Structured into categories) -->
              <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h6 class="fw-bold text-primary mb-0">
                  <i class="bx bx-check-double me-1"></i> 2. Checklist 40 Titik Inspeksi Artic
                </h6>
                <button type="button" class="btn btn-xs btn-outline-success" @click="setAllNormal">
                  <i class="bx bx-check-double"></i> Set Semua 40 Titik Normal
                </button>
              </div>

              <div class="row g-2 mb-4">
                <div 
                  v-for="(label, key) in articChecklistFields" 
                  :key="key" 
                  class="col-12 col-md-6 col-lg-4"
                >
                  <div class="p-2 border rounded bg-light dark-bg d-flex justify-content-between align-items-center">
                    <span class="text-xs fw-semibold">{{ label }}</span>
                    <select 
                      class="form-select form-select-sm" 
                      style="width: 125px;"
                      v-model="(formData as any)[key]"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Action Needed">Action</option>
                      <option value="Abnormal">Abnormal</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 3: Deviation Notes -->
              <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                <i class="bx bx-comment-error me-1"></i> 3. Deviation / Catatan Temuan & Rekomendasi
              </h6>
              <div class="mb-4">
                <textarea 
                  class="form-control" 
                  rows="2" 
                  placeholder="Catat kondisi abnormalitas silinder, kebocoran hidrolik, atau keausan bearing artikulasi..." 
                  v-model="formData.deviation"
                ></textarea>
              </div>

              <!-- Section 4: 4 Photos Upload -->
              <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                <i class="bx bx-images me-1"></i> 4. Dokumentasi Foto Inspeksi (4 Foto)
              </h6>
              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <PhotoUploadPreview label="Foto 1: Articulation & Pin" v-model="formData.foto1" />
                </div>
                <div class="col-6 col-md-3">
                  <PhotoUploadPreview label="Foto 2: Cylinders LH & RH" v-model="formData.foto2" />
                </div>
                <div class="col-6 col-md-3">
                  <PhotoUploadPreview label="Foto 3: Engine & Radiator" v-model="formData.foto3" />
                </div>
                <div class="col-6 col-md-3">
                  <PhotoUploadPreview label="Foto 4: Undercarriage & Blade" v-model="formData.foto4" />
                </div>
              </div>

              <!-- Sub Activity / Backlog links -->
              <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                <i class="bx bx-link-alt me-1"></i> 5. Integrasi Aktivitas & Backlog
              </h6>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div class="card bg-light dark-bg border shadow-none p-3 h-100">
                    <strong class="small text-info"><i class="bx bx-run me-1"></i> Catat Aktivitas Perbaikan</strong>
                    <p class="text-muted small mb-0">Hubungkan log aktivitas perbaikan shift dengan laporan Artic ini.</p>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="card bg-light dark-bg border shadow-none p-3 h-100">
                    <strong class="small text-danger"><i class="bx bx-time me-1"></i> Buat Backlog Part</strong>
                    <p class="text-muted small mb-0">Catat kebutuhan reservasi seal kit silinder atau bearing artikulasi.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
              <button type="submit" class="btn btn-info text-white">
                <i class="bx bx-save me-1"></i> Simpan Daily Artic
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Detail Artic -->
    <div class="modal fade show d-block" v-if="detailItem" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title text-white fw-bold">
              <i class="bx bx-cog me-1"></i> Rincian Daily Artic: {{ detailItem.code_unit }}
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
                <span class="text-xs text-muted d-block">Waktu:</span>
                <strong>{{ detailItem.start_time }} - {{ detailItem.finish_time }} ({{ detailItem.total_hours }}h)</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-xs text-muted d-block">Hour Meter:</span>
                <strong>{{ detailItem.hm }} Jam</strong>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-xs text-muted d-block">PIC:</span>
                <span class="badge bg-label-info">{{ detailItem.pic }} ({{ detailItem.status }})</span>
              </div>
            </div>

            <h6 class="fw-bold border-bottom pb-2">Status 40 Titik Inspeksi:</h6>
            <div class="row g-2 mb-3" style="max-height: 260px; overflow-y: auto;">
              <div v-for="(label, key) in articChecklistFields" :key="key" class="col-6 col-md-4">
                <div class="p-2 border rounded d-flex justify-content-between align-items-center">
                  <span class="text-xs">{{ label }}</span>
                  <span class="badge" :class="(detailItem as any)[key] === 'Normal' ? 'bg-label-success' : 'bg-label-danger'">
                    {{ (detailItem as any)[key] }}
                  </span>
                </div>
              </div>
            </div>

            <h6 class="fw-bold border-bottom pb-2">Deviasi:</h6>
            <p class="text-muted small mb-3">{{ detailItem.deviation || 'Semua parameter inspeksi dalam batas standar operasi.' }}</p>

            <div class="row g-2">
              <div v-if="detailItem.foto1" class="col-6 col-md-3"><img :src="detailItem.foto1" class="img-fluid rounded border" alt="Foto 1" /><span class="text-xs text-muted text-center d-block mt-1">Foto 1</span></div>
              <div v-if="detailItem.foto2" class="col-6 col-md-3"><img :src="detailItem.foto2" class="img-fluid rounded border" alt="Foto 2" /><span class="text-xs text-muted text-center d-block mt-1">Foto 2</span></div>
              <div v-if="detailItem.foto3" class="col-6 col-md-3"><img :src="detailItem.foto3" class="img-fluid rounded border" alt="Foto 3" /><span class="text-xs text-muted text-center d-block mt-1">Foto 3</span></div>
              <div v-if="detailItem.foto4" class="col-6 col-md-3"><img :src="detailItem.foto4" class="img-fluid rounded border" alt="Foto 4" /><span class="text-xs text-muted text-center d-block mt-1">Foto 4</span></div>
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
import type { DailyArtic } from '../types';

const plantStore = usePlantStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const filterDate = ref('');
const filterStatus = ref('');

const articUnits = computed(() => plantStore.codeUnits.filter(u => u.type === 'Artic' || u.type === 'Support'));

const articChecklistFields: Record<string, string> = {
  air_pressure: 'Air Pressure System',
  lock_door: 'Cabin Door Lock',
  wiper: 'Wiper & Washer',
  lever_hyd_cv: 'Lever Hyd Control Valve',
  grease_fitting: 'Grease Fitting Points',
  pin_lock_artic: 'Pin & Lock Artic',
  artic_frame_lubrication: 'Artic Frame Lubrication',
  pinion_segment_circle: 'Pinion & Segment Circle',
  spacer_wear_plate_circle: 'Spacer & Wear Plate Circle',
  circle_motor: 'Circle Motor Gearbox',
  guide_blade: 'Guide Blade Play',
  rotary_lamp: 'Rotary Lamp Beacon',
  radio: 'Two-Way Radio',
  loto: 'LOTO Lockout Tagout',
  work_lamp: 'Work Lamp Headlights',
  battery: 'Battery Terminal & Box',
  pdu: 'PDU Power Dist. Unit',
  radiator: 'Radiator Coolant Level',
  eg_oil_level: 'Engine Oil Level',
  fuel_wiggins_pressureless_system: 'Fuel Wiggins System',
  vbelt_ac: 'V-Belt AC Compressor',
  tm_oil_level: 'T/M Transmission Oil',
  spider_joint: 'Spider Universal Joint',
  hyd_oil_level: 'Hydraulic Oil Level',
  hyd_oil_leaks: 'Hydraulic Oil Leaks Check',
  lh_steering_cylinder: 'LH Steering Cylinder',
  rh_steering_cylinder: 'RH Steering Cylinder',
  leaning_cylinder: 'Wheel Leaning Cylinder',
  blade_side_shift_cylinder: 'Blade Side Shift Cyl.',
  power_tilt_cylinder: 'Power Tilt Cylinder',
  drawbar_cylinder: 'Drawbar Lift Cylinder',
  lh_lift_cylinder: 'LH Lift Cylinder',
  rh_lift_cylinder: 'RH Lift Cylinder',
  lh_artic_cylinder: 'LH Artic Cylinder',
  rh_artic_cylinder: 'RH Artic Cylinder',
  ripper_cylinder: 'Ripper Shank Cylinder'
};

const filteredList = computed(() => {
  return plantStore.dailyArticList.filter(item => {
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

function hasAbnormal(item: DailyArtic): boolean {
  for (const key of Object.keys(articChecklistFields)) {
    if ((item as any)[key] === 'Action Needed' || (item as any)[key] === 'Abnormal') {
      return true;
    }
  }
  return false;
}

const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<string | null>(null);
const detailItem = ref<DailyArtic | null>(null);

const formData = ref<Omit<DailyArtic, 'id' | 'created_at'>>({
  timestamp: '',
  planning: '',
  inspection_type: 'P1 (Daily)',
  code_unit: '',
  egi: '',
  date: new Date().toISOString().split('T')[0],
  start_time: '07:30',
  finish_time: '09:00',
  total_hours: 1.5,
  hm: 0,
  air_pressure: 'Normal',
  lock_door: 'Normal',
  wiper: 'Normal',
  lever_hyd_cv: 'Normal',
  grease_fitting: 'Normal',
  pin_lock_artic: 'Normal',
  artic_frame_lubrication: 'Normal',
  pinion_segment_circle: 'Normal',
  spacer_wear_plate_circle: 'Normal',
  circle_motor: 'Normal',
  guide_blade: 'Normal',
  rotary_lamp: 'Normal',
  radio: 'Normal',
  loto: 'Normal',
  work_lamp: 'Normal',
  battery: 'Normal',
  pdu: 'Normal',
  radiator: 'Normal',
  eg_oil_level: 'Normal',
  fuel_wiggins_pressureless_system: 'Normal',
  vbelt_ac: 'Normal',
  tm_oil_level: 'Normal',
  spider_joint: 'Normal',
  hyd_oil_level: 'Normal',
  hyd_oil_leaks: 'Normal',
  lh_steering_cylinder: 'Normal',
  rh_steering_cylinder: 'Normal',
  leaning_cylinder: 'Normal',
  blade_side_shift_cylinder: 'Normal',
  power_tilt_cylinder: 'Normal',
  drawbar_cylinder: 'Normal',
  lh_lift_cylinder: 'Normal',
  rh_lift_cylinder: 'Normal',
  lh_artic_cylinder: 'Normal',
  rh_artic_cylinder: 'Normal',
  ripper_cylinder: 'Normal',
  pic: '',
  deviation: '',
  foto1: '',
  foto2: '',
  foto3: '',
  foto4: '',
  status: 'Submitted'
});

function setAllNormal() {
  for (const key of Object.keys(articChecklistFields)) {
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
  const defaultUnit = articUnits.value[0] || plantStore.codeUnits[0];

  formData.value = {
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    planning: 'Articulated Hauler 40-Point Daily Inspection Shift 1',
    inspection_type: 'P1 (Daily)',
    code_unit: defaultUnit ? defaultUnit.code_unit : '',
    egi: defaultUnit ? defaultUnit.egi : '',
    date: new Date().toISOString().split('T')[0],
    start_time: '07:30',
    finish_time: '09:00',
    total_hours: 1.5,
    hm: defaultUnit ? defaultUnit.current_hm : 0,
    air_pressure: 'Normal',
    lock_door: 'Normal',
    wiper: 'Normal',
    lever_hyd_cv: 'Normal',
    grease_fitting: 'Normal',
    pin_lock_artic: 'Normal',
    artic_frame_lubrication: 'Normal',
    pinion_segment_circle: 'Normal',
    spacer_wear_plate_circle: 'Normal',
    circle_motor: 'Normal',
    guide_blade: 'Normal',
    rotary_lamp: 'Normal',
    radio: 'Normal',
    loto: 'Normal',
    work_lamp: 'Normal',
    battery: 'Normal',
    pdu: 'Normal',
    radiator: 'Normal',
    eg_oil_level: 'Normal',
    fuel_wiggins_pressureless_system: 'Normal',
    vbelt_ac: 'Normal',
    tm_oil_level: 'Normal',
    spider_joint: 'Normal',
    hyd_oil_level: 'Normal',
    hyd_oil_leaks: 'Normal',
    lh_steering_cylinder: 'Normal',
    rh_steering_cylinder: 'Normal',
    leaning_cylinder: 'Normal',
    blade_side_shift_cylinder: 'Normal',
    power_tilt_cylinder: 'Normal',
    drawbar_cylinder: 'Normal',
    lh_lift_cylinder: 'Normal',
    rh_lift_cylinder: 'Normal',
    lh_artic_cylinder: 'Normal',
    rh_artic_cylinder: 'Normal',
    ripper_cylinder: 'Normal',
    pic: authStore.user?.nama || 'Agus Hendrawan',
    deviation: '',
    foto1: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500',
    foto2: '',
    foto3: '',
    foto4: '',
    status: authStore.isPlanner ? 'Approved' : 'Submitted'
  };
  showModal.value = true;
}

function openEditModal(item: DailyArtic) {
  isEditMode.value = true;
  editingId.value = item.id;
  formData.value = { ...item };
  showModal.value = true;
}

function viewDetail(item: DailyArtic) {
  detailItem.value = item;
}

function saveDailyArtic() {
  if (isEditMode.value && editingId.value) {
    plantStore.updateDailyArtic(editingId.value, formData.value);
  } else {
    plantStore.addDailyArtic(formData.value);
  }
  showModal.value = false;
}
</script>
