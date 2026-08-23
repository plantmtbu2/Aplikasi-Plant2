<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1">
          <span class="text-muted fw-light">Laporan /</span> Export Laporan Plant 2
        </h4>
        <p class="text-muted mb-0 small">
          Pusat pelaporan berkala: Laporan Daily Per Hari, Laporan Daily Per Bulan, dan Laporan Status BAP dengan fitur Export Excel & PDF.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-success" @click="exportToExcel">
          <i class="bx bxs-file-export me-1"></i> Export Excel (.xlsx)
        </button>
        <button class="btn btn-danger" @click="exportToPdf">
          <i class="bx bxs-file-pdf me-1"></i> Export PDF
        </button>
      </div>
    </div>

    <!-- Filter Control Card -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-3">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Jenis Laporan</label>
            <select class="form-select" v-model="reportType">
              <option value="daily_harian">Laporan Daily Per Hari</option>
              <option value="daily_bulanan">Laporan Daily Per Bulan</option>
              <option value="status_bap">Laporan Status BAP</option>
              <option value="backlog_parts">Laporan Status Backlog & Spare Part</option>
            </select>
          </div>

          <div class="col-6 col-md-2">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Tanggal Awal</label>
            <input type="date" class="form-control" v-model="startDate" />
          </div>

          <div class="col-6 col-md-2">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Tanggal Akhir</label>
            <input type="date" class="form-control" v-model="endDate" />
          </div>

          <div class="col-6 col-md-2">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Code Unit</label>
            <select class="form-select" v-model="filterUnit">
              <option value="">Semua Unit</option>
              <option v-for="u in plantStore.codeUnits" :key="u.id" :value="u.code_unit">{{ u.code_unit }}</option>
            </select>
          </div>

          <div class="col-6 col-md-3">
            <label class="form-label text-xs fw-bold text-muted text-uppercase">Tipe Unit</label>
            <select class="form-select" v-model="filterType">
              <option value="">Semua Tipe (Rigid & Artic)</option>
              <option value="Rigid">Hanya Rigid Dump Truck</option>
              <option value="Artic">Hanya Artic Hauler</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Preview Section (Printable Container) -->
    <div class="card shadow-sm" id="report-print-area">
      <!-- Report Header -->
      <div class="card-header border-bottom py-3 d-flex justify-content-between align-items-center bg-light dark-bg">
        <div>
          <h5 class="fw-bold mb-1 text-primary">
            {{ getReportTitle() }}
          </h5>
          <span class="text-muted small">
            Periode: <strong>{{ startDate }}</strong> s/d <strong>{{ endDate }}</strong> • Filter: <strong>{{ filterUnit || 'Semua Unit' }}</strong>
          </span>
        </div>
        <div class="text-end">
          <span class="badge bg-label-primary font-mono">Total Data: {{ reportDataCount }} Records</span>
        </div>
      </div>

      <!-- Report View 1: Daily Harian / Bulanan -->
      <div class="table-responsive text-nowrap" v-if="reportType === 'daily_harian' || reportType === 'daily_bulanan'">
        <table class="table table-bordered table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Code Unit</th>
              <th>EGI / Tipe</th>
              <th>Inspection Type</th>
              <th>HM</th>
              <th>Durasi</th>
              <th>Temuan Deviasi</th>
              <th>Status</th>
              <th>PIC</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in combinedDailyData" :key="row.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ row.date }}</td>
              <td><strong class="text-primary">{{ row.code_unit }}</strong></td>
              <td>{{ row.egi }}</td>
              <td>{{ row.inspection_type }}</td>
              <td class="font-mono">{{ row.hm }}</td>
              <td>{{ row.total_hours }}h ({{ row.start_time }}-{{ row.finish_time }})</td>
              <td class="text-truncate" style="max-width: 250px;">{{ row.deviation || 'Normal' }}</td>
              <td>
                <span class="badge" :class="row.status === 'Approved' ? 'bg-label-success' : 'bg-label-warning'">
                  {{ row.status }}
                </span>
              </td>
              <td>{{ row.pic }}</td>
            </tr>
            <tr v-if="combinedDailyData.length === 0">
              <td colspan="10" class="text-center py-5 text-muted">Tidak ada data untuk periode dan filter yang dipilih.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Report View 2: Status BAP -->
      <div class="table-responsive text-nowrap" v-else-if="reportType === 'status_bap'">
        <table class="table table-bordered table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>Timestamp</th>
              <th>No. MO</th>
              <th>Code Unit</th>
              <th>Plan Action</th>
              <th>Deskripsi BAP</th>
              <th>Lokasi</th>
              <th>Durasi</th>
              <th>Status BAP</th>
              <th>PIC</th>
              <th>Approved By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(bap, idx) in filteredBapData" :key="bap.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ bap.timestamp }}</td>
              <td><strong class="font-mono text-primary">{{ bap.mo }}</strong></td>
              <td><strong>{{ bap.code_unit }}</strong></td>
              <td>{{ bap.plan_action }}</td>
              <td class="text-truncate" style="max-width: 200px;">{{ bap.deskripsi_bap }}</td>
              <td>{{ bap.lokasi_action_bap }}</td>
              <td>{{ bap.durasi_perbaikan }}</td>
              <td>
                <span class="badge" :class="{
                  'bg-label-warning': bap.status === 'Open' || bap.status === 'Draft',
                  'bg-label-info': bap.status === 'Approved',
                  'bg-label-success': bap.status === 'Completed',
                  'bg-label-danger': bap.status === 'Rejected'
                }">
                  {{ bap.status }}
                </span>
              </td>
              <td>{{ bap.pic }}</td>
              <td class="text-success fw-bold">{{ bap.approved_by || '-' }}</td>
            </tr>
            <tr v-if="filteredBapData.length === 0">
              <td colspan="11" class="text-center py-5 text-muted">Tidak ada data BAP untuk filter yang dipilih.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Report View 3: Backlog Parts -->
      <div class="table-responsive text-nowrap" v-else-if="reportType === 'backlog_parts'">
        <table class="table table-bordered table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>MO Backlog</th>
              <th>Code Unit</th>
              <th>Deskripsi Masalah</th>
              <th>Part Number</th>
              <th>Part Description</th>
              <th>Qty</th>
              <th>Reservasi</th>
              <th>Prioritas</th>
              <th>Status</th>
              <th>PIC</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(bk, idx) in filteredBacklogData" :key="bk.id">
              <td>{{ idx + 1 }}</td>
              <td><strong class="font-mono text-primary">{{ bk.mo_backlog }}</strong></td>
              <td><strong>{{ bk.code_unit }}</strong></td>
              <td>{{ bk.backlog_description }}</td>
              <td><code class="text-danger fw-bold">{{ bk.part_number }}</code></td>
              <td>{{ bk.part_description }}</td>
              <td>{{ bk.qty }}</td>
              <td>{{ bk.reservasi || '-' }}</td>
              <td><span class="badge bg-danger">{{ bk.priority || 'Medium' }}</span></td>
              <td><span class="badge bg-label-warning">{{ bk.status }}</span></td>
              <td>{{ bk.pic }}</td>
            </tr>
            <tr v-if="filteredBacklogData.length === 0">
              <td colspan="11" class="text-center py-5 text-muted">Tidak ada data Backlog.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Signatures -->
      <div class="card-body border-top mt-3">
        <div class="row text-center pt-3">
          <div class="col-4">
            <span class="text-xs text-muted">Dibuat Oleh (Maintenance)</span>
            <div class="mt-4 fw-bold">Agus Hendrawan</div>
            <span class="text-xs text-muted">NRP: 80219842</span>
          </div>
          <div class="col-4">
            <span class="text-xs text-muted">Diperiksa Oleh (Planner)</span>
            <div class="mt-4 fw-bold">Bambang Wijaya</div>
            <span class="text-xs text-muted">NRP: 70192314</span>
          </div>
          <div class="col-4">
            <span class="text-xs text-muted">Disetujui (Plant Superintendent)</span>
            <div class="mt-4 fw-bold">Rahmat Hidayat, S.T.</div>
            <span class="text-xs text-muted">NRP: 60104521</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlantStore } from '../stores/plant';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const plantStore = usePlantStore();

