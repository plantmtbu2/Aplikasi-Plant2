<template>
  <div class="space-y-4">
    <!-- Welcome Header & Quick Action Row -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold mb-1 text-dark dark-style-text">
          <span class="text-muted fw-light">Dashboard /</span> Ringkasan Operasional Plant 2
        </h4>
        <p class="text-muted mb-0 small">
          Selamat datang kembali, <strong>{{ authStore.user?.nama }}</strong> ({{ authStore.user?.role }} - {{ authStore.user?.nrp }}). Sistem pemantauan inspeksi dan keandalan alat berat.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <router-link to="/plan/bap" class="btn btn-warning btn-sm text-dark fw-semibold shadow-sm">
          <i class="bx bx-plus-circle me-1"></i> BAP Baru
        </router-link>
        <router-link to="/plan/daily-rigid" class="btn btn-primary btn-sm shadow-sm">
          <i class="bx bx-check-shield me-1"></i> Daily Rigid
        </router-link>
        <router-link to="/plan/daily-artic" class="btn btn-info btn-sm text-white shadow-sm">
          <i class="bx bx-wrench me-1"></i> Daily Artic
        </router-link>
      </div>
    </div>

    <!-- Bento Metric Cards (4 Columns) -->
    <div class="row g-3 g-xl-4 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Total BAP"
          :value="plantStore.totalBaps"
          icon="bx-file-blank"
          color="success"
          trend="+12%"
          :trend-positive="true"
          :subtitle="`${plantStore.openBaps} Open • ${plantStore.approvedBaps} Approved`"
        />
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Plan Daily"
          :value="plantStore.totalDailyPlanToday"
          icon="bx-calendar-check"
          color="primary"
          trend="Active"
          :trend-positive="true"
          :subtitle="`Rigid & Artic Inspeksi Shift 1 & 2`"
        />
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Average HM"
          :value="averageHmFormatted"
          icon="bx-time-five"
          color="info"
          trend="Latest"
          :trend-positive="true"
          :subtitle="`${plantStore.operatingUnits} Unit Beroperasi Normal`"
        />
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Backlogs"
          :value="plantStore.pendingBacklogs"
          icon="bx-error-circle"
          color="danger"
          trend="High"
          :trend-positive="false"
          :subtitle="`Menunggu Part & Jadwal Service`"
        />
      </div>
    </div>

    <!-- Bento Middle Grid: Interactive Chart (8 cols) & Monthly Achievement Progress (4 cols) -->
    <div class="row g-4 mb-4">
      <!-- Bento Chart Card -->
      <div class="col-12 col-xl-8">
        <div class="card h-100 bento-card shadow-sm border-0">
          <div class="card-header border-0 pb-0 d-flex align-items-center justify-content-between">
            <div>
              <h5 class="fw-bold mb-0 text-dark dark-style-text">Grafik Pencapaian Plan Daily</h5>
              <small class="text-muted">Tren realisasi inspeksi alat berat vs target</small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <select 
                class="form-select form-select-sm border-0 bg-light dark-bg text-xs fw-semibold" 
                style="width: auto;"
                v-model="chartPeriod"
              >
                <option value="7days">7 Hari Terakhir</option>
                <option value="monthly">Performa Bulanan</option>
              </select>
            </div>
          </div>
          <div class="card-body pt-3">
            <AchievementChart
              v-if="chartPeriod === '7days'"
              :labels="dailyChartLabels"
              :rigid-data="dailyChartRigid"
              :artic-data="dailyChartArtic"
              :target-data="dailyChartTarget"
            />
            <AchievementChart
              v-else
              :labels="monthlyChartLabels"
              :rigid-data="monthlyChartRigid"
              :artic-data="monthlyChartArtic"
              :target-data="monthlyChartTarget"
            />
          </div>
        </div>
      </div>

      <!-- Bento Monthly Progress & Alert Card -->
      <div class="col-12 col-xl-4">
        <div class="card h-100 bento-card shadow-sm border-0">
          <div class="card-header border-0 pb-0 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0 text-dark dark-style-text">Pencapaian Bulanan</h5>
            <span class="badge bg-label-primary text-xs">Plant 2 Target</span>
          </div>
          <div class="card-body pt-3 d-flex flex-column justify-content-between">
            <div class="space-y-4">
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center text-xs mb-1">
                  <span class="text-muted fw-semibold">Januari 2024</span>
                  <span class="fw-bold text-dark dark-style-text">88%</span>
                </div>
                <div class="progress-bento">
                  <div class="h-100 rounded-pill bg-primary" style="width: 88%"></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center text-xs mb-1">
                  <span class="text-muted fw-semibold">Februari 2024</span>
                  <span class="fw-bold text-dark dark-style-text">72%</span>
                </div>
                <div class="progress-bento">
                  <div class="h-100 rounded-pill bg-success" style="width: 72%"></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center text-xs mb-1">
                  <span class="text-muted fw-semibold">Maret 2024</span>
                  <span class="fw-bold text-dark dark-style-text">45%</span>
                </div>
                <div class="progress-bento">
                  <div class="h-100 rounded-pill bg-warning" style="width: 45%"></div>
                </div>
              </div>
            </div>

            <!-- Bento Callout Alert Box -->
            <div class="bento-alert-box mt-4">
              <div class="d-flex align-items-center gap-2 mb-1">
                <div class="w-2 h-2 rounded-circle bg-warning" style="width: 8px; height: 8px;"></div>
                <span class="text-xs fw-bold text-warning">Alert: Low Maintenance Efficiency</span>
              </div>
              <p class="text-xs mb-0 text-muted lh-sm">
                Pencapaian unit Artic di lokasi North Pit mengalami penurunan HM drastis sebesar 14%. Prioritaskan pengecekan hydraulic seal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bento Bottom Grid: Tables Row (7 cols BAP + 5 cols Inspeksi Terbaru) -->
    <div class="row g-4">
      <!-- Berita Acara Pemeriksaan (BAP) Terkini -->
      <div class="col-12 col-xl-7">
        <div class="card h-100 bento-card shadow-sm border-0 overflow-hidden">
          <div class="card-header border-0 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bx bx-file text-warning fs-4"></i>
              <h5 class="card-title mb-0 fw-bold text-dark dark-style-text">Berita Acara Pemeriksaan (BAP) Terkini</h5>
            </div>
            <router-link to="/plan/bap" class="btn btn-sm btn-label-primary">
              Lihat Semua <i class="bx bx-chevron-right"></i>
            </router-link>
          </div>
          <div class="table-responsive text-nowrap">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Code Unit</th>
                  <th>HM</th>
                  <th>Action Plan</th>
                  <th>PIC</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody class="table-border-bottom-0">
                <tr v-for="bap in plantStore.baps.slice(0, 4)" :key="bap.id">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar avatar-sm flex-shrink-0">
                        <img 
                          :src="bap.foto || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100'" 
                          alt="BAP" 
                          class="rounded"
                        />
                      </div>
                      <div>
                        <strong>{{ bap.code_unit }}</strong>
                        <div class="text-xs text-muted font-mono">{{ bap.mo || 'No MO' }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="font-mono fw-semibold">{{ bap.hm ? Number(bap.hm).toLocaleString('id-ID') : '-' }}</span>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 200px;" :title="bap.plan_action">
                      {{ bap.plan_action }}
                    </div>
                    <small class="text-muted text-xs">{{ bap.durasi_perbaikan }}</small>
                  </td>
                  <td>
                    <small class="fw-semibold">{{ bap.pic }}</small>
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
                </tr>
                <tr v-if="plantStore.baps.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">Belum ada data BAP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Plan Daily Status Ringkasan -->
      <div class="col-12 col-xl-5">
        <div class="card h-100 bento-card shadow-sm border-0 overflow-hidden">
          <div class="card-header border-0 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bx bx-check-circle text-success fs-4"></i>
              <h5 class="card-title mb-0 fw-bold text-dark dark-style-text">Inspeksi Daily Terbaru</h5>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm btn-label-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Pilih Tipe
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><router-link class="dropdown-item" to="/plan/daily-rigid">Daily Rigid</router-link></li>
                <li><router-link class="dropdown-item" to="/plan/daily-artic">Daily Artic</router-link></li>
              </ul>
            </div>
          </div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li 
                v-for="rigid in plantStore.dailyRigidList.slice(0, 3)" 
                :key="rigid.id"
                class="list-group-item d-flex justify-content-between align-items-center py-3 px-4 border-bottom"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="bento-icon-wrapper bg-label-primary flex-shrink-0" style="width: 2.25rem; height: 2.25rem;">
                    <i class="bx bxs-truck fs-5 text-primary"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 fw-bold">{{ rigid.code_unit }} ({{ rigid.egi }})</h6>
                    <small class="text-muted">Rigid Daily • PIC: {{ rigid.pic }} • {{ rigid.date }}</small>
                  </div>
                </div>
                <div class="text-end">
                  <span 
                    class="badge"
                    :class="rigid.status === 'Approved' ? 'bg-label-success' : 'bg-label-warning'"
                  >
                    {{ rigid.status }}
                  </span>
                  <div class="text-xs text-muted mt-1">{{ rigid.total_hours }} Jam</div>
                </div>
              </li>

              <li 
                v-for="artic in plantStore.dailyArticList.slice(0, 2)" 
                :key="artic.id"
                class="list-group-item d-flex justify-content-between align-items-center py-3 px-4 border-bottom"
              >
                <div class="d-flex align-items-center gap-3">
                  <div class="bento-icon-wrapper bg-label-info flex-shrink-0" style="width: 2.25rem; height: 2.25rem;">
                    <i class="bx bx-cog fs-5 text-info"></i>
                  </div>
                  <div>
                    <h6 class="mb-0 fw-bold">{{ artic.code_unit }} ({{ artic.egi }})</h6>
                    <small class="text-muted">Artic 40-Point • PIC: {{ artic.pic }} • {{ artic.date }}</small>
                  </div>
                </div>
                <div class="text-end">
                  <span 
                    class="badge"
                    :class="artic.status === 'Approved' ? 'bg-label-success' : 'bg-label-warning'"
                  >
                    {{ artic.status }}
                  </span>
                  <div class="text-xs text-muted mt-1">{{ artic.total_hours }} Jam</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePlantStore } from '../stores/plant';
