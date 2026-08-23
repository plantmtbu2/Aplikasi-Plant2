<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1">
          <span class="text-muted fw-light">Data Master /</span> Pencatatan Hour Meter (HM)
        </h4>
        <p class="text-muted mb-0 small">
          Catat dan monitor utilisasi jam kerja unit alat berat per shift dan per hari.
        </p>
      </div>

      <button class="btn btn-primary" @click="openAddModal">
        <i class="bx bx-plus me-1"></i> Input Log HM Baru
      </button>
    </div>

    <!-- Quick Stats Cards -->
    <div class="row g-3 mb-4">
      <div 
        v-for="unit in plantStore.codeUnits.slice(0, 4)" 
        :key="unit.id"
        class="col-6 col-lg-3"
      >
        <div class="card h-100 shadow-sm border-start border-primary border-3">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="fw-bold text-primary">{{ unit.code_unit }}</span>
              <span class="badge bg-label-secondary text-xs">{{ unit.type }}</span>
            </div>
            <div class="fs-4 fw-bold font-mono text-dark dark-style-text">
              {{ unit.current_hm.toLocaleString('id-ID') }} <small class="text-xs text-muted fw-normal">Jam</small>
            </div>
            <small class="text-muted text-xs d-block text-truncate mt-1">{{ unit.lokasi }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- HM Logs History Table -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold">Riwayat Log Hour Meter</h6>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" v-model="filterUnit" style="width: 180px;">
            <option value="">Semua Unit</option>
            <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">
              {{ u.code_unit }}
            </option>
          </select>
        </div>
      </div>

      <div class="table-responsive text-nowrap">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Tanggal & Shift</th>
              <th>Code Unit</th>
              <th>HM Start</th>
              <th>HM Finish</th>
              <th>Total Jam Operasi (Diff)</th>
              <th>PIC / Pengawas</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody class="table-border-bottom-0">
            <tr v-for="log in filteredLogs" :key="log.id">
              <td>
                <strong>{{ log.date }}</strong>
                <span class="badge ms-2" :class="log.shift === 'Day' ? 'bg-label-warning' : 'bg-label-info'">
                  {{ log.shift }} Shift
                </span>
              </td>
              <td>
                <span class="fw-bold text-primary">{{ log.code_unit }}</span>
              </td>
              <td class="font-mono">{{ log.hm_start.toLocaleString('id-ID') }}</td>
              <td class="font-mono">{{ log.hm_end.toLocaleString('id-ID') }}</td>
              <td>
                <span class="badge bg-label-success fs-6 font-mono">
                  +{{ log.hm_diff.toFixed(1) }} Jam
                </span>
              </td>
              <td>
                <span class="fw-semibold">{{ log.pic }}</span>
              </td>
              <td>
                <span class="text-muted small">{{ log.notes || '-' }}</span>
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">Belum ada riwayat log HM untuk unit ini.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Input HM -->
    <div class="modal fade show d-block" v-if="showModal" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold"><i class="bx bx-time-five me-1"></i> Input Log Hour Meter</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <form @submit.prevent="saveLog">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Code Unit</label>
                  <select class="form-select" v-model="formLog.code_unit" @change="onUnitSelect" required>
                    <option value="" disabled>Pilih Unit</option>
                    <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">
                      {{ u.code_unit }} ({{ u.egi }})
                    </option>
                  </select>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label required fw-semibold">Tanggal Log</label>
                  <input type="date" class="form-control" v-model="formLog.date" required />
                </div>

                <div class="col-6">
                  <label class="form-label required fw-semibold">HM Start</label>
                  <input type="number" step="0.1" class="form-control" v-model.number="formLog.hm_start" required />
                </div>

                <div class="col-6">
                  <label class="form-label required fw-semibold">HM Finish</label>
                  <input type="number" step="0.1" class="form-control" v-model.number="formLog.hm_end" required />
                </div>

                <div class="col-12">
                  <div class="alert alert-primary d-flex align-items-center gap-2 py-2 mb-0" v-if="formLog.hm_end >= formLog.hm_start">
                    <i class="bx bx-calculator fs-4"></i>
                    <div>
                      Total Running Hours Terhitung: <strong>{{ (formLog.hm_end - formLog.hm_start).toFixed(1) }} Jam</strong>
                    </div>
                  </div>
                </div>

                <div class="col-6">
                  <label class="form-label required fw-semibold">Shift</label>
                  <select class="form-select" v-model="formLog.shift">
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                  </select>
                </div>

                <div class="col-6">
                  <label class="form-label required fw-semibold">PIC / Pengawas</label>
                  <input type="text" class="form-control" v-model="formLog.pic" required />
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Catatan Operasional</label>
                  <textarea class="form-control" rows="2" placeholder="Catatan lokasi/kendala..." v-model="formLog.notes"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan Log HM</button>
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

const plantStore = usePlantStore();
const authStore = useAuthStore();

const filterUnit = ref('');
const showModal = ref(false);

const filteredLogs = computed(() => {
  if (!filterUnit.value) return plantStore.hmLogs;
  return plantStore.hmLogs.filter(l => l.code_unit === filterUnit.value);
});

const formLog = ref({
  code_unit: '',
  date: new Date().toISOString().split('T')[0],
  hm_start: 0,
  hm_end: 0,
  hm_diff: 0,
  shift: 'Day' as 'Day' | 'Night',
  pic: authStore.user?.nama || 'Agus Hendrawan',
  notes: ''
});

function openAddModal() {
  const defaultUnit = plantStore.codeUnits[0];
  formLog.value = {
    code_unit: defaultUnit ? defaultUnit.code_unit : '',
    date: new Date().toISOString().split('T')[0],
    hm_start: defaultUnit ? defaultUnit.current_hm : 0,
    hm_end: defaultUnit ? defaultUnit.current_hm + 10 : 0,
    hm_diff: 10,
    shift: 'Day',
    pic: authStore.user?.nama || 'Agus Hendrawan',
    notes: ''
  };
  showModal.value = true;
}

function onUnitSelect() {
  const u = plantStore.codeUnits.find(unit => unit.code_unit === formLog.value.code_unit);
  if (u) {
    formLog.value.hm_start = u.current_hm;
    formLog.value.hm_end = u.current_hm + 10;
  }
}

function saveLog() {
  const diff = Math.max(0, formLog.value.hm_end - formLog.value.hm_start);
  plantStore.addHmLog({
    code_unit: formLog.value.code_unit,
    date: formLog.value.date,
    hm_start: formLog.value.hm_start,
    hm_end: formLog.value.hm_end,
    hm_diff: diff,
    shift: formLog.value.shift,
    pic: formLog.value.pic,
    notes: formLog.value.notes
  });
  showModal.value = false;
}
</script>