const reportType = ref('daily_harian');
const startDate = ref(new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);
const filterUnit = ref('');
const filterType = ref('');

function getReportTitle(): string {
  if (reportType.value === 'daily_harian') return 'LAPORAN INSPEKSI DAILY RIGID & ARTIC PER HARI';
  if (reportType.value === 'daily_bulanan') return 'LAPORAN REKAPITULASI PLAN DAILY BULANAN PLANT 2';
  if (reportType.value === 'status_bap') return 'LAPORAN REGISTER STATUS BERITA ACARA PEMERIKSAAN (BAP)';
  if (reportType.value === 'backlog_parts') return 'LAPORAN STATUS BACKLOG & KEBUTUHAN SPARE PARTS';
  return 'LAPORAN PLANT 2';
}

const combinedDailyData = computed(() => {
  let list: any[] = [];
  if (!filterType.value || filterType.value === 'Rigid') {
    list = list.concat(plantStore.dailyRigidList);
  }
  if (!filterType.value || filterType.value === 'Artic') {
    list = list.concat(plantStore.dailyArticList);
  }

  return list.filter(item => {
    const matchUnit = !filterUnit.value || item.code_unit === filterUnit.value;
    const matchDate = (!startDate.value || item.date >= startDate.value) &&
                      (!endDate.value || item.date <= endDate.value);
    return matchUnit && matchDate;
  });
});

const filteredBapData = computed(() => {
  return plantStore.baps.filter(b => {
    const matchUnit = !filterUnit.value || b.code_unit === filterUnit.value;
    return matchUnit;
  });
});

const filteredBacklogData = computed(() => {
  return plantStore.backlogs.filter(b => {
    const matchUnit = !filterUnit.value || b.code_unit === filterUnit.value;
    return matchUnit;
  });
});