import StatCard from '../components/StatCard.vue';
import AchievementChart from '../components/AchievementChart.vue';

const authStore = useAuthStore();
const plantStore = usePlantStore();
const chartPeriod = ref<'7days' | 'monthly'>('7days');

const averageHmFormatted = computed(() => {
  if (plantStore.hmLogs.length === 0) {
    if (plantStore.codeUnits.length > 0) {
      const avg = Math.round(plantStore.codeUnits.reduce((acc, u) => acc + u.current_hm, 0) / plantStore.codeUnits.length);
      return avg.toLocaleString('id-ID');
    }
    return '4,821';
  }
  const total = plantStore.hmLogs.reduce((acc, curr) => acc + (curr.hm_end || curr.hm_diff || 0), 0);
  const avg = Math.round(total / plantStore.hmLogs.length);
  return avg.toLocaleString('id-ID');
});

// Daily Chart data mapping
const dailyChartLabels = computed(() => plantStore.achievementDailyData.map(d => d.date));
const dailyChartRigid = computed(() => plantStore.achievementDailyData.map(d => d.actual_rigid));
const dailyChartArtic = computed(() => plantStore.achievementDailyData.map(d => d.actual_artic));
const dailyChartTarget = computed(() => plantStore.achievementDailyData.map(d => d.target));

// Monthly Chart data mapping
const monthlyChartLabels = computed(() => plantStore.achievementMonthlyData.map(m => m.month));
const monthlyChartRigid = computed(() => plantStore.achievementMonthlyData.map(m => m.actual_rigid));
const monthlyChartArtic = computed(() => plantStore.achievementMonthlyData.map(m => m.actual_artic));
const monthlyChartTarget = computed(() => plantStore.achievementMonthlyData.map(m => m.target));
</script>

<style scoped>
.dark-style .dark-style-text {
  color: #e4e6f6 !important;
}
.space-y-4 > * + * {
  margin-top: 1.5rem;
}
</style>