const reportDataCount = computed(() => {
  if (reportType.value === 'daily_harian' || reportType.value === 'daily_bulanan') return combinedDailyData.value.length;
  if (reportType.value === 'status_bap') return filteredBapData.value.length;
  return filteredBacklogData.value.length;
});

// Export to Excel using XLSX
function exportToExcel() {
  let dataToExport: any[] = [];
  let sheetName = 'Report_Plant2';

  if (reportType.value === 'daily_harian' || reportType.value === 'daily_bulanan') {
    sheetName = 'Daily_Inspection';
    dataToExport = combinedDailyData.value.map((item, idx) => ({
      No: idx + 1,
      Tanggal: item.date,
      Code_Unit: item.code_unit,
      EGI: item.egi,
      Inspection_Type: item.inspection_type,
      Planning: item.planning,
      HM: item.hm,
      Start_Time: item.start_time,
      Finish_Time: item.finish_time,
      Total_Hours: item.total_hours,
      Deviation: item.deviation || 'Normal',
      Status: item.status,
      PIC: item.pic
    }));
  } else if (reportType.value === 'status_bap') {
    sheetName = 'Status_BAP';
    dataToExport = filteredBapData.value.map((b, idx) => ({
      No: idx + 1,
      Timestamp: b.timestamp,
      MO: b.mo,
      Code_Unit: b.code_unit,
      HM: b.hm,
      Plan_Action: b.plan_action,
      Deskripsi_BAP: b.deskripsi_bap,
      Lokasi: b.lokasi_action_bap,
      Durasi: b.durasi_perbaikan,
      Kebutuhan_Part: b.kebutuhan_part,
      Status: b.status,
      PIC: b.pic,
      Approved_By: b.approved_by || '-'
    }));
  } else {
    sheetName = 'Backlog_Parts';
    dataToExport = filteredBacklogData.value.map((b, idx) => ({
      No: idx + 1,
      MO_Backlog: b.mo_backlog,
      Code_Unit: b.code_unit,
      Deskripsi: b.backlog_description,
      Part_Number: b.part_number,
      Part_Description: b.part_description,
      Qty: b.qty,
      Reservasi: b.reservasi,
      Prioritas: b.priority,
      Status: b.status,
      PIC: b.pic
    }));
  }

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`);

  Swal.fire({
    icon: 'success',
    title: 'Export Excel Berhasil!',
    text: `File ${sheetName}.xlsx telah diunduh.`,
    timer: 2000,
    showConfirmButton: false
  });
}

// Export to PDF using jsPDF + autoTable
function exportToPdf() {
  const doc = new jsPDF('landscape');
  doc.setFontSize(14);
  doc.text(getReportTitle(), 14, 15);
  doc.setFontSize(10);
  doc.text(`Periode: ${startDate.value} s/d ${endDate.value} | Unit: ${filterUnit.value || 'Semua'} | Generated: ${new Date().toLocaleString()}`, 14, 22);

  if (reportType.value === 'daily_harian' || reportType.value === 'daily_bulanan') {
    const head = [['No', 'Tanggal', 'Unit', 'EGI', 'Tipe', 'HM', 'Hours', 'Deviasi', 'Status', 'PIC']];
    const body = combinedDailyData.value.map((r, i) => [
      i + 1,
      r.date,
      r.code_unit,
      r.egi,
      r.inspection_type,
      r.hm,
      r.total_hours,
      (r.deviation || 'Normal').substring(0, 30),
      r.status,
      r.pic
    ]);
    autoTable(doc, { head, body, startY: 28 });
  } else if (reportType.value === 'status_bap') {
    const head = [['No', 'MO', 'Unit', 'HM', 'Plan Action', 'Lokasi', 'Durasi', 'Status', 'PIC', 'Approved']];
    const body = filteredBapData.value.map((b, i) => [
      i + 1,
      b.mo,
      b.code_unit,
      b.hm,
      (b.plan_action || '').substring(0, 30),
      b.lokasi_action_bap,
      b.durasi_perbaikan,
      b.status,
      b.pic,
      b.approved_by || '-'
    ]);
    autoTable(doc, { head, body, startY: 28 });
  } else {
    const head = [['No', 'MO Backlog', 'Unit', 'Deskripsi', 'Part No', 'Part Desc', 'Qty', 'Status', 'PIC']];
    const body = filteredBacklogData.value.map((b, i) => [
      i + 1,
      b.mo_backlog,
      b.code_unit,
      (b.backlog_description || '').substring(0, 25),
      b.part_number,
      (b.part_description || '').substring(0, 25),
      b.qty,
      b.status,
      b.pic
    ]);
    autoTable(doc, { head, body, startY: 28 });
  }

  doc.save(`${reportType.value}_${new Date().toISOString().split('T')[0]}.pdf`);

  Swal.fire({
    icon: 'success',
    title: 'Export PDF Berhasil!',
    text: 'Dokumen PDF laporan telah dibuat dan diunduh.',
    timer: 2000,
    showConfirmButton: false
  });
}
</script>
